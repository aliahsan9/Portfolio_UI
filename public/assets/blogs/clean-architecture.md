![Clean Architecture cover for an ASP.NET Core, SQL, and CQRS article](assets/blogs/images/clean-architecture.avif)

Submit freezes an order. The total is the sum of its lines, in one currency, in minor units, and the number is written onto the order at that moment. A later edit to the catalog has no column on the order to land in. The class that does this is `Order`. It does not reference ASP.NET Core, and it does not reference Entity Framework. The projects around it are allowed to reference `Order`. That direction is the whole architecture.

Robert C. Martin wrote the rule down in 2012: source code dependencies point inward, and an inner circle does not know the name of anything in an outer circle. He was consolidating a picture Alistair Cockburn had drawn in 2005 (ports and adapters) and Jeffrey Palermo had drawn in 2008 (onion architecture). The diagrams differ. The constraint is the same one Cockburn wanted so that the application could be tested without a UI and without a database.

This post is that constraint on one feature: submit an order, in ASP.NET Core, EF Core, and SQL Server. I use the same split on a feature when I can write a test that constructs the entity, opens no connection, and fails if the rule is wrong. I have also done the opposite, on a school system whose entities had nothing to enforce, and [written that up separately](https://aliahsan.tech/blog/over-engineering). Four projects are a cost. They are worth it when the inner project has a decision worth protecting.

## The decision being hidden

In 1972 David Parnas asked which criterion should be used to cut a system into modules. His example was a keyword-in-context index. The usual cut followed the flowchart: a module to read the lines, a module to rotate them, a module to alphabetize, a module to print. Every one of those modules had to know how a line was stored, so a change to storage touched all of them. His other cut hid each design decision behind an interface. Line storage could change without the alphabetizer knowing.

`Controllers/`, `Services/`, `Repositories/`, `Models/` is the flowchart cut. It sorts types by what they do in the request pipeline. The decision I actually need to hide is "an order total is the snapshotted sum of its own lines, and lines stop changing at submit." That decision wants to live in one type, and the type wants to be ignorant of HTTP and of SQL. Edsger Dijkstra's phrase for this, in EWD 447, was that a scientific discipline finds the aspects that can be studied in isolation for the sake of their own consistency. The order's consistency is one aspect. The choice of SQL Server is another. They change for different reasons, so they do not share a project.

Martin later gave the same idea a ratio. For a component, afferent coupling `Ca` is the number of things outside that depend on it, and efferent coupling `Ce` is the number of things outside it depends on. Instability is `I = Ce / (Ca + Ce)`. Zero is maximally stable. One is maximally unstable. He defined the counts on classes. I apply the same ratio to projects, because in this solution the component boundary is the csproj, and a project reference is something I can count on a whiteboard. Class counts inside a real solution would be larger. The order would not change: Domain has nowhere to point, and nothing depends on Api.

| Project | Project references | Ca | Ce | I |
|---|---|---:|---:|---:|
| Domain | none | 3 | 0 | 0 |
| Application | Domain | 2 | 1 | 1/3 |
| Infrastructure | Application, Domain | 1 | 2 | 2/3 |
| Api | Application, Infrastructure, Domain | 0 | 3 | 1 |

The three incoming edges to Domain are Application, Infrastructure, and Api. `Result<T>`, `DomainError`, and `OrderErrors` live in Domain, so the controller's switch on `DomainError.Code` is a real reference. The controller does not name `Order`. The command, the handler, `OrderSubmitted`, and `OrderSummary` live in Application. Infrastructure names `Order` because the EF configuration is an `IEntityTypeConfiguration<Order>`. Application names `Order` because the handler calls `Submit`.

![Domain at I = 0, Application at 1/3, Infrastructure at 2/3, Api at 1. A reference from Domain to EF Core is the forbidden edge.](assets/blogs/images/ca-dependency.svg)

*Figure 1. Instability from the project references in the table. Adding `Microsoft.EntityFrameworkCore` to Domain moves Ce(Domain) off zero, which is the failure this structure exists to prevent.*

SDK-style projects flow references transitively (`DisableTransitiveProjectReferences` defaults to false), so Infrastructure can already see Domain's types through Application. I still write the direct `ProjectReference`. A count of the csproj files then matches the table, and a reader does not have to remember the default.

Martin also describes a zone of pain: a component that is stable and concrete, depended on by everyone, with no seam to extend. Domain stays out of that corner by being the policy. A project of public setters with no behavior is stable, concrete, and useless. Fowler's name for that shape is the anemic domain model.

## The order

An order is an aggregate in Evans's sense: a cluster of objects treated as one consistency boundary. The root is `Order`. The lines are entities inside it. The catalog is a different aggregate. The order stores a SKU, which is the catalog's identity, and it stores the price it was shown. It does not hold a `Product` navigation. A foreign key to `products` would make "what did the customer accept" a join to a row someone can edit on Tuesday.

![The order aggregate holds lines with a copied unit price. The catalog's current price stays outside, and submit writes the line total onto the order.](assets/blogs/images/ca-aggregate.svg)

*Figure 2. SKU-1 was added at 1999 minor units ($19.99). The catalog now says 2499 ($24.99). The order's stored total is 3998 ($39.98) because Submit multiplied the copied price.*

Two states are enough for this feature. `Draft` accepts lines. `Submit` requires at least one line, requires one currency, writes the total, and moves to `Submitted`. A second `Submit` is `order.not_draft`. An `AddLine` after that is `order.closed`. I am not modeling cancel, refunds, or tax. Those are more methods on the same type when a feature needs them, not a framework I install up front.

A refused command and a broken value take different paths. `Submit` on an empty order is a normal outcome: the caller asked for something the state machine declines, and the method returns a `DomainError`. A line with quantity zero is not a declined command, it is a value the type cannot hold, so `OrderLine.Create` throws. Overflow in `price × quantity` throws as well. I would rather have a 500 for a total that wrapped past `long.MaxValue` than a negative total that looks like a credit.

```csharp
public sealed class Order
{
    private readonly List<OrderLine> _lines = [];

    private Order(Guid id)
    {
        Id = id;
        Status = OrderStatus.Draft;
    }

    public Guid Id { get; private set; }
    public OrderStatus Status { get; private set; }
    public DateTimeOffset? SubmittedAt { get; private set; }
    public long? TotalMinor { get; private set; }
    public string? TotalCurrency { get; private set; }
    public IReadOnlyList<OrderLine> Lines => _lines;

    public static Order Open(Guid id) => new(id);

    public DomainError? AddLine(string sku, int quantity, Money unitPrice)
    {
        if (Status != OrderStatus.Draft)
            return OrderErrors.Closed(Id);
        if (string.IsNullOrWhiteSpace(sku))
            return OrderErrors.SkuRequired();
        if (quantity <= 0)
            return OrderErrors.Quantity(quantity);
        if (_lines.Count > 0 &&
            _lines[0].UnitPrice.Currency != unitPrice.Currency)
            return OrderErrors.MixedCurrency(
                _lines[0].UnitPrice.Currency, unitPrice.Currency);

        var existing = _lines.Find(line =>
            line.Sku == sku && line.UnitPrice == unitPrice);
        if (existing is not null)
            return existing.Increase(quantity);

        _lines.Add(OrderLine.Create(sku.Trim(), quantity, unitPrice));
        return null;
    }

    public DomainError? Submit(DateTimeOffset at)
    {
        if (Status != OrderStatus.Draft)
            return OrderErrors.NotDraft(Id);
        if (_lines.Count == 0)
            return OrderErrors.Empty(Id);

        var total = _lines[0].LineTotal;
        for (var i = 1; i < _lines.Count; i++)
            total = total.Add(_lines[i].LineTotal);

        TotalMinor = total.Minor;
        TotalCurrency = total.Currency;
        Status = OrderStatus.Submitted;
        SubmittedAt = at;
        return null;
    }
}
```

`AddLine` merges a repeated SKU only when the unit price is the same value. The same SKU at a new price is a second line. The customer accepted two different numbers, and collapsing them would invent a price nobody saw. Currency is compared against the first line, so a USD order refuses a EUR line before any arithmetic.

The clock is a parameter. `Submit` does not call `DateTimeOffset.UtcNow`. A test passes `2026-11-16T06:00:00Z` and asserts that exact value back. The handler passes `TimeProvider.GetUtcNow()`.

```csharp
[Fact]
public void Submit_snapshots_minor_units_and_then_refuses_lines()
{
    var order = Order.Open(Guid.CreateVersion7());
    var price = Money.FromMinor(1999, "USD");

    Assert.Null(order.AddLine("SKU-1", 2, price));
    Assert.Null(order.Submit(
        new DateTimeOffset(2026, 11, 16, 6, 0, 0, TimeSpan.Zero)));

    Assert.Equal(3998, order.TotalMinor);
    Assert.Equal("USD", order.TotalCurrency);
    Assert.Equal(OrderStatus.Submitted, order.Status);
    Assert.Equal("order.closed", order.AddLine("SKU-2", 1, price)!.Code);
}
```

The catalog is not in this test. Nothing the test can do to a product table can change 3998, because the product table is not a parameter. That is the property the aggregate bought.

## Minor units, and the rounding mode

`double` cannot hold 0.10. IEEE 754 binary64 represents a sum of dyadic fractions, and 1/10 is not one of them. In C# the comparison `0.1 + 0.2 == 0.3` is false; the sum is the value whose default round-trip format is `0.30000000000000004`. David Goldberg's 1991 survey is the explanation of why, and it is the reason a money type in this service is not a `double`.

`decimal` is a different format: 128 bits, a 96-bit integer significand, and a base-10 scale from 0 to 28. `0.1m + 0.2m == 0.3m` is true. Decimal already solved the binary problem. I still store an integer of minor units, because the scale is a property of the currency, not of the column. [ISO 4217](https://www.iso.org/iso-4217-currency-codes.html) gives USD and EUR an exponent of 2, JPY an exponent of 0, and KWD an exponent of 3. A `decimal(18,2)` column rounds the third place of a dinar away on write, and it makes 10 USD and 10 JPY look like the same kind of number. `bigint` plus a three-letter code does not have a scale for a driver to reinterpret.

The API for this service takes `unitMinor` and `currency`. The domain method `Money.FromMinor` checks that the code is one this service has an exponent for, and then stores the integer. There is no rounding there, because the input is already an integer.

The day a screen posts a major-unit decimal, the conversion has to pick a midpoint rule. `decimal.Round` defaults to `MidpointRounding.ToEven`, banker's rounding. I checked the input I care about: `1.225m * 100m` is `122.500`. Rounding to zero places with `ToEven` yields **122**. Rounding with `MidpointRounding.AwayFromZero` yields **123**. Those are $1.22 and $1.23. The default is the wrong commercial choice, so `FromMajor` names the mode.

```csharp
public static Money FromMajor(decimal major, string currency)
{
    var code = currency.Trim().ToUpperInvariant();
    if (!Iso4217.TryGetExponent(code, out var exponent))
        throw new ArgumentException(
            $"No ISO 4217 exponent is registered for {currency}.",
            nameof(currency));

    var factor = 1m;
    for (var i = 0; i < exponent; i++)
        factor *= 10m;

    var minor = decimal.Round(
        major * factor, 0, MidpointRounding.AwayFromZero);

    return new Money(checked((long)minor), code);
}
```

The cast from `decimal` to `long` throws `OverflowException` outside the `long` range. `Add` and `Times` use `checked` for the same reason. A wrapped negative total would be a free order. The registered exponents today are USD, EUR, and GBP at 2, JPY at 0, and KWD at 3. That list is the set of currencies this service is willing to store, not a claim that I reimplemented the ISO catalog. An unknown code fails at the boundary, so a typo cannot become a row. `1.2345` KWD scaled by `10^3` is `1234.5`, and `AwayFromZero` stores `1235` fils.

`Money.Add` throws if the currencies differ. `AddLine` already returns `order.mixed_currency` for that case, so the throw is a backstop for a caller that pushed a line onto the list another way. Inside `Submit` the loop only adds lines the order already accepted.

## The handler

The handler is an ordinary class. It loads the aggregate, calls one method, asks for a single commit, and returns a `Result<OrderSubmitted>`. It does not reference EF Core. The concurrency exception that EF throws is translated below this class, in Infrastructure, into `SaveResult.Conflict`.

![Submit runs from the route to Order.Submit and then to one SaveChanges. Color marks which project owns the step.](assets/blogs/images/ca-request.svg)

*Figure 3. Green is Domain, blue is Application, purple is Api, amber is Infrastructure. The call stack walks down through all four. The project references point the other way, at Domain.*

```csharp
public sealed class SubmitOrderHandler
{
    private readonly IOrderRepository _orders;
    private readonly IOutbox _outbox;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TimeProvider _clock;

    public SubmitOrderHandler(
        IOrderRepository orders,
        IOutbox outbox,
        IUnitOfWork unitOfWork,
        TimeProvider clock)
    {
        _orders = orders;
        _outbox = outbox;
        _unitOfWork = unitOfWork;
        _clock = clock;
    }

    public async Task<Result<OrderSubmitted>> Handle(
        SubmitOrder command, CancellationToken ct)
    {
        var order = await _orders.GetAsync(command.OrderId, ct);
        if (order is null)
            return Result<OrderSubmitted>.Failure(
                OrderErrors.NotFound(command.OrderId));

        var error = order.Submit(_clock.GetUtcNow());
        if (error is not null)
            return Result<OrderSubmitted>.Failure(error);

        if (order.TotalMinor is not long minor ||
            order.TotalCurrency is not string currency ||
            order.SubmittedAt is not DateTimeOffset submittedAt)
        {
            throw new InvalidOperationException(
                "Submit returned success without a snapshot.");
        }

        _outbox.Enqueue(new OrderSubmittedMessage(
            order.Id, minor, currency, submittedAt));

        if (await _unitOfWork.SaveChangesAsync(ct) == SaveResult.Conflict)
            return Result<OrderSubmitted>.Failure(
                OrderErrors.Conflict(command.OrderId));

        return Result<OrderSubmitted>.Success(
            new OrderSubmitted(order.Id, minor, currency));
    }
}
```

The `InvalidOperationException` is a defect guard. `Submit` returning null means it assigned the snapshot. If a future edit breaks that, I want a 500 with a trace id, not a `NullReferenceException` one line later.

`IOrderRepository` is the driven port in Cockburn's terms. The application owns the interface. The adapter is `OrderRepository` in Infrastructure. The interface has two methods.

```csharp
public interface IOrderRepository
{
    Task<Order?> GetAsync(Guid id, CancellationToken ct);
    void Add(Order order);
}
```

`Add` is synchronous because `_db.Orders.Add` does not touch the network. The round trip is `SaveChanges`. A method that returns `Task` and never awaits is a fake asynchronous boundary. There is no `Update`. The instance came from a tracking query, so the change tracker already sees `Submit`. Calling `DbSet.Update` on a tracked instance marks every property modified, which is a wider write than the one the tracker would have produced.

There is no `IRepository<T>`. A generic repository with `GetAll`, `Find(Expression<...>)`, `Add`, `Remove`, and `Update` is `DbSet<T>` with the names changed. Microsoft's own persistence guidance says exactly this about the context: EF Core implements the repository and the unit of work, and simple CRUD can use the context directly. I still don't inject `AppDbContext` into the handler. The handler would then name an EF type, and Application would reference the outer circle. The port is small because the aggregate is the unit I load and save. Evans is specific that you have a repository for an aggregate root, not for each table. `OrderLine` has no repository. A line is saved because its parent is saved.

`IUnitOfWork` is three lines, and the implementation is where EF is allowed to exist.

```csharp
public interface IUnitOfWork
{
    Task<SaveResult> SaveChangesAsync(CancellationToken ct);
}

public enum SaveResult { Saved, Conflict }

public sealed class EfUnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _db;

    public EfUnitOfWork(AppDbContext db) => _db = db;

    public async Task<SaveResult> SaveChangesAsync(CancellationToken ct)
    {
        try
        {
            await _db.SaveChangesAsync(ct);
            return SaveResult.Saved;
        }
        catch (DbUpdateConcurrencyException)
        {
            return SaveResult.Conflict;
        }
    }
}
```

Fowler's definition of a unit of work is a list of the objects a business transaction has affected, flushed together, with concurrency handled in that flush. `DbContext` is that list. The [EF Core docs](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/) say a context is designed for a single unit of work, and they quote Fowler to say it. `IUnitOfWork` does not add a second policy on top of the context. It exists so the handler can ask for the flush without naming `DbContext`, and so `DbUpdateConcurrencyException` is caught on the infrastructure side of the boundary. A class that only forwards `SaveChanges` and is registered beside a context the handler can already see would be a rename. Here the handler cannot see the context. The wrapper is the seam.

The repository and the unit of work and the outbox take the same scoped `AppDbContext`. One scope, one change tracker, one transaction. If those three were resolved from three contexts, the diagram of "one commit" would be a picture of three commits. Lifetime is part of the design, below.

## What EF is allowed to do to the entity

EF has to construct an `Order` when it reads one, and it has to write columns when `Submit` changes fields. It must not do that by calling `Submit`. Rehydration is not a use case. A materializer that called `Submit` would re-run the rule against a row that had already passed it, and a draft loaded for `AddLine` would be submitted as a side effect of the read.

Since EF Core 3.0 the default [property access mode](https://learn.microsoft.com/en-us/ef/core/modeling/backing-field) is `PreferField`. EF writes the backing field when it can find one, and the property when it cannot. The convention looks for `_lines`, `_Lines`, `m_lines`, `m_Lines`, in that order. The collection is a private `List<OrderLine>` named `_lines`, exposed as `IReadOnlyList<OrderLine>`. EF populates the list and never replaces it. There is no setter to put behavior in.

Scalar properties on this type are `{ get; private set; }` with compiler-generated backing fields (`<Status>k__BackingField`). Those names do not match the convention, so EF uses the private setter. The setters on `Order` assign. They do not decide. The day someone hides a rule in a setter, every load of that column runs the rule, and a row that was valid last year can fail to load because the rule changed. If a scalar must be written without its setter, the field gets the conventional name (`_status`) and EF picks it up on its own.

```csharp
public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> order)
    {
        order.ToTable("orders");
        order.HasKey(o => o.Id);
        order.Property(o => o.Status)
            .HasConversion<string>()
            .HasMaxLength(16);
        order.Property(o => o.SubmittedAt).HasColumnName("submitted_at");
        order.Property(o => o.TotalMinor).HasColumnName("total_minor");
        order.Property(o => o.TotalCurrency)
            .HasColumnName("total_currency")
            .HasMaxLength(3);

        order.Property<byte[]>("RowVersion").IsRowVersion();

        order.HasMany(o => o.Lines)
            .WithOne()
            .HasForeignKey("OrderId");
        order.Navigation(o => o.Lines)
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
```

`Status` is stored as a string. Reordering the enum, or inserting a member, must not renumber existing rows. `RowVersion` is a shadow property: the domain type has no `byte[]` field, and SQL Server's `rowversion` still participates in the `UPDATE`. EF puts the original value in the `WHERE` clause. Two concurrent submits both pass the in-memory "is draft" check. One `UPDATE` matches. The other matches zero rows, and EF throws `DbUpdateConcurrencyException`. The unit of work turns that into `SaveResult.Conflict`. I do not retry inside the handler. A retry would load the winner's `Submitted` order and return `order.not_draft`, which is also a 409. The client re-reads and shows the submitted order.

`total_minor` and `total_currency` are nullable columns. A draft has neither. An optional owned `Money` does not fix that: `Minor` is a `long`, and a non-nullable property of an owned type wants a non-null column, so a draft would store `0` and read back as a free order. Nullable columns keep "no total yet" distinct from "a total of zero." Zero is a legal submitted total only if a line was actually free, and `FromMinor(0, "USD")` can say that on purpose.

The line's unit price is required, so it is an owned `Money` mapped onto `order_lines` (no second table). `OrderId` on the line is a shadow foreign key. The line type does not grow an `Order` navigation for EF's convenience. The configuration of that owned value, and of the line's own key, sits in `OrderLineConfiguration` next to this class.

The command repository loads lines because `Submit` sums them.

```csharp
public Task<Order?> GetAsync(Guid id, CancellationToken ct) =>
    _db.Orders
        .Include(o => o.Lines)
        .FirstOrDefaultAsync(o => o.Id == id, ct);
```

Without `Include`, and with lazy-loading proxies left off, `Lines` is empty. `Submit` then returns `order.empty` for an order that has lines in the database. That failure is loud, which is what I want. Proxies would hide it behind a query per line, and they need virtual members on a type I would rather keep sealed. The integration test for this mapping saves a two-line order and submits it through the handler. A mocked `DbSet` does not run the field mapping, so it does not catch the bug I am actually worried about.

New ids come from `Guid.CreateVersion7()`, which is in .NET 9 and matches the version 7 layout in [RFC 9562](https://www.rfc-editor.org/rfc/rfc9562). The first 48 bits are a Unix timestamp in milliseconds, so values increase with time. A clustered index on random version 4 GUIDs inserts into random leaf pages. Version 7 inserts toward the end of the leaf level. `Order.Open` takes the id as an argument. The entity does not choose the generator. The create handler, which is the same shape as submit and not pasted here, is the caller.

## One commit, then the message

The outbox row is written in the same `SaveChanges` as the order. Chris Richardson's name for this is the transactional outbox: the message is state in the same database, committed with the business row, and a separate process publishes it. I use it because "the order is submitted" and "fulfillment was told" need to agree even when the process dies.

![Two SaveChanges calls can commit the order and lose the outbox row. One SaveChanges commits both or neither.](assets/blogs/images/ca-transaction.svg)

*Figure 4. The repository never calls SaveChanges. The handler enqueues the message and then asks the unit of work to flush the tracker once.*

```csharp
public void Enqueue(OrderSubmittedMessage message)
{
    _db.Outbox.Add(new OutboxRow
    {
        Id = Guid.CreateVersion7(),
        Type = nameof(OrderSubmittedMessage),
        Payload = JsonSerializer.Serialize(message),
        OccurredAt = message.SubmittedAt
    });
}
```

`Enqueue` does not call `SaveChanges` either. It puts a row in the tracker. The handler's single flush writes the `orders` update and the `outbox` insert inside the transaction EF already opens for one `SaveChanges` on the SQL Server provider. If either statement fails, neither remains.

A hosted service reads rows whose `PublishedAt` is null, publishes, and then sets `PublishedAt`. That loop is not on the request. If the process dies after the commit and before publish, the row is still there and the next pass sends it. If it dies after publish and before the mark, the message goes out twice. Consumers treat the order id as an idempotency key. Publishing inside the handler before `SaveChanges` has the opposite bug: the broker can hold a message for an order the transaction then rolls back. I don't do that.

The same scoped context is what makes the tracker shared. Registration:

```csharp
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Sql")));

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderSummaryReader, OrderSummaryReader>();
builder.Services.AddScoped<IOutbox, EfOutbox>();
builder.Services.AddScoped<IUnitOfWork, EfUnitOfWork>();
builder.Services.AddScoped<SubmitOrderHandler>();
builder.Services.AddSingleton(TimeProvider.System);

builder.Host.UseDefaultServiceProvider(o =>
{
    o.ValidateScopes = true;
    o.ValidateOnBuild = true;
});
```

`TimeProvider.System` is a singleton and it does not take the context. A singleton that took `AppDbContext` would capture one context for the life of the process. Mark Seemann's name for that is a captive dependency: a long-lived service holding a short-lived one. The generic host validates scopes in Development. Production does not, unless this block says so. I would rather fail at boot than on the fifth request. `Program.cs` is the composition root, the one place Seemann points out is allowed to know every concrete type. The handler asks for `IOrderRepository`. The only method that names `OrderRepository` is the registration above. Authentication middleware is the same kind of outer-circle adapter; the JWT design I use in front of this API is a [separate piece](https://aliahsan.tech/blog/jwt-authentication).

## The summary does not rebuild the order

Fowler, writing up the pattern he attributes to Greg Young, defines CQRS as using a different model to update information than the model used to read it, and he warns that for most systems it adds risky complexity. The form he is warning about is two models, often two stores, with the read side fed asynchronously. I am not running that. There is one database. "Command" and "query" here mean two code paths, because the path that enforces the rule and the path that paints a screen load different amounts of data.

![Submit loads the aggregate and runs the rule. The summary query reads five columns and does not construct an Order.](assets/blogs/images/ca-paths.svg)

*Figure 5. The command Include is load-bearing. The summary query lists columns. Returning IQueryable from the repository moves EF's query dialect into the caller, and an assembly-reference test will not catch it.*

```csharp
public async Task<OrderSummary?> ReadAsync(Guid id, CancellationToken ct)
{
    return await _db.Orders
        .Where(o => o.Id == id)
        .Select(o => new OrderSummary(
            o.Id,
            o.Status,
            o.TotalMinor,
            o.TotalCurrency,
            o.SubmittedAt))
        .FirstOrDefaultAsync(ct);
}
```

`OrderSummary` is not an entity, so EF does not track it. I don't add `AsNoTracking` to this query. `AsNoTracking` is for a query that returns `Order` and will not mutate it. Putting it on a projection is a habit. The SQL I want is a select of those columns from `orders`, with no join to `order_lines`, because Submit already wrote the total. A draft comes back with null minor and null currency, and the screen says the order is a draft. It does not sum the lines in memory to invent a total the aggregate has not accepted. A draft subtotal, if a screen needs one, is a different query that sums `unit_minor * quantity` in SQL and still does not materialize an `Order`.

The port returns `OrderSummary`, a finished value. This is the version I refuse:

```csharp
IQueryable<Order> Query();
```

`IQueryable<T>` is in `System.Linq`. A repository method with that signature does not, by itself, add a `ProjectReference` to EF Core, so a test that scans assembly references stays green. The caller can then write `Include`, `Where`, and joins, and those expressions are a dialect EF understands and a replacement provider may not. Martin stated the rule as names and data formats, not as a package list. A query the inner circle composes is the outer circle's data format, leaking inward. The summary reader keeps the expression tree in Infrastructure, which is the project already allowed to know EF.

Microsoft's guidance on the persistence layer says the same thing from the DDD side: updates go through the repository and the aggregate, because that is the consistency boundary, and queries are free to bypass it. The bypass is the `Select` above. The bypass is not `IQueryable` handed to a controller.

## What the caller sees

Shape checks and rule checks are different failures. `POST /orders/{id}/submit` has no body. `{id:guid}` on the route is the shape check. `AddLine` has a body, and the shape check is FluentValidation: `OrderId` not empty, `Sku` not empty and at most 64 characters, `Quantity` greater than zero and at most 10_000, `Currency` length 3. The cap on quantity is what keeps `checked` multiplication in `Money.Times` as a backstop rather than a normal path. A client that sends `0` gets 400 with the field name, from the validator, before the handler runs.

The entity repeats `quantity > 0`. I want that repetition. The validator is the conversation with one HTTP client. `OrderLine.Create` is the representation, and it still throws if any other caller builds a line. Deleting the check from the entity because "the validator already does it" means the next handler has a private back door.

The handler returns `DomainError` for a rule. The controller maps codes to status codes. It does not inspect `Order`.

| Code | Status | When |
|---|---:|---|
| `order.not_found` | 404 | No row for that id |
| `order.conflict` | 409 | The `rowversion` lost an update |
| `order.not_draft` | 409 | `Submit` on an order that is already submitted |
| `order.closed` | 409 | `AddLine` after submit |
| `order.empty` | 422 | `Submit` with no lines |
| `order.mixed_currency` | 422 | A line in a second currency |
| `order.quantity`, `order.sku` | 400 | Shape, from the validator, before the handler |

409 is a conflict with the current state of the resource. 422 is a well-formed command the resource will not apply. Both are from [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110). The body is `ProblemDetails`, [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457). `title` is the code, `detail` is the sentence, `status` matches the HTTP status. I don't invent a `type` URI I don't host.

```csharp
[HttpPost("{id:guid}/submit")]
public async Task<IActionResult> Submit(Guid id, CancellationToken ct)
{
    var result = await _submit.Handle(new SubmitOrder(id), ct);
    if (result.IsSuccess)
        return Ok(result.Value);

    var status = result.Error!.Code switch
    {
        "order.not_found" => StatusCodes.Status404NotFound,
        "order.conflict" or "order.not_draft" or "order.closed"
            => StatusCodes.Status409Conflict,
        _ => StatusCodes.Status422UnprocessableEntity
    };

    return Problem(
        statusCode: status,
        title: result.Error.Code,
        detail: result.Error.Detail);
}
```

Unexpected exceptions are the middleware's job, and a domain refusal is not an unexpected exception. Empty submit must not show up in the error log as a stack trace. The middleware logs the exception with the trace id and returns a 500 problem whose body does not include `ex.Message`. Database errors and file paths have a habit of ending up in that string.

```csharp
public async Task Invoke(HttpContext context)
{
    try
    {
        await _next(context);
    }
    catch (Exception ex) when (ex is not OperationCanceledException)
    {
        var traceId = Activity.Current?.Id ?? context.TraceIdentifier;
        _logger.LogError(ex, "Unhandled exception {TraceId}", traceId);

        if (context.Response.HasStarted)
            throw;

        context.Response.StatusCode =
            StatusCodes.Status500InternalServerError;

        await context.Response.WriteAsJsonAsync(new ProblemDetails
        {
            Status = StatusCodes.Status500InternalServerError,
            Title = "An unexpected error occurred.",
            Extensions = { ["traceId"] = traceId }
        });
    }
}
```

`OperationCanceledException` covers the client disconnecting, including `TaskCanceledException`. That is not a 500. `HasStarted` means a response has already begun and the honest behavior is to let the exception continue rather than write a second body.

I log one information line in the handler after a successful commit, with the order id and the minor total. I don't log the line list. The outbox payload is already the record of what was accepted.

## The build fails when the arrow flips

A review comment is a weak form of this rule. Someone in a hurry adds `using Microsoft.EntityFrameworkCore` to `Order` so they can slap on a column attribute, and the inner circle now changes when EF's attribute names change. [NetArchTest](https://github.com/BenMorris/NetArchTest) makes that a failed test. `HaveDependencyOn` looks at referenced assemblies, so a used type fails the test and an unused `using` does not. The `IQueryable` leak discussed above is the hole this test does not cover. I still want the test. It catches the mistake people actually make.

```csharp
[Fact]
public void Domain_does_not_reference_outer_frameworks()
{
    var result = Types.InAssembly(typeof(Order).Assembly)
        .ShouldNot()
        .HaveDependencyOnAny(
            "Microsoft.EntityFrameworkCore",
            "Microsoft.AspNetCore",
            "FluentValidation")
        .GetResult();

    Assert.True(result.IsSuccessful);
}

[Fact]
public void Application_does_not_reference_ef_or_aspnet()
{
    var result = Types.InAssembly(typeof(SubmitOrderHandler).Assembly)
        .ShouldNot()
        .HaveDependencyOnAny(
            "Microsoft.EntityFrameworkCore",
            "Microsoft.AspNetCore")
        .GetResult();

    Assert.True(result.IsSuccessful);
}
```

FluentValidation is allowed in Application and forbidden in Domain. The validator is a conversation with a caller. The entity is the rule, and it returns `DomainError` rather than `ValidationFailure`. ASP.NET is forbidden in both. Status codes exist in the controller and nowhere inward of it.

Folders follow the same cut. Each project has an `Orders` directory. The submit command, the handler, and the validator for add-line live next to each other in Application. I don't split one use case across `Commands/`, `Handlers/`, `Validators/`, and `DTOs/` so that opening a feature means opening four folders. Parnas's criterion was to package the decision that changes together. Martin's screaming-architecture note is the folder version of that: a listing of the project should say "orders," not "controllers." The school system I linked above had the four-folder split, and a new attendance screen meant a tour of all of them for a feature with no invariant.

## What I leave out

MediatR is a router and a pipeline. The handler in this post is a class the controller calls. `AddLine` runs its validator at the top of the handler, which is ten lines, and submit has nothing to validate beyond the route constraint. A pipeline behavior is those ten lines extracted so the thirteenth handler doesn't repeat them. That is worth a library when the behaviors are real: validation, a transaction boundary, logging of every command. It is not worth a library to avoid one `if`.

The license is a separate fact. MediatR 12.5.0 is Apache-2.0. MediatR 13, released 2 July 2025, is dual-licensed under the Reciprocal Public License 1.5 or Lucky Penny's commercial terms. Jimmy Bogard [described the split](https://www.jimmybogard.com/automapper-and-mediatr-commercial-editions-launch-today/) when he shipped it. Versions before 13 keep the license they were published with. Moving to 13 means accepting RPL-1.5's reciprocal obligations, or buying the license, or staying on 12.5.0 with no further fixes from the maintainer. I don't want that decision made by a transitive NuGet bump in a post whose point is dependency direction. If a codebase already has MediatR 12 and a real pipeline, the handlers still sit in Application, and the dependency rule is unchanged. The mediator is an outer-circle convenience.

I don't add a second database for reads. Fowler's warning is about that system. I would revisit it when a screen joins several aggregates and the write model cannot serve it without becoming a reporting schema, or when read volume is hurting the write path. Until then the `Select` into `OrderSummary` is the read model.

I don't add domain events dispatched from inside `Submit`. The handler enqueues one outbox message after a successful `Submit`, in the same commit. A static event aggregator hidden in the entity is a dependency the entity calls, and it runs at a time I don't control relative to the transaction. The explicit line in the handler is easier to put on the diagram.

I don't start this structure for a form over a table. If the only rule is `quantity > 0`, a check constraint enforces it closer to the data, and a single project with a thin handler is the whole design. The signal I use is the test in the middle of this post. If I cannot write it without a mock, I don't have an aggregate. I have a row. Building Domain, Application, Infrastructure, and Api around a row is the failure mode in the school-system writeup: every feature paid the mapping tax, and the entities never once refused a command.

## Before I call it done

- Domain has no project reference. Application references Domain. Infrastructure references Application and Domain. Api references the other three.
- The architecture tests above are red when Domain names EF, ASP.NET, or FluentValidation, and when Application names EF or ASP.NET.
- `Order.Submit` writes `TotalMinor` and `TotalCurrency` from the lines. The line stores its own unit price. There is no foreign key from a line to the catalog.
- `Add` and `Times` are `checked`. `FromMajor`, if a caller needs it, uses `MidpointRounding.AwayFromZero`.
- The command query `Include`s lines and is tracked. The summary query projects five columns and does not return `IQueryable`.
- No repository method calls `SaveChanges`. The handler calls it once, after the outbox row is in the same tracker.
- `RowVersion` is a shadow property. A lost update comes back as `order.conflict` and 409.
- The outbox publisher runs after commit and consumers dedupe on the order id.
- `ValidateScopes` and `ValidateOnBuild` are on outside Development. Nothing singleton takes `AppDbContext`.
- A domain test submits an order with no database and asserts 3998. An integration test rounds-trips the same order through SQL Server, because that is the only test that runs the field mapping.
- A refusal is a `ProblemDetails` body with a code. A 500 body has a trace id and no exception message.

## References

1. Robert C. Martin, [The Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), 13 August 2012. The dependency rule.
2. Robert C. Martin, *Clean Architecture*, Prentice Hall, 2017. Instability `I = Ce / (Ca + Ce)`, and the zone of pain.
3. Robert C. Martin, [Screaming Architecture](https://blog.cleancoder.com/uncle-bob/2011/09/30/Screaming-Architecture.html), 30 September 2011.
4. Alistair Cockburn, [Hexagonal architecture](https://alistair.cockburn.us/hexagonal-architecture/), HaT Technical Report 2005.02, 4 September 2005. Ports and adapters.
5. Jeffrey Palermo, [The Onion Architecture: part 1](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/), July 2008.
6. D. L. Parnas, [On the Criteria To Be Used in Decomposing Systems into Modules](https://doi.org/10.1145/361598.361623), *Communications of the ACM* 15(12), December 1972.
7. E. W. Dijkstra, [On the role of scientific thought (EWD 447)](https://www.cs.utexas.edu/~EWD/transcriptions/EWD04xx/EWD447.html), 30 August 1974.
8. Eric Evans, *Domain-Driven Design*, Addison-Wesley, 2003. Aggregates and repositories.
9. Martin Fowler, [Repository](https://martinfowler.com/eaaCatalog/repository.html) and [Unit of Work](https://martinfowler.com/eaaCatalog/unitOfWork.html), *Patterns of Enterprise Application Architecture*, 2002.
10. Martin Fowler, [CQRS](https://martinfowler.com/bliki/CQRS.html), 14 July 2011.
11. Martin Fowler, [AnemicDomainModel](https://martinfowler.com/bliki/AnemicDomainModel.html).
12. David Goldberg, [What Every Computer Scientist Should Know About Floating-Point Arithmetic](https://doi.org/10.1145/103162.103163), *ACM Computing Surveys* 23(1), March 1991.
13. [ISO 4217 currency codes](https://www.iso.org/iso-4217-currency-codes.html). Currency exponents.
14. [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110). 409 Conflict and 422 Unprocessable Content.
15. [RFC 9457: Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457).
16. [RFC 9562: Universally Unique Identifiers (UUIDs)](https://www.rfc-editor.org/rfc/rfc9562). Version 7.
17. Microsoft, [DbContext lifetime](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/), [backing fields](https://learn.microsoft.com/en-us/ef/core/modeling/backing-field), [transactions](https://learn.microsoft.com/en-us/ef/core/saving/transactions), [concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency).
18. Microsoft, [Designing the infrastructure persistence layer](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design). The context as repository and unit of work, and queries that bypass the aggregate.
19. Microsoft, [Service lifetimes](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-lifetimes).
20. Mark Seemann, [Composition Root](https://blog.ploeh.dk/2011/07/28/CompositionRoot/) and [Captive Dependency](https://blog.ploeh.dk/2014/06/02/captive-dependency/).
21. Jimmy Bogard, [AutoMapper and MediatR commercial editions](https://www.jimmybogard.com/automapper-and-mediatr-commercial-editions-launch-today/), 2 July 2025.
22. Ben Morris, [NetArchTest](https://github.com/BenMorris/NetArchTest).
23. Chris Richardson, [Transactional outbox](https://microservices.io/patterns/data/transactional-outbox.html).

---

*Ali Ahsan, Full-Stack Developer | ASP.NET Core | Angular | SQL*

[LinkedIn](https://www.linkedin.com/in/ali-ahsan-6895a9315/) | [GitHub](https://github.com/aliahsan9) | [Blogs](/blogs) | [Newsletter](/news)
