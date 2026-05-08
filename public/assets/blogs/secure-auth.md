# How I Built Production-Ready JWT Authentication in ASP.NET Core + Angular

![JWT Authentication](assets/blogs/images/jwt-thumbnail.webp)

Authentication is one of the most critical parts of any modern web application. It protects user data, secures APIs, controls access to resources, and forms the foundation of application security.
While building multiple full-stack applications using ASP.NET Core and Angular, I realized that many authentication implementations work fine in development but fail in real production environments due to poor security decisions, weak token handling, or incorrect architecture.

In this article, I'll walk through how I designed and implemented a production-ready JWT authentication system using ASP.NET Core and Angular, including the architectural decisions, security improvements, common mistakes to avoid, and the patterns I use in real-world applications.

## Problem

Most beginner authentication systems only focus on one thing:

> "Can the user log in successfully?"

But production systems require much more than that.

The challenge I wanted to solve was building an authentication system that was:

- Secure
- Scalable
- Maintainable
- Frontend-friendly
- Resistant to common vulnerabilities
- Easy to extend for enterprise applications

The application requirements included:

- User registration and login
- JWT access token authentication
- Refresh token mechanism
- Role-based authorization
- Secure API communication
- Angular route protection
- Automatic token refresh
- Proper logout handling
- Scalable architecture

I also wanted to avoid the common anti-patterns I often see in tutorial-based implementations.

## Why This Matters

Authentication is directly tied to application trust.

A weak authentication system can lead to:

- Account hijacking
- Token theft
- Session abuse
- Unauthorized access
- Data breaches
- Poor user experience

For businesses, authentication issues can become expensive very quickly.

From a developer perspective, authentication is one of the fastest ways recruiters evaluate engineering maturity.

A developer who understands:

- token lifecycle management
- API security
- authorization architecture
- refresh token strategies
- frontend/backend integration

is immediately seen differently from someone who only knows basic CRUD operations.

That's why I approached this implementation like a real production system instead of a tutorial project.

## Common Mistakes

Before designing the architecture, I identified several mistakes that appear repeatedly in many authentication implementations.

### Storing JWT Tokens in LocalStorage

This is one of the most common mistakes.

LocalStorage is vulnerable to XSS attacks. If malicious JavaScript executes inside the application, tokens can easily be stolen.

Instead, I used secure HttpOnly cookies for refresh tokens.

### No Refresh Token Mechanism

Many systems force users to log in repeatedly because access tokens expire without a refresh strategy.

A production system should:

- keep access tokens short-lived
- refresh them securely
- invalidate compromised sessions properly

### Weak Password Storage

Storing passwords incorrectly is catastrophic.

Passwords should never:

- be encrypted manually
- use SHA256 directly
- be stored in plain text

I used ASP.NET Core Identity password hashing, which provides strong built-in protection.

### Long-Lived Access Tokens

Keeping JWT access tokens valid for days or weeks increases security risk dramatically.

I used:

- short-lived access tokens
- rotating refresh tokens
- secure re-authentication flow

### Missing Authorization Layers

Authentication verifies identity.

Authorization verifies permissions.

Many applications authenticate users correctly but fail to implement proper role or policy-based access control.

## My Approach

I designed the system using a layered architecture to keep authentication isolated, scalable, and maintainable.

### Backend Architecture

The ASP.NET Core backend was structured into:

- API Layer
- Application Layer
- Infrastructure Layer
- Domain Layer

Authentication responsibilities were separated into dedicated services.

![Architecture Example](assets/blogs/images/example.png)

### Authentication Flow

The login process works like this:

1. User submits credentials
2. Server validates user
3. Access token is generated
4. Refresh token is generated
5. Access token returned to Angular
6. Refresh token stored securely
7. Angular attaches JWT to protected requests
8. Expired tokens automatically refresh

This architecture provides:

- better security
- cleaner session handling
- smoother user experience

### Token Strategy

I used two different tokens.

#### Access Token

Purpose:

- authorize API requests

Characteristics:

- short expiration time
- stateless
- attached to requests

