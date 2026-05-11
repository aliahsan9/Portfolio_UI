# When Architecture Becomes the Problem: My Experience With Overengineering in Multi-Tenant Applications

![JWT Authentication](assets/blogs/images/over-engineering.avif)

There’s a point in software development where architecture stops helping and starts getting in the way.
I learned that the hard way.
Like many developers, I got fascinated by **perfect architecture.** I watched videos about scalable systems, read articles about enterprise patterns, explored [Clean Architecture](https://aliahsan.tech/blog/clean-architecture), CQRS, repositories, specifications, domain events, abstractions everywhere, and convinced myself that this was how real software should be built.
At that time, I wasn’t building a massive SaaS platform with millions of users.
I was building a school management system.
But in my mind, I was preparing for Google-scale complexity before even validating the product itself.
And eventually, the project collapsed under its own architecture.

* * *

## Professional Architecture

When I first started building a multi-tenant school management system, I wanted to do everything **the right way.**
Not just working code but perfect code.
I divided the solution into multiple layers. Separate projects for Domain, Application, Infrastructure, Persistence, and API. Then came repositories, services, DTOs, handlers, interfaces, specifications, unit of work, generic repositories, tenant providers, middleware pipelines, and custom abstractions for almost everything.

At first, it felt amazing.
The solution looked impressive.
The folder structure looked enterprise-level.
The architecture diagrams looked clean.
I thought complexity meant maturity.
But after a few weeks, development became painful.
Adding one small feature suddenly required touching five or six layers.
A simple attendance module turned into a chain of DTOs, validators, handlers, repositories, mappings, and interfaces before a single record could even reach the database.

The architecture that was supposed to give flexibility was actually slowing everything down.

* * *

## Scalability Illusion

One of the biggest mistake there was designing for imaginary future problems.
I did exactly that.
I kept thinking
what if this app grows to thousands of schools,
what if I need distributed services later,
what if I need microservices in the future and
what if tenants need custom workflows...

So I engineered solutions for problems that did not exist yet.
The irony is that the application never even reached the point where those complexities became necessary.
Instead of building a product quickly and validating it, I spent most of my time maintaining architecture itself.
That’s the hidden cost of overengineering.
You stop building features.
You start serving the architecture.

* * *

## Clean Architecture

[Clean Architecture](https://aliahsan.tech/blog/clean-architecture) itself is not bad.
In fact, it solves real problems in large systems.
The issue is blindly applying enterprise-level patterns to small or early-stage applications.
There’s a huge difference between
using architecture intentionally
and
using architecture because it looks professional.

A startup MVP does not need the same complexity as a banking platform.
A school management system with a few hundred users does not need the same engineering strategy as Netflix.
But many developers, including me, confuse scalability with complexity.
Simple systems can scale surprisingly far when written cleanly.

Complex systems fail surprisingly fast when written unnecessarily.

* * *

## Multi-Tenancy Made Everything Worse

Multi-tenant applications already introduce complexity naturally.
You have tenant isolation, authentication boundaries, role management, data filtering, permissions, configurations, and sometimes tenant-specific customization.
That alone is enough to think carefully about architecture.
But I added even more layers on top of that complexity.

For example, something as simple as retrieving students became exhausting.
A request would travel through controllers, application services, CQRS handlers, repositories, specifications, tenant resolvers, mappers, and DTO transformers before returning data.
Debugging became frustrating.
Tracing bugs became difficult.
Even understanding my own code after a few weeks became mentally draining.
The architecture was technically “clean,” but development experience became messy.

That contradiction taught me an important lesson was that the
code structure should reduce cognitive load, not increase it.

* * *

## The Problem With Too Many Abstractions

One of the most dangerous things in software engineering is unnecessary abstraction.
I started creating interfaces for almost everything.
Interfaces for repositories.
Interfaces for services.
Interfaces for providers.
Interfaces for managers.
Even when there was only one implementation and never going to be another.
At some point, I realized I was writing more abstraction code than business logic.
Instead of solving school-related problems, I was solving architectural problems I had invented myself.

This is where many projects silently die.
Not because developers lack skill.
But because the codebase becomes emotionally exhausting to work with.
Every feature feels heavy.
Every change feels risky.
Every file depends on ten other files.
Momentum disappears and once momentum disappears, motivation usually follows.

* * *

## The Day I Realized Simplicity Wins

After struggling for a long time, I decided to restart,
not from scratch technically,
but mentally I stopped trying to build the perfect architecture.
Instead, I focused on building a working product. I moved toward a simpler modular monolith approach.
Clear modules and simple services, direct EF Core usage where appropriate, manual mappings, minimal abstractions.

Business-first development and suddenly, everything became faster.
Development speed improved, debugging became easier.
Features became enjoyable to build again.
The codebase finally started feeling alive instead of academic.
Ironically, the simpler architecture was more maintainable than the **perfect** one.
Because maintainability is not about how many patterns you use.
It’s about how easily developers can understand and modify the system.

* * *

## Architecture Reality

This is probably the biggest lesson I learned.
Architecture should evolve from real problems, not imagined ones.
If scaling becomes a real issue later, you can evolve the system gradually.
If tenant customization becomes difficult, then introduce patterns to solve it.
If performance bottlenecks appear, optimize strategically.
But adding complexity too early creates a system optimized for assumptions instead of reality.

Good architecture is not about showing how much you know.
It’s about removing friction from development.
Sometimes the best engineering decision is choosing not to overengineer.

* * *

## Developers Often Build for Other Developers

There’s also a psychological side to this that many developers secretly want their projects to look senior.
We want layered diagrams, fancy patterns and complex folder structures.
Because simple code feels too ordinary.
But users do not care about your architecture.

They care whether the software works.
A school administrator does not care if you used CQRS.
Teachers do not care about repository patterns.
Students do not care whether your services follow strict dependency inversion.
They care about speed, reliability, and usability.
The best software is often boring internally.
And that’s perfectly okay.

* * *

## Simplicity Requires More Discipline Than Complexity

Ironically, writing simple software is harder than writing complex software.
Complexity can hide poor decisions.
Simplicity exposes them immediately.
When your architecture is simple, your business logic must actually be clean.
You cannot hide behind endless abstractions.
You have to think carefully about naming, module boundaries, and responsibilities.

That kind of simplicity takes maturity.
And I think many developers only understand this after experiencing overengineering personally.
I definitely did.

* * *

## Conclusion

I don’t regret learning [Clean Architecture](https://aliahsan.tech/blog/clean-architecture) or advanced patterns.
They taught me valuable concepts.
But I regret believing that every project needed them from day one.
Software engineering is not about adding layers endlessly.

It’s about balancing complexity with actual business needs.
If you are building an MVP, a startup product, or an internal system, you probably need less architecture than you think.
Start simple.
Build fast.
Solve real problems first.
Then let the architecture grow naturally with the product.
Because sometimes the biggest reason projects fail is not bad code.
It’s too much architecture before the product even has a chance to live

## Stay Connected

If you enjoy practical content on ASP.NET Core, Angular, Clean Architecture, and scalable system design, subscribe to my newsletter for production-level engineering insights.

### Ali Ahsan

Full-Stack Developer | ASP.NET Core | Angular | SQL

 [LinkedIn](https://www.linkedin.com/in/ali-ahsan-6895a9315/) | [GitHub](https://github.com/aliahsan9) |  [Blogs](/blogs) | [Newsletter](/news)
  
Building secure, scalable, and real-world applications.
