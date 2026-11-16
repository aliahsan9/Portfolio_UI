# The pages a SQL Server query actually touches

![SQL Server performance](assets/blogs/images/sql-performance.avif)

A query is fast when the storage engine touches few pages and the optimizer's guess about how many rows those pages hold is close to the truth. Everything else in this article is a consequence of those two facts.

I ship this on ASP.NET Core APIs that use EF Core against SQL Server. The LINQ is the easy part. The design shows itself in `SET STATISTICS IO`, in the gap between estimated rows and actual rows, and in the SQL text `ToQueryString()` prints. Milliseconds from someone else's server do not transfer. Page size, histogram shape, and round trips do.

**Stack:** SQL Server rowstore, EF Core, ASP.NET Core.

## A logical read is one 8 KiB page

The database file is a sequence of pages, numbered from 0. The engine reads and writes whole pages. A page is 8 KiB, 8,192 bytes, with a 96-byte header (page id, page type, the object and index that own it). At the end of the page sits a slot array: 2 bytes per row, each slot holding the byte offset of that row. Rows are not physically stored in key order. The slot array is. Deletes leave holes, and the next insert that fits falls into a hole. This is the [page and extent architecture](https://learn.microsoft.com/en-us/sql/relational-databases/pages-and-extents-architecture-guide).

An extent is eight physically contiguous pages, 64 KiB. Space is allocated in extents. I/O is still counted in pages.

![A data page has a 96-byte header, rows, free space, and a slot array at the end. An extent is eight pages.](assets/blogs/images/sql-page.svg)

*Figure 1. The slot array is the logical order. The arithmetic on the right is what I substitute my own average row size into.*

Take an on-page row of 200 bytes, header included. That number is an assumption, not a property of `Orders`. The slot costs 2 more bytes:

```text
usable          = 8192 - 96 = 8096
per row         = 200 + 2   = 202
rows per page   = 8096 / 202 = 40, with 16 bytes left over
2,000,000 rows  = 50,000 pages
50,000 * 8 KiB  = 390.6 MiB of leaf
```

A scan of that leaf is about 50,000 logical reads. A point seek is one read per level of the tree. Those two counts are the whole performance story for a single table, before anyone mentions a framework.

Read the real numbers. `avg_record_size_in_bytes` is NULL in `LIMITED` mode, so this asks for `SAMPLED`. `index_id` 1 is the clustered index.

```sql
SELECT
    index_depth,
    page_count,
    record_count,
    avg_record_size_in_bytes,
    avg_page_space_used_in_percent
FROM sys.dm_db_index_physical_stats(
    DB_ID(), OBJECT_ID(N'dbo.Orders'), 1, NULL, N'SAMPLED');
```

`index_depth` is the number of levels. `page_count` is the scan. If your average row is 80 bytes, redo the division. The diagram's 200 bytes is only there so the later figures have a stable example.

Large values do not live on that page. `varchar(max)`, `nvarchar(max)`, and the other LOB types go to LOB pages, and a single column can walk that tree more than once. `SET STATISTICS IO` then reports `lob logical reads` on top of the data-page reads, which the [STATISTICS IO](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-statistics-io-transact-sql) page calls out. A list endpoint that returns a note column is paying for a second structure. The detail endpoint is the one that needs it.

## Seek down the B+ tree, then walk the leaves

Rowstore indexes are B+ trees. Microsoft's [index architecture guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide) is explicit that the structure is a B+ tree, even where older docs say "B-tree": the leaf holds the data, and each level is a doubly linked list. Douglas Comer described that shape in 1979. The linked leaves are why a range does not climb back to the root for every row. ["The Ubiquitous B-Tree"](https://dl.acm.org/doi/10.1145/356770.356776), ACM Computing Surveys 11(2).

In a clustered index the leaf pages are the table. There is one clustered index per table. A heap is the table with no clustered index, and the engine finds a heap row by a row id: file, page, and slot. I put a clustered index on the table.

![A seek descends root, intermediate, and one leaf. An ordered scan then follows the doubly linked leaves.](assets/blogs/images/sql-btree.svg)

*Figure 2. Green is the seek. The amber links are the ordered scan. Height here is three levels, under a fanout I state.*

An intermediate row for a 4-byte `int` key is the key, a child page pointer (the page id is 4 bytes plus a 2-byte file id, so 6), and a little row overhead. Call that about 20 bytes. `8096 / 20` is about 400 keys on an intermediate page. That fanout is the assumption to replace, the way 200 bytes was:

```text
50,000 leaf pages / 400 = 125 pages on the next level up
125 / 400            -> one root page
levels               = root + intermediate + leaf = 3
```

A point seek touches 3 pages. An ordered scan of the leaf touches about 50,000. `index_depth` from the DMV above is the real height. Use it.

`logical reads` in `SET STATISTICS IO` is the number of pages read from the buffer pool, whether or not they were already cached. `physical reads` is how many of those had to come off disk. `read-ahead reads` is pages the engine prefetched into the pool. Run the same query twice and the second run often shows `physical reads 0` with the same `logical reads`. The query did not get cheaper. The pages were warm. I compare logical reads.

The clustered key is copied into every nonclustered index on the table. The [design guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide) lists the properties that follow from that, and I treat them as a checklist when I pick the key:

| Property | What it costs when you miss it |
|---|---|
| Narrow | The key is stored again in every nonclustered index. A 16-byte `uniqueidentifier` is four times an `int` and twice a `bigint`, on every index, at every level. Fanout drops, so depth arrives sooner. |
| Unique | If the clustered index is not unique, the engine adds a 4-byte uniqueifier, and that uniqueifier is copied into every nonclustered index too. |
| Ever-increasing | Inserts land on the last leaf page. A random key inserts into the middle of a full page, the page splits, and both resulting pages are about half full. Same rows, more pages, more of the buffer pool. |
| Immutable | Changing the clustered key rewrites every nonclustered index that holds it. |
| Not null | A nullable key carries a null bitmap, 3 or 4 extra bytes, again on every index. |
| Fixed width | A `varchar` key spends 2 extra bytes per value against a fixed type of the same contents. |

A non-nullable `int` or `bigint` populated by `IDENTITY` or a sequence, and never updated, has all six. A `PRIMARY KEY` is clustered by default. I do not issue a second `CREATE CLUSTERED INDEX` on that column. If the key I want is not the primary key, I declare the primary key `NONCLUSTERED` and cluster on the key that has the properties. `sys.indexes.index_id = 1` is the clustered index. `index_id = 0` is a heap.

```sql
SELECT i.name, i.index_id, i.type_desc, ic.key_ordinal, c.name AS column_name
FROM sys.indexes AS i
JOIN sys.index_columns AS ic
  ON ic.object_id = i.object_id AND ic.index_id = i.index_id
JOIN sys.columns AS c
  ON c.object_id = ic.object_id AND c.column_id = ic.column_id
WHERE i.object_id = OBJECT_ID(N'dbo.Orders')
ORDER BY i.index_id, ic.key_ordinal;
```

## The nonclustered leaf does not hold the row

A nonclustered leaf stores the key columns, any `INCLUDE` columns, and a row locator. If the table is clustered, the locator is the clustered key. If the table is a heap, the locator is the row id. For a nonunique nonclustered index the locator is appended to the key, so it participates in order. For a unique nonclustered index it is stored as an included column. The engine never stores the same column twice. That table is in the [index architecture guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide), and it surprises people who `INCLUDE` the clustered key: it was already there.

`INCLUDE` columns are stored on the leaf only. They do not widen the root or the intermediate pages, so the fanout of the upper levels stays the fanout of the key. They also do not define order. Putting a column in the key to avoid a lookup, when no query ranges or sorts on it, spends fanout on a column that only needed to be present.

![A nonclustered seek that still needs Total does one clustered lookup per row. INCLUDE (Total) stops at the nonclustered leaf.](assets/blogs/images/sql-lookup.svg)

*Figure 3. `OrderId` is the clustered key, so it is already in the nonclustered leaf. `Total` is not, until `INCLUDE` puts it there.*

```sql
CREATE NONCLUSTERED INDEX IX_Orders_CustomerId
ON dbo.Orders (CustomerId)
INCLUDE (Total, Status);
```

`SELECT OrderId, Total FROM dbo.Orders WHERE CustomerId = @CustomerId` can now be answered from that leaf. The plan has no Key Lookup. The same index without `Total` seeks the nonclustered leaf and then, for every match, descends the clustered tree to fetch `Total`. Two thousand matches against a three-level clustered index is thousands of random page touches. Logical reads count each touch, so the same clustered page can be counted many times.

The optimizer prices that against a scan, which touches each leaf page once and can use read-ahead. Past some cardinality the scan is the cheaper plan, and the index you just created sits unused for that query. Kimberly Tripp's [tipping point](https://www.sqlskills.com/blogs/kimberly/the-tipping-point-query-answers/) write-ups are the careful version of this: the crossover is a cost, and it moves with row width and how many lookups share a page. It is not "indexes are used below 1 percent." I read the plan. If it scans, and the predicate is selective, the missing piece is usually a covering column or a better key, not a hint.

Key order is left to right. An index on `(CustomerId, OrderDate)` supports a seek on `CustomerId`, and a seek on `CustomerId` plus `OrderDate`. It does not support a seek on `OrderDate` alone. Markus Winand's [anatomy of an index](https://use-the-index-luke.com/sql/anatomy) is the explanation I send people, and it matches what the optimizer will do with this key.

A predicate can also be a residual. On an index keyed only by `CustomerId`, with `Status` included:

```sql
SELECT OrderId, Status
FROM dbo.Orders
WHERE CustomerId = @CustomerId
  AND Status = 'Open';
```

The seek predicate is `CustomerId = @CustomerId`. `Status = 'Open'` is applied to every row in that customer's leaf range. The plan shows it as a Predicate under the seek, separate from the Seek Predicates. If every query has both columns, `(CustomerId, Status)` makes `Status` part of the seek, and the leaf range shrinks to the open orders. If some queries filter on `Status` alone, `Status` has to lead an index of its own.

The green missing-index suggestion on a plan is one query asking for an index. It does not know the other queries, and it does not know the write cost. The design guide's advice is the one I follow: alter a close index, often by adding an included column, before creating a near-duplicate.

## The optimizer prices a guess

SQL Server's optimizer is cost-based. Patricia Selinger and colleagues showed in 1979, on System R, that you can choose an access path by estimating how many rows each predicate returns and pricing the algorithms that would process those rows. ["Access Path Selection in a Relational Database Management System"](https://dl.acm.org/doi/10.1145/582095.582099), SIGMOD 1979. SQL Server is not System R. The shape of the decision is the same one Microsoft documents now: cost is a function of cardinality and of the cost model of the operators. A bad cardinality makes every price downstream of it wrong. The [cardinality estimation](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server) page says this in those words.

The estimate comes from statistics. A statistics object has a histogram on its leading column, at most 200 steps, and a density vector. Density is `1 / (number of distinct values)`, per prefix of the key. [Statistics](https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics) and [`DBCC SHOW_STATISTICS`](https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-show-statistics-transact-sql) are the references, and the second one is the command:

```sql
DBCC SHOW_STATISTICS (N'dbo.Orders', N'IX_Orders_CustomerId');
```

Three result sets come back. The header says when the stats were built and how many rows were sampled. The density vector has one density per key prefix. The histogram has, per step:

| Column | Meaning |
|---|---|
| `RANGE_HI_KEY` | The upper bound of the step. Up to 200 of these exist. |
| `EQ_ROWS` | Rows equal to that bound. |
| `RANGE_ROWS` | Rows strictly inside the step, above the previous bound and below this one. |
| `DISTINCT_RANGE_ROWS` | Distinct values inside the step. |
| `AVG_RANGE_ROWS` | `RANGE_ROWS / DISTINCT_RANGE_ROWS`. |

![Five histogram steps. The step edge at 4200 has a huge EQ_ROWS. Values inside a step are estimated by the average.](assets/blogs/images/sql-histogram.svg)

*Figure 4. Equality on a step edge uses `EQ_ROWS`. Equality inside the step uses `AVG_RANGE_ROWS`. The cached plan is priced from whichever value was sniffed first.*

An equality on a `RANGE_HI_KEY` is estimated as `EQ_ROWS`. An equality on a value that falls inside a step is estimated as `AVG_RANGE_ROWS`. That average is the uniformity assumption: inside a step, the distinct values are treated as evenly frequent. A spike that is not itself a step boundary is invisible. Two hundred steps is a compression of the column, and on a column with millions of distinct values most values are interior points.

The cardinality estimator also has a model of how columns relate. The original model (compatibility level 70, which arrived with the SQL Server 7.0 estimator) assumed independence, uniformity, simple containment, and inclusion. From compatibility level 120 (SQL Server 2014) the independence assumption became a correlation assumption, and simple containment became base containment. Uniformity inside a histogram step stayed. I care about the version because a database still on an old compatibility level is running the old model, and a plan change after `ALTER DATABASE ... SET COMPATIBILITY_LEVEL` is often this and not a regression in the query text.

If the optimizer has no specific value, it uses density. Estimated rows for an equality is `density * row count`, which is the average frequency. That happens for a local variable whose assignment is in the same batch as the query: the batch is compiled before the assignment runs, so there is nothing to sniff. Conor Cunningham wrote this up as [I Smell a Parameter!](https://learn.microsoft.com/en-us/archive/blogs/queryoptteam/i-smell-a-parameter). A stored procedure parameter is different. The value is known at compile, and it is sniffed.

EF Core is on the procedure side of that line. It sends `sp_executesql` with a parameter. The first execution compiles a plan for the sniffed value, and the plan cache reuses it. Sniffing is the cache doing what it was built for. It is painful when the histogram is skewed:

- First call `CustomerId = 4200`, `EQ_ROWS = 40000`. The plan is priced for a large input. It may scan, or hash.
- Later call `CustomerId = 100`, whose step says a handful of rows. The large plan still runs.
- The other way around is worse. A plan priced for 12 rows does nested-loops lookups, and the whale customer then performs tens of thousands of them.

`OPTION (RECOMPILE)` embeds the current value as a constant, so the histogram step for this execution is the one that gets used. The compile happens every time. That is cheap next to a bad plan on a report that runs once a minute, and expensive on a query that runs thousands of times a second with similar selectivity. `OPTION (OPTIMIZE FOR UNKNOWN)` refuses the sniffed value and uses density, one average plan for every parameter. SQL Server 2022 adds [parameter-sensitive plan optimization](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization), which can keep more than one plan when it sees this skew. I still compare actual rows to estimated rows. A dispatcher is not a substitute for a predicate the index can seek.

Stats go stale on a schedule, not when the data "changes enough" in a human sense. Under compatibility level 130 and above the auto-update threshold for a table larger than 500 rows is `MIN(500 + 0.20 * n, SQRT(1000 * n))`. For the 2,000,000-row example:

```text
500 + 0.20 * 2000000        = 400,500
SQRT(1000 * 2000000)        = SQRT(2,000,000,000) ~= 44,721
threshold                   = 44,721 modifications
```

The counter is on the statistics object, so those 44,721 modifications can all be rows for a single customer and the histogram still describes the old distribution. `modification_counter`, `last_updated`, and `rows_sampled` are on [`sys.dm_db_stats_properties`](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-stats-properties-transact-sql). If `rows_sampled` is far below the row count, the histogram is already an estimate of an estimate.

The operators those estimates feed are simple to name and easy to misread:

| Operator | The cost model reaches for it when |
|---|---|
| Nested loops | The outer input is small and the inner side has a seek. |
| Merge join | Both inputs are ordered on the join key, or sorting them is cheaper than hashing. |
| Hash join | Both inputs are large, order does not help, and there is memory for the hash table. |
| Sort | The order the query asked for is not the order of an index it is already scanning. An index whose key matches the `ORDER BY` removes it. The engine can scan an index backwards, so a reversed sort direction still matches. |

A 40,000-row estimate that is really 12 rows builds a hash table for nothing. A 12-row estimate that is really 40,000 rows nested-loops a table. The number I look at is on the arrow into the operator: estimated rows versus actual rows. The percent cost on the operator is that plan's share of the optimizer's model. When the estimates are wrong, the percents are a share of a wrong model. Subtree cost is an internal unit. It is not milliseconds, and a cost of 2.0 on one query is not "slower" than a cost of 0.4 on another.

`SET SHOWPLAN_ALL` and `SET SHOWPLAN_XML` do not execute the statement. They return the estimated plan, and they stay on for the session, so the next statement you meant to run is also not executed. The actual plan is `SET STATISTICS XML ON`, or "Include Actual Execution Plan" in SSMS. That one runs the query. From SQL Server 2016 the actual plan can also carry per-operator wait statistics.

```sql
SET STATISTICS IO ON;
SET STATISTICS TIME ON;
SET STATISTICS XML ON;

DECLARE @CustomerId int = 42;
SELECT OrderId, Total
FROM dbo.Orders
WHERE CustomerId = @CustomerId;
```

For the worked example, the counts I expect before I believe a tuning change are:

```text
clustered scan of the leaf          logical reads ~= page_count  (50,000 here)
point seek, depth 3, one leaf page  logical reads ~= 3
```

A unique point seek reports `scan count 0`. That quirk is documented on the STATISTICS IO page. I do not use scan count as the thing I optimize. Logical reads, actual rows, and elapsed time are the three I write down.

## A seek needs the column bare on one side

The predicate has to be a range on the key as the key is stored. Wrap the column and the seek is gone, because the index is ordered by the column, not by `YEAR(column)`. The cardinality estimator [documents the same limitation](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server): a built-in function of a column is a case where it cannot estimate well, and the access path suffers with the estimate.

```sql
-- DATEPART on the column. The index on OrderDate is ordered by the instant, not by the year.
WHERE YEAR(OrderDate) = 2024

-- The same rows, as a range the leaf can walk.
WHERE OrderDate >= '20240101' AND OrderDate < '20250101'
```

`LIKE 'ACME%'` can seek. `LIKE '%ACME'` cannot. `Total * 1.2 > @n` applies the expression to every row. `@n / 1.2` moved to the constant side leaves `Total` bare.

Type precedence does the same thing quietly. `nvarchar` outranks `varchar`. Compare a `varchar` column to an `nvarchar` parameter and the conversion is applied to the column. Every row is converted, and the seek is gone. [Data type precedence](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql) is the rule. `AddWithValue` on a .NET string sends `nvarchar`. I type the parameter to match the column, or I make the column `nvarchar` and accept the width. In EF Core the parameter type follows the mapped store type. A property mapped as unicode against a `varchar` column is this bug, generated on every query.

EF Core's SQL Server provider renders `order.OrderDate.Year == 2024` as `DATEPART(year, OrderDate) = @year`. I write the range instead. The parameters are still sniffed, and the predicate is a pair of inequalities on the indexed column:

```csharp
var start = new DateTime(2024, 1, 1);
var end = new DateTime(2025, 1, 1);

var rows = await db.Orders.AsNoTracking()
    .Where(o => o.OrderDate >= start && o.OrderDate < end)
    .OrderBy(o => o.OrderDate)
    .Select(o => new OrderListItem(o.OrderId, o.OrderDate, o.Total))
    .ToListAsync(ct);
```

A filtered index is smaller because it stores only the rows that match its `WHERE`. It is also easy to miss with a parameter. A cached plan for `Status = @status` has to be correct when `@status` is `'Shipped'` as well as `'Open'`. An index that contains only the open rows is illegal for that plan, so the optimizer will not pick it. `OPTION (RECOMPILE)` embeds the literal, and the literal can match the filter. EF Core parameterizes, so a filtered index I added for `Status = 'Open'` stays unused until the predicate is visible as a constant at compile time. The [filtered index](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-filtered-indexes) documentation is where this constraint lives. I build one when a stored report really does say `Status = 'Open'` as a literal, or when I have measured that the recompile is cheaper than the pages.

## OFFSET walks the leaves it throws away

`ORDER BY OrderId OFFSET 100000 ROWS FETCH NEXT 20 ROWS ONLY` is a legal way to ask for a page. With an index ordered by `OrderId`, the engine seeks the start of the leaf and walks. At 40 rows per page, 100,000 skipped rows are 2,500 leaf pages read and discarded, then one page of results. Page 1 of the same query is a handful of pages. Page 5,000 is the same plan shape with a much longer walk. The cost grows with the offset. Aaron Bertrand measured this pattern in [Pagination with OFFSET / FETCH](https://sqlperformance.com/2015/01/t-sql-queries/pagination-with-offset-fetch). Winand's [paging chapter](https://use-the-index-luke.com/sql/partial-results/fetch-next-page) is the version I want a reader to understand: the database is not allowed to jump to row 100,001 without a key that says where row 100,001 is.

![OFFSET 100000 walks 2500 leaf pages and discards them. A keyset seek reads the root, one intermediate page, and the next leaf.](assets/blogs/images/sql-offset.svg)

*Figure 5. Same 40-rows-per-page assumption as Figure 1. The keyset cost stays near the depth of the tree.*

Keyset pagination remembers the last key the client has already seen and seeks to it:

```sql
SELECT TOP (20) OrderId, OrderDate, Total
FROM dbo.Orders
WHERE OrderDate > @lastDate
   OR (OrderDate = @lastDate AND OrderId > @lastId)
ORDER BY OrderDate, OrderId;
```

The order has to be a total order. Two rows with the same `OrderDate` are tied, and a cursor of the date alone skips one or repeats one depending on which plan runs next. `(OrderDate, OrderId)` is unique because `OrderId` is. A nonunique index on `OrderDate` already has `OrderId` appended to its key, because `OrderId` is the clustered locator. I include the columns the list renders, and I do not include the note:

```sql
CREATE NONCLUSTERED INDEX IX_Orders_OrderDate
ON dbo.Orders (OrderDate)
INCLUDE (Total, CustomerId);
```

`Customer.Name` is a different table. The plan joins to it. That join is one statement, with a seek into `Customers` if `CustomerId` is its key. It is not a loop of queries.

EF Core's [pagination page](https://learn.microsoft.com/en-us/ef/core/querying/pagination) shows the same predicate. This is the method I put on the order list. `Take` without a unique `OrderBy` is a bug even before performance: SQL Server does not promise an order you did not ask for, and two pages can disagree about a tie.

```csharp
public async Task<List<OrderListItem>> GetOrdersPage(
    AppDbContext db,
    DateTime? afterDate,
    int? afterId,
    int pageSize,
    CancellationToken ct)
{
    var query = db.Orders.AsNoTracking();

    if (afterDate is DateTime date && afterId is int id)
    {
        query = query.Where(o =>
            o.OrderDate > date
            || (o.OrderDate == date && o.OrderId > id));
    }

    return await query
        .OrderBy(o => o.OrderDate)
        .ThenBy(o => o.OrderId)
        .Select(o => new OrderListItem(
            o.OrderId,
            o.OrderDate,
            o.Total,
            o.Customer.Name))
        .Take(pageSize)
        .ToListAsync(ct);
}
```

The client sends back the `OrderDate` and `OrderId` of the last row it drew. It does not send a page number. Jumping to page 40 still needs `OFFSET`, or a stored key per page, and I only pay that cost on the screens that really jump. A "load more" list does not.

A descending "newest first" screen flips every comparison (`<` instead of `>`, `OrderByDescending`). The index key is the same. Inserts with keys above the cursor do not move rows the user has already been shown. `OFFSET` cannot say that: an insert on page 1 shifts every later page.

## What EF Core actually sends

`IQueryable` is an expression tree. The provider turns it into SQL when the tree is enumerated: `ToListAsync`, `FirstAsync`, a `foreach`. `IEnumerable` is already objects in the process. The method that returns `IEnumerable<Order>`, and the call that puts `ToList()` before `Where`, both end the tree. The filter then runs in the CLR, against every row the server sent.

![ToList-then-Where ships every page, a loop issues one query per order, and one expression tree is one SQL statement.](assets/blogs/images/sql-ef.svg)

*Figure 6. The left column is LINQ to Objects. The middle column is a loop a person wrote. The right column is one round trip.*

```csharp
// The Where never reaches SQL Server.
var slow = db.Orders
    .ToList()
    .Where(o => o.CustomerId == customerId);

// The Where is still on the tree. One statement, one plan.
var fast = await db.Orders
    .Where(o => o.CustomerId == customerId)
    .Select(o => new OrderListItem(o.OrderId, o.OrderDate, o.Total))
    .ToListAsync(ct);
```

The N+1 I still find is a loop, not a feature that turned itself on:

```csharp
var orders = await db.Orders.AsNoTracking().ToListAsync(ct);
foreach (var order in orders)
{
    order.CustomerName = await db.Customers
        .Where(c => c.Id == order.CustomerId)
        .Select(c => c.Name)
        .FirstAsync(ct);
}
```

One thousand orders is 1,001 round trips. Each trip pays latency and runs its own plan, however cheap the seek is. EF Core does not lazy-load unless `UseLazyLoadingProxies` is switched on. The default is off, which the [lazy loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy) page states. The case that feels like magic is a serializer walking navigation properties while proxies are on: the loop is in the JSON writer. I leave proxies off and I write the `Include` or the `Select` I mean.

`Include` of a collection is a join. One hundred orders with forty lines each come back as 4,000 rows, and the order's columns are repeated forty times. That is the Cartesian product EF Core's [split query](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries) page describes. A second included collection multiplies again. `AsSplitQuery()` sends one statement per collection instead. The statements are not one snapshot. A row committed between them shows up in one result and not the other. I wrap the split in a transaction when the screen cannot tolerate that, and I remember that the transaction holds locks for the whole round trip. Most list screens should be a projection, not a graph:

```csharp
var rows = await db.Orders.AsNoTracking()
    .Where(o => o.CustomerId == customerId)
    .OrderBy(o => o.OrderDate)
    .ThenBy(o => o.OrderId)
    .Select(o => new OrderListItem(
        o.OrderId,
        o.OrderDate,
        o.Total,
        o.Customer.Name))
    .Take(20)
    .ToListAsync(ct);
```

A projection of a non-entity type is not tracked. There is no snapshot to keep, and the SQL lists those columns. `AsNoTracking()` changes nothing on this query. I still write it, so a later edit that removes the `Select` and returns `Order` does not silently start tracking. On a query that does return entities, tracking is real work: identity resolution plus a snapshot. Microsoft published a BenchmarkDotNet run on the [efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) page, 10 blogs with 20 posts each: tracking took 1,414.7 microseconds and allocated 380.11 KB; no-tracking took 993.3 microseconds and allocated 232.89 KB, a ratio of 0.71. That is one graph. It is not "tracking costs half." A projection of four columns has nothing for the tracker to do, which is why I prefer it to `AsNoTracking` on a fat entity.

I read the SQL.

```csharp
var sql = db.Orders
    .Where(o => o.CustomerId == customerId)
    .Select(o => new OrderListItem(o.OrderId, o.OrderDate, o.Total))
    .ToQueryString();
```

`EF.CompileAsyncQuery` caches the translation of the expression tree, which is CPU in the API process. It does not freeze a SQL Server plan, and it does not repair a bad one. I use it on a hot path whose shape is stable and whose SQL I have already read. The plan cache on the server is a separate machine.

## Sometimes the query is waiting

A large logical-read count means the engine did work. A small one, with a long elapsed time, means it stood still. The actual plan's wait stats, and `sys.dm_os_waiting_tasks` while it is happening, say which. `LCK_M_*` is a lock held by another transaction. An index does not release someone else's lock. The fix is the transaction that is open across a round trip to the client, or the isolation level that made a reader block a writer. Read committed snapshot moves readers to row versions so they stop taking shared locks. It spends tempdb. I turn it on when I have measured lock waits, not as a default I hide in a checklist.

```sql
ALTER DATABASE CURRENT SET READ_COMMITTED_SNAPSHOT ON;
```

## An index is a write on every insert

Every nonclustered index is maintained on the insert, and on any update of its key or included columns. The design guide's OLTP advice is a few narrow indexes for the queries that dominate, not one index per column. I look at usage since the counters were reset (service restart, or the database coming online):

```sql
SELECT
    OBJECT_NAME(s.object_id) AS table_name,
    i.name,
    s.user_seeks,
    s.user_scans,
    s.user_lookups,
    s.user_updates
FROM sys.dm_db_index_usage_stats AS s
JOIN sys.indexes AS i
  ON i.object_id = s.object_id AND i.index_id = s.index_id
WHERE s.database_id = DB_ID()
  AND OBJECT_NAME(s.object_id) = N'Orders';
```

`user_updates` with no seeks, scans, or lookups is an index the workload pays to maintain. The DMV forgets its history on restart, so I read it after a representative day, not after a reboot five minutes ago.

Page density is the other write-side number. `avg_page_space_used_in_percent` from the physical-stats DMV is how full the pages are. A split of a full page in the middle of a random key leaves two half-empty pages, so the same rows occupy more of the buffer pool and the scan costs more logical reads. On SSD the old penalty of "random versus sequential" is smaller than the textbooks written for spinning disks assumed. The extra pages are still extra pages. I rebuild when density is actually low, which [reorganize and rebuild](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/reorganize-and-rebuild-indexes) is the tool for. The 5 percent and 30 percent fragmentation thresholds that used to circulate are not a measurement of this table.

`FILLFACTOR` reserves free space at rebuild time so mid-page inserts have a hole. On an ever-increasing `IDENTITY` key the inserts already go to the last page. A fill factor of 70 makes every leaf page 30 percent empty on purpose and raises `page_count` for every seek and scan. I leave the default alone on that key. I consider a lower fill factor on an index whose inserts land in the middle, and I check density afterward.

## A procedure is a plan boundary, not a faster plan

A stored procedure and an EF `sp_executesql` batch both go through the same optimizer, and both cache a plan. The procedure does not get a stable plan that ad hoc SQL is denied. It gets sniffed the same way, which is the whole of the previous section. I put SQL in a procedure when I want a permission boundary (the API login can execute the procedure and cannot write the tables), when several statements must share one transaction and one round trip, or when the text is large enough that I want it in source control next to the schema. I then read its actual plan the same way I read a LINQ query's plan.

A cache of reference data is the same kind of decision. Categories that change when an admin hits save can live in `IMemoryCache`, and the save is the invalidation. A one-hour TTL is a bound on how stale I am willing to be if the invalidation is missed. Two API instances need a cache they both see, which is Redis, and they need the same invalidation. Per-user order history is a poor cache: the number of keys tracks the number of users, and a write has to find every key that contains that order. I would rather seek twenty rows.

Query Store, on from SQL Server 2016, keeps the history the plan cache forgets under memory pressure. I use it to see a regression after a compatibility-level change or a stats update. Forcing a plan freezes a plan, including the mistake in it. It is a tourniquet while I fix the predicate or the stats.

```sql
ALTER DATABASE CURRENT SET QUERY_STORE = ON;
```

## The loop I run before I keep a query

1. Print the SQL with `ToQueryString()`, or log it. If the filter is missing, stop. No index fixes a predicate that ran in the CLR.
2. Run it with `STATISTICS IO`, `STATISTICS TIME`, and the actual plan. Write down logical reads, elapsed time, and the worst gap between estimated and actual rows.
3. If a seek has a residual predicate that throws away most of the range, move that column into the key, in the order queries filter.
4. If the plan is a key lookup and the actual row count is large, `INCLUDE` the columns the query returns, or stop selecting them.
5. If the plan is a scan and the predicate is selective and bare, the leading key does not match. Check order, type, and functions on the column.
6. If estimated rows and actual rows disagree by orders of magnitude, open `DBCC SHOW_STATISTICS` before adding an index. A stale or averaged estimate will misuse the index I am about to create.
7. If logical reads grow as the user pages forward, the API is using `OFFSET`. Switch the screen to a keyset if it only moves next and previous.
8. Re-read `user_updates` against `user_seeks` after the index has been in production long enough to matter.

The checklist I want on a pull request that adds a query:

- The SQL was read. The `WHERE` is in the SQL.
- The predicate is a range on a leading key, types matched, no function on the column.
- The selected columns are the ones the screen renders. LOB columns stay on the detail call.
- The plan is a seek, or I have written down why a scan is the right price.
- Estimated rows and actual rows are in the same neighborhood on a skewed parameter and on a common one.
- The new index is not a duplicate, and I know which writes maintain it.
- Paging has a unique order. A "next page" API takes a key, not an offset, unless the UI jumps.

## What this storage engine is not

Columnstore is a different layout. Rows are compressed by column into rowgroups of up to 1,048,576 rows. A `SUM` of `Total` across a year reads the `Total` segment and does not read the note. That is the right shape for a scan-heavy aggregate, and a poor shape for "fetch this order by its id." The [columnstore overview](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview) is the starting point. I reach for it when the logical reads of a rowstore scan are the aggregate, and a covering rowstore index would be a second copy of the table.

Memory-optimized tables use a Bw-tree, a latch-free structure Microsoft Research described and the index guide summarizes. It is not the B+ tree in Figure 2, and it is not the next step after a missing include list. I would be looking at it if the workload were latch waits on a hot page that is already the right page, not because a query reads 50,000 of the wrong ones.

## References

1. Microsoft, [Pages and extents architecture guide](https://learn.microsoft.com/en-us/sql/relational-databases/pages-and-extents-architecture-guide). 8 KiB pages, 96-byte header, slot array, extents.
2. Microsoft, [Index architecture and design guide](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide). B+ trees, clustered key properties, `INCLUDE`, row locators.
3. Microsoft, [Clustered and nonclustered indexes described](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described).
4. Microsoft, [Statistics](https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics). Histograms, density, the auto-update threshold.
5. Microsoft, [`DBCC SHOW_STATISTICS`](https://learn.microsoft.com/en-us/sql/t-sql/database-console-commands/dbcc-show-statistics-transact-sql). The histogram columns used in Figure 4.
6. Microsoft, [Cardinality estimation](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server). Cost as a function of cardinality, and the CE 70 versus CE 120 assumptions.
7. Microsoft, [Query processing architecture guide](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide). Parse, optimize, execute, parameter sensitivity.
8. Microsoft, [`SET STATISTICS IO`](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-statistics-io-transact-sql). Logical reads, physical reads, read-ahead, LOB reads.
9. Microsoft, [Display an actual execution plan](https://learn.microsoft.com/en-us/sql/relational-databases/performance/display-an-actual-execution-plan).
10. Microsoft, [Parameter Sensitive Plan optimization](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization). SQL Server 2022.
11. Microsoft, [Data type precedence](https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-type-precedence-transact-sql). Why an `nvarchar` parameter converts a `varchar` column.
12. Microsoft, [Create filtered indexes](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/create-filtered-indexes).
13. Microsoft, [Reorganize and rebuild indexes](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/reorganize-and-rebuild-indexes).
14. Microsoft, [`sys.dm_db_index_physical_stats`](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-index-physical-stats-transact-sql) and [`sys.dm_db_index_usage_stats`](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-index-usage-stats-transact-sql).
15. Microsoft, [Columnstore indexes overview](https://learn.microsoft.com/en-us/sql/relational-databases/indexes/columnstore-indexes-overview).
16. Conor Cunningham, [I Smell a Parameter!](https://learn.microsoft.com/en-us/archive/blogs/queryoptteam/i-smell-a-parameter). When a value is visible to the optimizer, and when it is not.
17. Kimberly Tripp, [The tipping point](https://www.sqlskills.com/blogs/kimberly/the-tipping-point-query-answers/). Why a seek plus lookups loses to a scan.
18. Markus Winand, [Use The Index, Luke](https://use-the-index-luke.com/), in particular the [index anatomy](https://use-the-index-luke.com/sql/anatomy) and [paging](https://use-the-index-luke.com/sql/partial-results/fetch-next-page) chapters.
19. Aaron Bertrand, [Pagination with OFFSET / FETCH](https://sqlperformance.com/2015/01/t-sql-queries/pagination-with-offset-fetch). The cost of a growing offset, measured.
20. Douglas Comer, "The Ubiquitous B-Tree," ACM Computing Surveys 11(2), 1979. [doi:10.1145/356770.356776](https://dl.acm.org/doi/10.1145/356770.356776).
21. P. Griffiths Selinger, M. M. Astrahan, D. D. Chamberlin, R. A. Lorie, T. G. Price, "Access Path Selection in a Relational Database Management System," SIGMOD 1979. [doi:10.1145/582095.582099](https://dl.acm.org/doi/10.1145/582095.582099).
22. EF Core: [efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying) (the tracking benchmark), [tracking](https://learn.microsoft.com/en-us/ef/core/querying/tracking), [split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), [pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination), [lazy loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy).

---

*Ali Ahsan, Full-Stack Developer | ASP.NET Core | Angular | SQL*

[LinkedIn](https://www.linkedin.com/in/ali-ahsan-6895a9315/) | [GitHub](https://github.com/aliahsan9) | [Blogs](/blogs) | [Newsletter](/news)