#### Refresh Token

Purpose:

- obtain new access tokens

Characteristics:

- long-lived
- securely stored
- revocable
- rotated periodically

This approach minimizes risk while maintaining usability.

## Code Examples

### JWT Token Generation

The access token generation service:

![JWT Token Generation](assets/blogs/images/jwt.png)

### Login Endpoint

The authentication endpoint:

![Login Endpoint](assets/blogs/images/login.png)

### Angular HTTP Interceptor

Angular automatically attaches the JWT token to protected requests.

![Angular Interceptor](assets/blogs/images/angular.png)

This keeps API communication centralized and clean.

### Route Protection

Protected Angular routes:

![Route Guard](assets/blogs/images/guard.png)

This prevents unauthorized navigation inside the frontend application.

## Performance/Security Improvements

After the core implementation worked, I focused heavily on hardening security and improving reliability.

### Refresh Token Rotation

Every refresh request generates:

- a new access token
- a new refresh token

Old refresh tokens are invalidated immediately.

This prevents token replay attacks.

### Secure Cookie Configuration

Refresh tokens were stored using:

```csharp
HttpOnly = true
Secure = true
SameSite = Strict
```

This protects against:

- XSS
- CSRF
- client-side token access

### Role-Based Authorization

Protected endpoints use authorization attributes:

```csharp
[Authorize(Roles = "Admin")]
```

This ensures only authorized users can access sensitive operations.

### Centralized Exception Handling

Authentication-related errors were handled through middleware instead of scattered try-catch blocks.

This improved:

- maintainability
- consistency
- logging quality

### Token Expiration Strategy

I used:

- 15-minute access tokens
- 7-day refresh tokens

This creates a balance between:

- security
- user experience

### Password Policies

ASP.NET Core Identity password policies were configured to require:

- uppercase letters
- lowercase letters
- numbers
- minimum length
- unique characters

This significantly improves account protection.

### CORS Configuration

CORS was configured carefully to avoid common frontend authentication failures.

Incorrect middleware ordering is one of the most common issues developers face.

Correct configuration:

![CORS Configuration](assets/blogs/images/cors.png)

## Final Result

The final authentication system provided:

- Secure JWT authentication
- Automatic token refresh
- Scalable architecture
- Role-based access control
- Clean Angular integration
- Better API security
- Improved user experience
- Production-level session management

The implementation became reusable across multiple projects and significantly reduced authentication-related bugs.

More importantly, the architecture remained maintainable as the application grew.

## Key Takeaways

Building authentication correctly requires much more than generating JWT tokens.

A production-ready authentication system should focus on:

- security first
- token lifecycle management
- scalable architecture
- proper authorization
- frontend/backend coordination
- session protection
- maintainability

One of the biggest lessons I learned is that authentication is not just a backend concern.

Frontend handling, API structure, token storage strategy, middleware configuration, and security policies all work together as a complete system.

A secure authentication architecture improves:

- developer confidence
- application stability
- user trust
- long-term scalability

## Subscribe to My Newsletter

If you enjoyed this article and want more production-level content on:

- ASP.NET Core
- Angular
- Clean Architecture
- JWT Authentication
- SQL Optimization
- Scalable System Design
- Full-Stack Development
- Real-World Engineering Practices

then subscribe to my newsletter.

I write detailed technical articles focused on:

- solving real engineering problems
- writing maintainable production code
- improving application performance
- building secure backend systems
- becoming a better software engineer

Most tutorials on the internet stop at "it works."

My goal is to explain:

- why certain architectural decisions matter
- what breaks in production
- how experienced developers structure systems
- what recruiters actually look for in engineers

You'll receive:

- in-depth technical breakdowns
- practical backend/frontend strategies
- reusable architecture patterns
- performance optimization techniques
- production-ready code examples

No spam. Only high-quality engineering content.

---

**Ali Ahsan**

Full-Stack Developer
ASP.NET Core • Angular • SQL • Clean Architecture

Building scalable, secure, and production-ready applications.

[Subscribe to Newsletter](/news)