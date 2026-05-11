# How I Built Production-Ready JWT Authentication in ASP.NET Core + Angular

![JWT Authentication](assets/blogs/images/jwt.avif)

[Authentication](https://aliahsan.tech/blog/jwt-authentication) is one of the most critical parts of any modern web application. It protects user data, secures APIs, controls access to resources, and forms the foundation of application security.
While building multiple full-stack applications using ASP.NET Core and Angular, I realized that many authentication implementations work fine in development but fail in real production environments due to poor security decisions, weak token handling, or incorrect architecture.

In this article, I'll walk through how I designed and implemented a production-ready JWT authentication system using ASP.NET Core and Angular, including the architectural decisions, security improvements, common mistakes to avoid, and the patterns I use in real-world applications.

## Problem

Most beginner authentication systems only focus on one thing:

> "Can the user log in successfully?"

But production systems require much more than that and the challenge I wanted to solve was building an authentication system that was
 secure, scalable, maintainable frontend, friendly resistant to common vulnerabilities and easy to extend for enterprise applications.
The application requirements included user registration and login, JWT access token authentication, refresh token mechanism, role-based authorization, secure API communication, Angular route protection, automatic token refresh, proper logout handling, [scalable architecture](https://aliahsan.tech/blog/clean-architecture).
I also wanted to avoid the common anti-patterns I often see in tutorial-based implementations.

## Auth Importance

Authentication is directly tied to application trust and a weak authentication system can lead to [account hijacking](https://www.vectra.ai/modern-attack/attack-techniques/account-hijacking), token theft, Session abuse, unauthorized access, data breaches, poor user experience.
For businesses, authentication issues can become expensive very quickly.
From a developer perspective, authentication is one of the fastest ways recruiters evaluate engineering maturity.
A developer who understands token lifecycle management, API security, authorization architecture, refresh token strategies, frontend/backend integration
is immediately seen differently from someone who only knows basic CRUD operations.
That's why I approached this implementation like a real production system instead of a tutorial project.

## Common Mistakes

Before designing the architecture, I identified several mistakes that appear repeatedly in many authentication implementations. [**Storing JWT Tokens in LocalStorage**](https://medium.com/kanlanc/heres-why-storing-jwt-in-local-storage-is-a-great-mistake-df01dad90f9e)
This is one of the most common mistakes **LocalStorage** is vulnerable to XSS attacks. If malicious JavaScript executes inside the application, tokens can easily be stolen.
Instead, I used secure HttpOnly cookies for refresh tokens.

### No Refresh Token Mechanism

Many systems force users to log in repeatedly because access tokens expire without a refresh strategy.
A production system should keep access tokens short-lived, refresh them securely and invalidate compromised sessions properly.
**Weak Password Storage**
Storing passwords incorrectly is catastrophic.
Passwords should never, be encrypted manually, use SHA256 directly and be stored in plain text.
I used ASP.NET Core Identity password hashing, which provides strong built-in protection.
**Long-Lived Access Tokens**
Keeping JWT access tokens valid for days or weeks increases security risk dramatically.
I used short-lived access tokens, rotating refresh tokens, secure re-authentication flow.

### Missing Authorization Layers

Authentication verifies identity.
Authorization verifies permissions.
Many applications authenticate users correctly but fail to implement proper role or policy-based access control. But
I designed the system using a layered architecture to keep authentication isolated, scalable, and maintainable.

### Backend Architecture

The ASP.NET Core backend was structured into, API Layer, Application Layer, Infrastructure Layer and Domain Layer.
Authentication responsibilities were separated into dedicated services.

```csharp
AuthController
AuthService
JwtTokenGenerator
RefreshTokenService
UserRepository
```

### Authentication Flow

![JWT Authentication](assets/blogs/images/auth-flow.avif)

The login process works like user submits credentials, server validates user, access token is generated, refresh token is generated, Access token returned to Angular, Refresh token stored securely, Angular attaches JWT to protected requests, Expired tokens automatically refresh.
This architecture provides, better security, cleaner session handling and smoother user experience.

### Token Strategy

I used two different tokens. **Access Token** due to their authorize API requests
because it has short expiration time, stateless and attached to requests.
**Refresh Token** Obtain new access tokens that are long-lived, securely stored, revocable and rotated periodically.
This approach minimizes risk while maintaining usability.

## Code Examples

### JWT Token Generation

The access token generation service:

```csharp
public string GenerateAccessToken(ApplicationUser user, IList<string> roles)
{
    var claims = new List<Claim>
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim(JwtRegisteredClaimNames.Email, user.Email),
        new Claim(ClaimTypes.Name, user.UserName)
    };

    claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

    var key = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(_jwtSettings.Secret));

    var credentials = new SigningCredentials(
        key,
        SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _jwtSettings.Issuer,
        audience: _jwtSettings.Audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(15),
        signingCredentials: credentials);

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

### Login Endpoint

The authentication endpoint:

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login(LoginDto model)
{
    var user = await _userManager.FindByEmailAsync(model.Email);

    if (user == null)
        return Unauthorized();

    var validPassword = await _userManager
        .CheckPasswordAsync(user, model.Password);

    if (!validPassword)
        return Unauthorized();

    var roles = await _userManager.GetRolesAsync(user);

    var accessToken = _jwtService.GenerateAccessToken(user, roles);

    var refreshToken = await _refreshTokenService
        .CreateAsync(user.Id);

    Response.Cookies.Append(
        "refreshToken",
        refreshToken.Token,
        new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict
        });

    return Ok(new
    {
        accessToken
    });
}
```

### Angular HTTP Interceptor

Angular automatically attaches the JWT token to protected requests.

```js
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('accessToken');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
```

This keeps API communication centralized and clean.

### Route Protection

Protected Angular routes:

```js
export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

This prevents unauthorized navigation inside the frontend application.

## Performance/Security Improvements

After the core implementation worked, I focused heavily on hardening security and improving reliability.
**Refresh Token Rotation**
Every refresh request generates new access token and new refresh token while
Old refresh tokens are invalidated immediately.
This prevents token replay attacks.

### Secure Cookie Configuration

Refresh tokens were stored using:

```csharp
HttpOnly = true
Secure = true
SameSite = Strict
```

This protects against XSS, CSRF, client-side token access.

### Role-Based Authorization

Protected endpoints use authorization attributes:

```csharp
[Authorize(Roles = "Admin")]
```

This ensures only authorized users can access sensitive operations.

### Centralized Exception Handling

Authentication-related errors were handled through middleware instead of scattered try-catch blocks.
This improved, maintainability, consistency and logging quality.
**Token Expiration Strategy**
I used 15-minute access tokens, 7-day refresh tokens.
This creates a balance between, security, user experience.
**Password Policies**
ASP.NET Core Identity password policies were configured to require uppercase letters, lowercase letters, numbers, minimum length, unique characters.
This significantly improves account protection.

### CORS Configuration

CORS was configured carefully to avoid common frontend authentication failures.
Incorrect middleware ordering is one of the most common issues developers face. Here is correct configuration:

```js
export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

## Final Result

The final authentication system provided, secure JWT authentication, automatic token refresh, scalable architecture, role-based access control, clean Angular integration, better API security, improved user experience and production-level session management etc.
The implementation became reusable across multiple projects and significantly reduced authentication-related bugs.
More importantly, the architecture remained maintainable as the application grew.

## Conclusion

Building authentication correctly requires much more than generating JWT tokens.
A production-ready authentication system should focus on security first, token lifecycle management, scalable architecture, proper authorization, frontend/backend coordination, session protection and maintainability etc.
One of the biggest lessons I learned is that authentication is not just a backend concern.
Frontend handling, API structure, token storage strategy, middleware configuration, and security policies all work together as a complete system.
A secure authentication architecture improves developer confidence, application stability, user trust, long-term scalability

---

## Stay Connected

If you enjoy practical content on ASP.NET Core, Angular, Clean Architecture, and scalable system design, subscribe to my newsletter for production-level engineering insights.

### Ali Ahsan

Full-Stack Developer | ASP.NET Core | Angular | SQL

 [LinkedIn](https://www.linkedin.com/in/ali-ahsan-6895a9315/) | [GitHub](https://github.com/aliahsan9) |  [Blogs](/blogs) | [Newsletter](/news)
  
Building secure, scalable, and real-world applications.
