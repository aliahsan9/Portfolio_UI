# Clean Architecture in a Real Project (Not Theory)

## Introduction

Clean Architecture is often discussed in abstract diagrams and theoretical explanations, but its real value only becomes clear when applied to an actual project.

In this article, I will walk through how I implemented Clean Architecture in a real-world SaaS application — a multi-tenant school management system called **SchoolFish**. Instead of focusing on definitions, this post explains practical decisions, challenges, and trade-offs I encountered while building the system.

---

## Why I Chose Clean Architecture

When I started building SchoolFish, the application was small. A simple layered structure would have worked initially. However, I knew the system would grow to include:

- Multiple modules (students, exams, attendance, etc.)
- Role-based access control
- Multi-tenancy support
- Complex business logic

Without a proper structure, the codebase would quickly become difficult to maintain.

Clean Architecture provided:

- Clear separation of concerns  
- Better testability  
- Flexibility to scale features  
- Independence from frameworks  

---

## High-Level Structure

The backend was structured into the following layers:

src/
├── Domain/
├── Application/
├── Infrastructure/
├── WebAPI/


Each layer has a specific responsibility and depends only on layers inside it (never outward).

---

## 1. Domain Layer (Core Business Logic)

The Domain layer is the heart of the application. It contains:

- Entities
- Value objects
- Business rules

Example:

```csharp
public class Student : BaseEntity
{
    public string Name { get; set; }
    public Guid TenantId { get; set; }

    public void UpdateName(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Name cannot be empty");

        Name = name;
    }
}

Key Decisions
No dependencies on frameworks
No database logic
Pure business rules only

This ensures the domain remains stable even if technologies change.

2. Application Layer (Use Cases)

This layer contains the actual use cases of the system.

I implemented CQRS (Command Query Responsibility Segregation) here.

Example: Create Student Command
public record CreateStudentCommand(string Name) : IRequest<Guid>;

public class CreateStudentHandler : IRequestHandler<CreateStudentCommand, Guid>
{
    private readonly IStudentRepository _repository;
    private readonly ITenantProvider _tenantProvider;

    public CreateStudentHandler(IStudentRepository repository, ITenantProvider tenantProvider)
    {
        _repository = repository;
        _tenantProvider = tenantProvider;
    }

    public async Task<Guid> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        var student = new Student
        {
            Name = request.Name,
            TenantId = _tenantProvider.GetTenantId()
        };

        await _repository.AddAsync(student);
        return student.Id;
    }
}
Why this works well
Business logic is centralized
Easy to test handlers independently
Clear separation between read and write operations
3. Infrastructure Layer (External Concerns)

This layer handles:

Database (Entity Framework Core)
Repositories
External services

Example:

public class StudentRepository : IStudentRepository
{
    private readonly AppDbContext _context;

    public StudentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Student student)
    {
        await _context.Students.AddAsync(student);
        await _context.SaveChangesAsync();
    }
}
Key Observations
Infrastructure depends on Application and Domain
Domain knows nothing about EF Core
Easy to replace database if needed
4. Web API Layer (Entry Point)

This is the outermost layer.

Responsibilities:

Handle HTTP requests
Validate input
Call Application layer

Example:

[HttpPost]
public async Task<IActionResult> Create(CreateStudentCommand command)
{
    var result = await _mediator.Send(command);
    return Ok(result);
}
Important Note

Controllers remain thin. They do not contain business logic.

Multi-Tenancy Integration

One of the most interesting challenges was integrating multi-tenancy into Clean Architecture.

Approach
Added TenantId to all relevant entities
Extracted tenant information from JWT
Injected tenant context via ITenantProvider

This allowed:

Automatic data isolation
No duplication of logic across tenants
Clean separation of concerns
Problems I Faced (and How I Solved Them)
1. Over-Engineering Early

At the beginning, Clean Architecture felt heavy for a small project.

Solution:
I started simple and introduced patterns gradually as complexity increased.

2. Too Many Layers Confusion

Initially, navigating between layers slowed me down.

Solution:
Clear folder structure and naming conventions helped reduce confusion.

3. Debugging Complexity

Tracing a request across multiple layers was harder than a simple architecture.

Solution:
Used logging and structured request flow to track execution.

4. Boilerplate Code

CQRS and repository patterns introduced extra code.

Solution:
Accepted this trade-off for long-term maintainability and clarity.

What I Gained From This Approach

Implementing Clean Architecture in a real project helped me:

Think in terms of use cases, not just controllers
Separate business logic from infrastructure
Design systems that scale without becoming messy
Write code that is easier to test and maintain
When Should You Use Clean Architecture?

Clean Architecture is most useful when:

Your project is expected to grow
You have complex business logic
You want long-term maintainability
You are building SaaS or enterprise systems

It may be unnecessary for:

Very small projects
Simple CRUD applications
Conclusion

Clean Architecture is not just a theoretical concept — it becomes extremely valuable when applied to real-world systems.

In the case of SchoolFish SaaS, it allowed me to build a scalable, maintainable, and structured backend that can evolve over time without major rewrites.

While it introduces some complexity upfront, the long-term benefits far outweigh the initial learning curve.

This experience significantly improved my understanding of system design and helped me transition from writing simple applications to building structured, production-ready systems.


---

If you want, I can next:
- :contentReference[oaicite:0]{index=0}
- :contentReference[oaicite:1]{index=1}
- Or :contentReference[oaicite:2]{index=2}
