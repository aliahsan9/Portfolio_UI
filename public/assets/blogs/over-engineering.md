![A school register pulled apart into projects, repositories, and handlers](assets/blogs/images/over-engineering.avif)

The school system died of its own structure.

I was the only developer. The users, if it had shipped, were students, teachers, and a clerk in each school. A few hundred people. I split the solution into Domain, Application, Infrastructure, Persistence, and API, then added a generic repository, a specification type, a unit of work, a MediatR command for every read, and a tenant abstraction with exactly one implementation. Listing the students in a class meant eight types and one `Where`. The load that structure was rehearsing for never arrived. I restarted.

This is the account of that structure: which parts of it were the school, which parts were a costume, what the costume cost, and the ASP.NET Core shape I rebuilt toward. I did not time the before and after. I am not going to invent a multiplier. The mechanisms are old, and they are specific enough to check against the papers.

## Two piles

In 1987 Fred Brooks separated the work of building software into two piles. Essential complexity is the conceptual structure you cannot throw away without throwing away the problem. Accidental complexity is the representation: languages, tools, scaffolding. A generation of productivity had come from shrinking the accidental pile (compilers, high-level languages, time-sharing), and he argued you would not get another order of magnitude that way, because what remained was the problem itself. The paper is ["No Silver Bullet," IEEE Computer, April 1987](https://www.cs.unc.edu/techreports/86-020.pdf). He names four properties that make the essential pile hard: complexity, conformity, changeability, and invisibility.

A school has all four, and none of them is a folder.

Complexity: a mark is one student on one day, a fee follows a schedule the board published, a teacher sees one school's rows. No two of those rules are the same part repeated. Brooks's point about software, as against a bridge, is that we do not get to stamp out identical spans. Conformity: the software has to fit a ministry, a calendar, and a clerk who already has a habit. You do not get to simplify the ministry by adding a project. Changeability: the lateness rule will change, because it is policy, and policy is written by people who are not us. Invisibility: a layer diagram can look calm while the request path is long, because a diagram has no hop count. I was designing the diagram. The diagram cannot enroll a student.

![The school, which remains if the software is deleted, beside the machinery I added before a second caller existed.](assets/blogs/images/oe-essential.svg)

*Figure 1. The left column is the product. The right column is a representation I could have deleted.*

The right column is what Brooks means by accidental. A generic repository does not enroll anyone. It can be removed and the school is still there. I grew that column and called the result architecture. The [layered shape I have written up separately](https://aliahsan.tech/blog/clean-architecture) is a response to a system that has already earned a split. This one had not.

## What a student list actually was

The feature was: given a class, return the active students, and do not return another school's students. That second clause is real on the first day. Two schools in one database will leak rows the moment a query forgets the school id. That is essential. It is also one predicate.

The path I built for it is the left side of Figure 2. A controller. `MediatR.Send`. A query type. A validator. A handler. An `IStudentRepository`. A specification object whose only job was `ClassId == id && Status == Active`. A repository method. A mapper. A DTO. The tenant "resolver" sat beside this, as another interface, with one implementation that read the same claim every time.

![Eight types on the way to one Where, beside one query on a context that already filters by school.](assets/blogs/images/oe-path.svg)

*Figure 2. Same HTTP call. The school filter is a box on the left and a property of the model on the right.*

Ousterhout describes the symptom directly: a small change touches many places, the change requires a large amount of knowledge in your head, and it is unclear which knowledge you are missing ([A Philosophy of Software Design](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php?topic=complexity), 2018). Adding a `Reason` string to a late mark was that symptom. The field had to be added to the command, the validator, the entity, the specification if anyone had filtered on it, the DTO, and the map. The lateness rule itself, the only decision that was likely to change, had no type of its own. It was smeared across the steps.

Rich Hickey's word for that smearing, in ["Simple Made Easy"](https://www.infoq.com/presentations/Simple-Made-Easy/) (Strange Loop, 2011), is complect: to braid concerns so you cannot move one without moving the others. The layered path complected tenancy, validation, mapping, and the query. The design was easy for me, in his other sense of the word. Easy means near at hand. The talks were near at hand. Simple means one fold, unbraided. The path was braided.

## A module is a decision

In December 1972 David Parnas published two decompositions of the same small system, a KWIC index, in [Communications of the ACM](https://doi.org/10.1145/361598.361623). The first made each processing step a module. He says this is what you get from turning a flowchart into code, and that it is the cut our training pushes us toward. The second hid one design decision per module: how lines are stored, how shifts are represented, how alphabetization is done. He then walked five likely changes through both cuts. In the flowchart cut, two of those changes touched every module. In the other cut, each change stayed inside the module that owned the decision.

The sentence I rebuilt around is his conclusion:

> We have tried to demonstrate by these examples that it is almost always incorrect to begin the decomposition of a system into modules on the basis of a flowchart. We propose instead that one begins with a list of difficult design decisions or design decisions which are likely to change. Each module is then designed to hide such a decision from the others.

My attendance feature was the flowchart cut. Controller, command, validator, handler, repository, specification, mapper. Those are steps in the processing of one request. They correspond to the training. They do not correspond to a decision. The decisions that were actually difficult were: which school a row belongs to, whether student number `1042` is unique in the database or unique in the school, and how a bell time becomes the status `Late`. None of those had a module. All of the steps did.

![Adding a reason to a late mark lights up every processing step, and only the attendance module when modules hide decisions.](assets/blogs/images/oe-parnas.svg)

*Figure 3. The top row is a pipeline. The bottom row is a set of decisions. The change belongs to one of them.*

Hyrum Wright's observation, [Hyrum's Law](https://www.hyrumslaw.com/), is that with enough users of an API, every observable behavior gets depended on, whatever the contract says. I did not have enough users. I had enough call sites. The moment a second handler called `Query(Specification)`, the way specifications composed was the API. A later "cleanup" of that composer became a breaking change for every feature that had learned it. Wright is describing Google-scale clients. The mechanism starts much earlier. It starts at the second caller.

## The four bills

The practice has a name from the Chrysler C3 project. Kent Beck, answering Chet Hendrickson each time Hendrickson listed a capability the system would soon need, kept saying "you aren't gonna need it." [Martin Fowler's writeup](https://martinfowler.com/bliki/Yagni.html) turns the slogan into an accounting. A presumptive feature sends four bills.

The cost of build: analysis, code, and tests for the thing. My tests of the handler proved that the handler called the repository. They could not fail if two schools both issued student number `1042`, because the fake repository had no index.

The cost of delay: the fee reminder and the report card waited while the seam was being finished. Those were the features a clerk had asked for.

The cost of carry: every later feature paid the seam. Fowler's point, and the one I felt, is that carry is charged on every change between the day you write the seam and the day it becomes useful. If it never becomes useful, you pay carry until you remove it.

The cost of repair: either the guess was wrong and you delete it, or the guess was right in outline and wrong in shape, because you built it against an understanding you had not earned yet. I was in the first branch. The thousands of schools did not arrive. Removing the seam meant untangling features that had all been taught to go through it.

![Build, delay, carry, and repair, applied to a repository interface nobody's second implementation ever needed.](assets/blogs/images/oe-costs.svg)

*Figure 4. Carry is the bill that compounds. It starts on the day the seam is written.*

[Kent Beck's later accounting](https://newsletter.kentbeck.com/p/the-cost-yagni-was-never-about) is sterner than Fowler's. Structure you build now for a feature due later pulls the cost forward and pushes the paying feature back. A correct guess does not close that gap. You spent sooner, and you shipped the clerk's screen later. The discounting does not care that you were right.

Ward Cunningham's 1992 metaphor, in the [WyCash report](http://c2.com/doc/oopsla92.html), is narrower than the way the industry uses the phrase. Shipping a first version is like taking a debt: it speeds you if you repay it promptly by rewriting as your understanding improves. The interest is time spent in a structure that no longer matches what you know. A generic repository on day one is a different transaction. It pretends the understanding is already finished.

Ron Jeffries, who was in the room for the original phrase, [separates YAGNI from skimping](https://ronjeffries.com/articles/019-01ff/iter-yagni-skimp/). Skipping the unique index is skimping. The requirement is already true: two schools will both issue `1042`. Skipping `IStudentRepository` is YAGNI. The requirement becomes true only after a sentence that starts with "what if." I had those two backwards. I built the interface, and I left the index for later.

Beck's four rules of simple design, in the order [Jeffries records them](https://ronjeffries.com/xprog/classics/jatyagnitables/), are: it runs the tests, it contains no duplication, it expresses the ideas in the program, it minimizes the number of classes and methods. The fourth rule is the one the right column of Figure 1 breaks. People stop at "no duplication," extract an interface, and add elements. One implementation behind an interface increases the number of types. It does not remove a duplicated decision. There was nothing to duplicate yet.

## Wide, and thin

Ousterhout asks you to picture a module as a rectangle. The width of the top is everything a caller has to know. The area is the work hidden underneath. A deep module hides a lot behind a small surface. A shallow module's surface is almost as complicated as its body. In the worst case the surface adds more complexity than the body removes, and the module is a net loss.

`IStudentRepository` was that case. Seven methods, one class, each method a forward to `DbSet<Student>`. Callers had to know the seven names, and the specification language, and they still had to know which school they were in, because the interface did not hide the school. The interface had moved tenancy into the signature of every method that took a specification, or into a resolver parameter, depending on the week.

The deep module is smaller to look at. `db.Students`. Under it: the school id as a SQL parameter, the filter on every LINQ query, the unique index, the rule that an insert takes its school from the context, the refusal to open the context when no school is bound. Attendance code writes business predicates. It does not mention the school. That is the whole test of the abstraction. The feature stopped saying the thing the module exists to hide.

![A repository interface as wide as its implementation, beside a school context whose surface is db.Students.](assets/blogs/images/oe-depth.svg)

*Figure 5. The left module added a word. The right module removed a parameter from every feature.*

A fake of the left module is how the index bug survives. The EF Core in-memory provider is not a relational database. Microsoft's [testing guidance](https://learn.microsoft.com/en-us/ef/core/testing/) says so: it does not enforce unique constraints the way SQL Server does. A test that passes against a hand-rolled `IStudentRepository` has the same hole. The bug lives in the SQL. The test never opened a database.

## Why the diagram felt like progress

Brooks has a second warning, from 1975, chapter 5 of *The Mythical Man-Month*. The second system is the most dangerous one an engineer designs. The first is spare, because you know you do not know. The second is where you spend every idea you cautiously left out of the first. This school system was that system. I had learned the patterns on smaller work, by reading and by caution. I spent all of them here.

Melvin Conway, ["How Do Committees Invent?," Datamation, April 1968](https://www.melconway.com/Home/Committees_Paper.html), observed that a system ends up a copy of the communication structure of the organization that designs it. I was one person. The five projects were an org chart for a platform group I did not have: a domain team, an application team, a persistence team. The folders were a costume of a communication structure. A company that actually has those teams has a different fact in front of it. Their boundary may be load-bearing. Mine was not.

Dan McKinley, ["Choose Boring Technology"](https://mcfunley.com/choose-boring-technology) (2015), frames novelty as a budget. You get a handful of innovation tokens. Spend them on the problem that is yours. The problem that was mine was a clerk accepting an attendance screen and a fee schedule. I spent the tokens on MediatR, a specification language, and a project split aimed at microservices. The tokens were gone before a student was enrolled.

Joel Spolsky called the altitude where this happens [architecture astronautics](https://www.joelonsoftware.com/2001/04/21/dont-let-architecture-astronauts-scare-you/) (2001). High enough, and the school disappears. Only the layers remain. Users were still going to ask whether Tuesday's register was right.

There is a cognitive version of the same mistake, and I want to mark the distance to the evidence. John Sweller's 1988 paper, ["Cognitive Load During Problem Solving"](https://doi.org/10.1207/s15516709cog1202_4), is about learning, not about C# solutions. The transfer I am willing to make is the one Matthew Skelton and Manuel Pais make in *Team Topologies* (2019): some load is the problem itself, and some load is the packaging of the problem. A mark being unique per student per day is intrinsic. Eight types to express a filter is packaging. The packaging occupies the same attention the lateness rule needed. Meir Lehman's law of increasing complexity, from ["Programs, Life Cycles, and Laws of Software Evolution," Proceedings of the IEEE, September 1980](https://doi.org/10.1109/PROC.1980.11805), says an evolving program gets more complex unless you spend work keeping it down. The law still applies if you start with the right column of Figure 1 already full. You then spend the maintenance budget deleting ceremony, and the domain mess waits.

## The shape I rebuilt

One project. Namespaces are the modules: `Tenancy`, `Catalog`, `Students`, `Attendance`, `Fees`. One deployable. [Fowler's "MonolithFirst"](https://martinfowler.com/bliki/MonolithFirst.html) and Microsoft's [guide to common web architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures) describe the same stage. Early on, the natural boundaries are often still invisible, and separating a system before it can ship an independent slice adds a kind of complexity the slice does not need. The sentence I wish I had taped to the monitor is from the [introduction to that guide](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/): in the vast majority of situations a single application is much easier to build, deploy, and debug than an application made of many services. Samples that exist to demonstrate every pattern in one solution are textbooks. A textbook's job is to contain the patterns. A product's job is to mark attendance.

The endpoint-per-feature shape inside a module is [Jimmy Bogard's vertical slice](https://www.jimmybogard.com/vertical-slice-architecture/), stopped at the point where there is only one slice. A class with the HTTP method and the query is enough. A handler interface around that class is the flowchart cut again.

### Where the school id comes from

The school id is a claim written at login, from the user's row. It is not a query-string parameter. A client that can choose the tenant does not have a tenant. Middleware binds the claim onto a scoped object. `SchoolContext` is scoped too, and it receives the same object. A singleton tenant is a cross-request leak. That bug is quieter than a missing interface, and it is the one that puts school B's students on school A's screen.

```csharp
public sealed class RequestTenant : ITenantContext
{
    public Guid SchoolId { get; private set; }

    public void Bind(Guid schoolId)
    {
        if (schoolId == Guid.Empty)
            throw new InvalidOperationException("Authenticated user has no school.");
        SchoolId = schoolId;
    }
}

public sealed class TenantMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext http, RequestTenant tenant)
    {
        if (http.User.Identity?.IsAuthenticated == true)
        {
            var claim = http.User.FindFirstValue("school_id");
            if (!Guid.TryParse(claim, out var schoolId))
            {
                http.Response.StatusCode = StatusCodes.Status403Forbidden;
                return;
            }
            tenant.Bind(schoolId);
        }

        await next(http);
    }
}
```

A logged-in user with no school claim gets 403. Sending them through 401 asks them to log in again, and the next login still has no school. Anonymous endpoints (login, health) do not bind. If one of them touches `SchoolContext`, the constructor below throws. That is the failure I want.

```csharp
builder.Services.AddScoped<RequestTenant>();
builder.Services.AddScoped<ITenantContext>(sp => sp.GetRequiredService<RequestTenant>());
builder.Services.AddDbContext<SchoolContext>();
builder.Services.AddDbContext<CatalogContext>();
```

### Two contexts, because they are two decisions

"Which schools exist?" and "which rows are inside this school?" are different questions, with different callers. An operator lists schools. A teacher lists students. Putting both in one context and remembering to call `IgnoreQueryFilters()` on the admin path means a teacher endpoint can call it too, and the compiler will not stop them. `IgnoreQueryFilters()` removes every filter on that query. The day you add a soft-delete filter, the admin screen that wanted "all schools" also starts returning deleted students.

So the catalog is its own context. It has no tenant. It stores id, name, and, later, the key of the lateness rule. Child tables live in `SchoolContext`, and they are filtered.

```csharp
public interface ISchoolScoped
{
    Guid SchoolId { get; set; }
}

// Student and AttendanceMark implement this.
// The catalog School type does not, and it is not in this context.

public sealed class SchoolContext : DbContext
{
    public SchoolContext(DbContextOptions<SchoolContext> options, ITenantContext tenant)
        : base(options)
    {
        if (tenant.SchoolId == Guid.Empty)
            throw new InvalidOperationException("SchoolContext opened before a school was bound.");
        SchoolId = tenant.SchoolId;
    }

    public Guid SchoolId { get; }

    public DbSet<Student> Students => Set<Student>();
    public DbSet<AttendanceMark> Attendance => Set<AttendanceMark>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Student>(b =>
        {
            b.HasQueryFilter(s => s.SchoolId == SchoolId);
            b.HasIndex(s => new { s.SchoolId, s.Number }).IsUnique();
        });

        modelBuilder.Entity<AttendanceMark>(b =>
        {
            b.HasQueryFilter(a => a.SchoolId == SchoolId);
            b.HasIndex(a => new { a.SchoolId, a.StudentId, a.Day }).IsUnique();
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        foreach (var entry in ChangeTracker.Entries<ISchoolScoped>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.SchoolId = SchoolId;
            }
            else if (entry.State == EntityState.Modified
                && entry.Property(nameof(ISchoolScoped.SchoolId)).IsModified)
            {
                throw new InvalidOperationException("A row cannot change school.");
            }
        }

        return base.SaveChangesAsync(ct);
    }
}
```

The filter references a property of this context instance. EF reads it when the query executes and sends it as a parameter, so the SQL text is the same for every school. That behavior is [documented with global query filters](https://learn.microsoft.com/en-us/ef/core/querying/filters). The filter is a read policy. `SaveChanges` will persist whatever `SchoolId` is on the entity, which is why the override stamps it and then refuses a change. A request DTO for "mark this student" has no school id property. There is nothing to copy.

A SQL string sent through `Database.ExecuteSql` does not pass through the filter. Anything that does not go through the model is a hole in the tenant boundary. I keep those calls in `Tenancy`, next to the filter, so the hole has one door.

Migrations construct a context too. The constructor demands a school, so the design-time factory passes a fixed id and a LocalDB connection string. The risk is the connection string. If it ever points at production, that factory is a tenant that can migrate production. It stays on LocalDB.

A morning job that emails every school does not call `IgnoreQueryFilters()`. It reads ids from the catalog and opens one `SchoolContext` per school. Each context can see one school. A soft-delete filter added later stays on.

### The feature

```csharp
public static class AttendanceEndpoints
{
    public static void Map(IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/attendance").RequireAuthorization();
        group.MapGet("/{classId:guid}", List);
        group.MapPost("/", Mark);
    }

    private static async Task<IResult> List(
        Guid classId, DateOnly day, SchoolContext db, CancellationToken ct)
    {
        var rows = await db.Attendance
            .Where(a => a.ClassId == classId && a.Day == day)
            .OrderBy(a => a.Student.LastName)
            .Select(a => new AttendanceRow(
                a.StudentId, a.Student.LastName, a.Status, a.Reason))
            .ToListAsync(ct);

        return Results.Ok(rows);
    }

    private static async Task<IResult> Mark(
        MarkAttendance body, SchoolContext db, TimeProvider clock, CancellationToken ct)
    {
        var student = await db.Students
            .Where(s => s.Id == body.StudentId)
            .Select(s => new { s.Id, s.ClassId })
            .SingleOrDefaultAsync(ct);

        if (student is null)
            return Results.NotFound();

        var arrived = TimeOnly.FromDateTime(clock.GetLocalNow().DateTime);
        var status = LatePolicy.Decide(arrived, body.Bell);

        db.Attendance.Add(new AttendanceMark
        {
            Id = Guid.NewGuid(),
            StudentId = student.Id,
            ClassId = student.ClassId,
            Day = body.Day,
            Status = status,
            Reason = status == AttendanceStatus.Late ? body.Reason : null
        });

        try
        {
            await db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException)
        {
            return Results.Conflict();
        }

        return Results.Ok(new { status });
    }
}

public static class LatePolicy
{
    public static AttendanceStatus Decide(TimeOnly arrived, TimeOnly bell)
        => arrived > bell ? AttendanceStatus.Late : AttendanceStatus.Present;
}
```

`SchoolId` is absent on purpose. The context stamps it. A second mark for the same student on the same day hits the unique index and comes back as 409. That conflict is the domain rule (one mark per student per day), enforced where a forgotten `if` cannot forget it.

`LatePolicy.Decide` is a module. Parnas's conclusion drops the idea that a module has to be a class hierarchy. One decision, one function, the bell rule the board actually wrote. A static method was embarrassing to me the first time I left it there. The embarrassment was the second-system effect, still talking.

### The test that would have caught the real bug

SQLite is not SQL Server. It is relational enough to enforce a unique index, which is the bar the in-memory provider does not clear. The connection stays open because an in-memory SQLite database dies with the connection.

```csharp
public sealed class FixedTenant(Guid schoolId) : ITenantContext
{
    public Guid SchoolId { get; } = schoolId;
}

public sealed class SchoolBoundaryTests : IDisposable
{
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    public SchoolBoundaryTests()
    {
        _connection.Open();
        using var setup = NewContext(Guid.NewGuid());
        setup.Database.EnsureCreated();
    }

    [Fact]
    public async Task Same_number_is_legal_in_two_schools_and_invisible_across_them()
    {
        var schoolA = Guid.NewGuid();
        var schoolB = Guid.NewGuid();

        await using (var db = NewContext(schoolA))
        {
            db.Students.Add(new Student { Id = Guid.NewGuid(), Number = "1042", LastName = "Khan" });
            await db.SaveChangesAsync();
        }

        await using (var db = NewContext(schoolB))
        {
            db.Students.Add(new Student { Id = Guid.NewGuid(), Number = "1042", LastName = "Ali" });
            await db.SaveChangesAsync();

            var names = await db.Students.Select(s => s.LastName).ToListAsync();
            Assert.Equal(["Ali"], names);
        }
    }

    private SchoolContext NewContext(Guid schoolId)
    {
        var options = new DbContextOptionsBuilder<SchoolContext>()
            .UseSqlite(_connection)
            .Options;
        return new SchoolContext(options, new FixedTenant(schoolId));
    }

    public void Dispose() => _connection.Dispose();
}
```

If `Number` is unique on its own, the second `SaveChangesAsync` throws, and the test fails. If the filter is missing, `"Khan"` appears in school B's list, and the test fails. A repository fake can satisfy neither assertion. I would rather have this one test than the handler tests I used to write.

### When the second rule is actually written

The gate's first question is "two implementations in this repository today?" For lateness, the answer was no. One board, one sentence, one function. The day a second board's rule is in writing (a ten-minute grace, say), the answer flips, and the interface earns its name from the decision:

```csharp
public interface ILatePolicy
{
    AttendanceStatus Decide(TimeOnly arrived, TimeOnly bell);
}

public sealed class OnTheBell : ILatePolicy
{
    public AttendanceStatus Decide(TimeOnly arrived, TimeOnly bell)
        => arrived > bell ? AttendanceStatus.Late : AttendanceStatus.Present;
}

public sealed class TenMinuteGrace : ILatePolicy
{
    public AttendanceStatus Decide(TimeOnly arrived, TimeOnly bell)
        => arrived > bell.AddMinutes(10) ? AttendanceStatus.Late : AttendanceStatus.Present;
}
```

The catalog stores the key (`on-the-bell`, `grace-10`) on the school row. One dictionary resolves it. No assembly scanning, no plugin folder. A third rule is a third class and a third key, written when a third sentence exists. Michael Nygard's [architecture decision record](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) (2011) is the right size for the reason:

```text
ADR 004 — Late mark is on the bell
Status: accepted

The board's written rule is one sentence: arrival after the bell is Late.
We have one board.

Decision: LatePolicy.Decide is a static method. No interface.

Consequences: a second written rule replaces this ADR.
Until that page exists, an interface is a guess.
```

G. K. Chesterton's fence, in *The Thing* (1929), says you do not remove a structure until you can say why it was put there. The ADR is how the next person finds out, including me in six months. [Fowler's sacrificial architecture](https://martinfowler.com/bliki/SacrificialArchitecture.html) is the other half: the person who throws the structure away should be the person who can say what it was for. I could. The unit of work was mine. It wrapped one `DbContext`, which already is a unit of work. It came out.

Once `Fees` and `Attendance` both exist, the shortcut to watch is a call from one into the other's types. A namespace test makes that call fail in CI. I use [NetArchTest](https://github.com/BenMorris/NetArchTest) for it, and I add the test when the second namespace exists, not before. Before that, the test is a seam with one side.

```csharp
[Fact]
public void Attendance_does_not_reference_Fees()
{
    var result = Types.InAssembly(typeof(AttendanceEndpoints).Assembly)
        .That().ResideInNamespace("School.Attendance")
        .ShouldNot().HaveDependencyOn("School.Fees")
        .GetResult();

    Assert.True(result.IsSuccessful);
}
```

| Decision | Home | Already true? |
|---|---|---|
| Which school a query returns | `HasQueryFilter` on the context | Yes. Two schools, one database. |
| Which school a row is written to | `SaveChangesAsync` stamps `SchoolId` and rejects a change | Yes. The client can post any guid. The filter does not see inserts. |
| Student number `1042` in two schools | Unique `(SchoolId, Number)` | Yes. Both schools issue numbers. |
| One mark per student per day | Unique `(SchoolId, StudentId, Day)`, mapped to 409 | Yes. That is what a register is. |
| Late versus present, one board | `LatePolicy.Decide` | Yes. One written sentence. |
| Late versus present, two boards | `ILatePolicy`, two classes, a key on the school | Only once the second sentence is on paper. |
| Attendance reaching into Fees | One architecture test | Only once both namespaces exist. |

## The gate

![Three questions before a new interface, and the order a module is allowed to grow.](assets/blogs/images/oe-gate.svg)

*Figure 6. A yes at question 1 is the only yes that adds code today. The strip along the bottom is permission to grow, not a roadmap I am committing to in week one.*

John Gall, *General Systemantics* (1975), later retitled *Systemantics*, wrote a half-satirical book about how systems fail. One rule out of it is used seriously because the counterexamples are hard to find: a complex system that works is found to have grown from a simple system that worked, and a complex system designed from scratch tends not to work. He notes that engineers dislike how sweeping it is. I am with the engineers on the sweeping part. I still started attendance as one method, because I had already watched the from-scratch version collapse.

The order in Figure 6 is the implementation of that restraint:

1. Two implementations in this repository today. Then hide the decision, and name the decision. `ILatePolicy`, never `IRepository`.
2. No date, and no named change. Stop. Inline it.
3. A date, and no measurement and no written rule. Write the ADR. Build nothing. The paragraph is cheap. The interface is carry.
4. A traced slow query, a failing test, a second board's PDF. Then the smallest seam that hides that one decision. An index before a queue. Knuth's critical 3 percent, below, is this step and no earlier step.

Lehman's law is why the strip in Figure 6 has a direction. Change will arrive and it will add complexity unless you spend effort removing some. You want that budget available for the change that is real. Filling it in week one spends it on the change you imagined.

## Where I still pay for structure

I still split a system when question 1 is already yes on day one. A tax engine with two countries in the contract has two implementations before the first commit. Hiding the tax decision is the first module, and it is essential complexity, Brooks's left column. A payments integration that must be replaced when a provider changes price is a decision you already know is unstable. Parnas would hide it. I would hide it. The school had no such pair.

I still extract a project when `internal` needs to mean something a namespace cannot, which in practice is a second person who does not share my reflexes. Conway applies in that direction too. The communication structure changed, so the system may follow. Until then, a second `.csproj` is a costume again.

The [clean architecture writeup](https://aliahsan.tech/blog/clean-architecture) is the shape I use after those conditions hold: more than one rate of change, a domain that is harder than the framework, someone besides me who has to be kept out of the internals. Using it as the starting template for a school register was the error this essay is about. The patterns are fine. The timing was the whole bug.

## The sentence people quote in half

Donald Knuth, ["Structured Programming with go to Statements," ACM Computing Surveys, December 1974](https://doi.org/10.1145/356635.356640):

> We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%.

The second sentence is the one that gets cut. He was talking about instruction-level efficiency, and he had spent seven years watching programmers guess their hot spots wrong. Measurement first, then the critical slice. I am borrowing the shape of the argument for design, and I want the borrow marked as a borrow. A unique index on a register is the critical slice. You already know the query. An interface with one implementation is not an optimization of anything. It does not make the query faster, and it makes the 97 percent heavier, which is the carry cost under another name.

Skipping the index because "Knuth said premature optimization is evil" is the misread. Building a message bus in week one because "we might have a hot path" is the other misread. Figure 6, step 4, is the reading I use. Trace the query. Add the index. If the index cannot carry the write, then talk about a queue, and not before.

## References

1. Frederick P. Brooks Jr., ["No Silver Bullet: Essence and Accidents of Software Engineering,"](https://www.cs.unc.edu/techreports/86-020.pdf) *IEEE Computer*, vol. 20, no. 4, April 1987. Free copy: UNC technical report 86-020.
2. Frederick P. Brooks Jr., *The Mythical Man-Month*, Addison-Wesley, 1975, chapter 5 (the second-system effect).
3. David L. Parnas, ["On the Criteria To Be Used in Decomposing Systems into Modules,"](https://doi.org/10.1145/361598.361623) *Communications of the ACM*, vol. 15, no. 12, December 1972.
4. Donald E. Knuth, ["Structured Programming with go to Statements,"](https://doi.org/10.1145/356635.356640) *ACM Computing Surveys*, vol. 6, no. 4, December 1974.
5. Meir M. Lehman, ["Programs, Life Cycles, and Laws of Software Evolution,"](https://doi.org/10.1109/PROC.1980.11805) *Proceedings of the IEEE*, vol. 68, no. 9, September 1980.
6. John Gall, *General Systemantics*, 1975. Later editions titled *Systemantics* and *The Systems Bible*.
7. Melvin E. Conway, ["How Do Committees Invent?,"](https://www.melconway.com/Home/Committees_Paper.html) *Datamation*, April 1968.
8. Ward Cunningham, ["The WyCash Portfolio Management System,"](http://c2.com/doc/oopsla92.html) OOPSLA experience report, 1992.
9. Martin Fowler, ["Yagni,"](https://martinfowler.com/bliki/Yagni.html) 2015. Also ["MonolithFirst"](https://martinfowler.com/bliki/MonolithFirst.html) and ["SacrificialArchitecture"](https://martinfowler.com/bliki/SacrificialArchitecture.html).
10. Kent Beck, via Ron Jeffries, ["You're NOT gonna need it!"](https://wiki.c2.com/?YouArentGonnaNeedIt) and the [four rules of simple design](https://ronjeffries.com/xprog/classics/jatyagnitables/). Jeffries, ["YAGNI, yes. Skimping, no."](https://ronjeffries.com/articles/019-01ff/iter-yagni-skimp/) Beck, ["The Cost YAGNI Was Never About."](https://newsletter.kentbeck.com/p/the-cost-yagni-was-never-about)
11. John Ousterhout, *A Philosophy of Software Design*, Yaknyam Press, 2018. [Stanford CS190 notes](https://web.stanford.edu/~ouster/cgi-bin/cs190-winter18/lecture.php?topic=complexity) cover the same symptoms.
12. Rich Hickey, ["Simple Made Easy,"](https://www.infoq.com/presentations/Simple-Made-Easy/) Strange Loop, 2011.
13. John Sweller, ["Cognitive Load During Problem Solving: Effects on Learning,"](https://doi.org/10.1207/s15516709cog1202_4) *Cognitive Science*, vol. 12, no. 2, 1988. Applied to teams by Matthew Skelton and Manuel Pais, *Team Topologies*, IT Revolution, 2019.
14. Hyrum Wright, [Hyrum's Law](https://www.hyrumslaw.com/).
15. Dan McKinley, ["Choose Boring Technology,"](https://mcfunley.com/choose-boring-technology) 2015.
16. Joel Spolsky, ["Don't Let Architecture Astronauts Scare You,"](https://www.joelonsoftware.com/2001/04/21/dont-let-architecture-astronauts-scare-you/) 21 April 2001.
17. Michael Nygard, ["Documenting Architecture Decisions,"](https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions) 15 November 2011.
18. Jimmy Bogard, ["Vertical Slice Architecture,"](https://www.jimmybogard.com/vertical-slice-architecture/) 2018.
19. Microsoft, ["Common web application architectures"](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures) and ["Architect modern web applications with ASP.NET Core and Azure."](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/) EF Core: [global query filters](https://learn.microsoft.com/en-us/ef/core/querying/filters), [testing](https://learn.microsoft.com/en-us/ef/core/testing/).

## Stay Connected

If you enjoy practical content on ASP.NET Core, Angular, Clean Architecture, and scalable system design, subscribe to my newsletter for production-level engineering insights.

### Ali Ahsan

Full-Stack Developer | ASP.NET Core | Angular | SQL

 [LinkedIn](https://www.linkedin.com/in/ali-ahsan-6895a9315/) | [GitHub](https://github.com/aliahsan9) |  [Blogs](/blogs) | [Newsletter](/news)

Building secure, scalable, and real-world applications.
