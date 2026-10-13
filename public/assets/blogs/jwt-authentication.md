# Production-Ready JWT Authentication in ASP.NET Core and Angular

![JWT Authentication](assets/blogs/images/jwt.avif)

Most JWT tutorials stop at "the user can log in." Production fails at everything after that: where the token lives, what happens when it expires, and what happens when it's stolen.

This post covers the system I use in my full-stack projects: short-lived access tokens, rotating refresh tokens in HttpOnly cookies, reuse detection, role-based authorization, and an Angular client that refreshes silently. Every decision comes with the attack it defends against.

**Stack:** ASP.NET Core Web API, ASP.NET Core Identity, EF Core, Angular (standalone APIs, signals).

## Requirements

- Register and log in
- Short-lived JWT access tokens
- Refresh tokens that rotate and can be revoked
- Role- and policy-based authorization
- Silent refresh and route protection in Angular
- Proper logout

## Architecture at a glance

![Authentication flow](assets/blogs/images/auth-flow.avif)

| Token | Lifetime | Stored in | Purpose |
|---|---|---|---|
| Access token (JWT) | 15 min | Angular memory | Authorizes API calls |
| Refresh token (opaque random string) | 7 days | HttpOnly cookie, hash in DB | Gets a new access token |

1. The user logs in. The API returns the access token in the JSON body and sets the refresh token as a cookie.
2. Angular keeps the access token in memory and attaches it to API requests.
3. On a `401`, Angular calls `/auth/refresh`. The browser sends the cookie automatically, and the server rotates the refresh token.
4. On logout, the server revokes the token and clears the cookie.

The refresh token is a random string, not a JWT. It carries no data and only needs to be looked up, so it is easy to revoke.

## Mistakes this design avoids

**1. Tokens in `localStorage`.** Any XSS payload can read it. OWASP's guidance is to avoid storing tokens where JavaScript can read them. Here the refresh token is in an HttpOnly cookie, which JS cannot read, and the access token lives only in memory. It disappears on page reload and is restored by a silent refresh.

**2. Long-lived access tokens.** A JWT can't be revoked before it expires unless you add server-side state. Keep it short (15 minutes) and put long-lived state in the refresh token.

**3. Storing refresh tokens in plain text.** If the database leaks, plaintext refresh tokens become instant sessions. Store only a SHA-256 hash. The token is high-entropy random data, so a fast hash is fine here, unlike passwords.

**4. Rotation without reuse detection.** If an attacker replays an old, already-rotated refresh token and you just return `401`, the attacker's stolen chain stays alive. The fix is to revoke the whole token family when a rotated token is reused.

**5. Skipping validation parameters.** Not validating issuer, audience, lifetime, and signing key means accepting tokens you never meant to trust. See RFC 8725.

**6. Wrong middleware order.** `UseCors` → `UseAuthentication` → `UseAuthorization`. Get this wrong and you get mysterious 401s or missing CORS headers.

## Backend

### Project structure

```text
Api/             AuthController
Application/     IAuthService, DTOs
Infrastructure/  JwtTokenGenerator, RefreshTokenService, AppDbContext
Domain/          ApplicationUser, RefreshToken
```

### JWT configuration

```csharp
// Program.cs
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
var jwt = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwt.Secret)),
            ClockSkew = TimeSpan.FromSeconds(30) // default is 5 minutes
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
```

Two notes:

- `ClockSkew` defaults to 5 minutes, which silently stretches your 15-minute token to 20. Tighten it.
- Load `Jwt:Secret` from user-secrets, environment variables, or a vault, never from a committed `appsettings.json`. Use at least 256 bits for HS256.

### Generating the access token

```csharp
public string GenerateAccessToken(ApplicationUser user, IEnumerable<string> roles)
{
    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id),
        new(JwtRegisteredClaimNames.Email, user.Email!),
        new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };
    claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
    var token = new JwtSecurityToken(
        issuer: _jwt.Issuer,
        audience: _jwt.Audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(15),
        signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

    return new JwtSecurityTokenHandler().WriteToken(token);
}
```

A JWT is signed, not encrypted. Anyone can decode the payload, so don't put secrets or sensitive personal data in claims.

### The refresh token entity

```csharp
public class RefreshToken
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;
    public string TokenHash { get; set; } = default!;
    public Guid FamilyId { get; set; }          // one family per login session
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByHash { get; set; }
}
```

### Issuing and rotating refresh tokens

```csharp
public async Task<(string Raw, DateTime Expires)> CreateAsync(string userId, Guid? familyId = null)
{
    var raw = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
    var entity = new RefreshToken
    {
        UserId = userId,
        TokenHash = Hash(raw),
        FamilyId = familyId ?? Guid.NewGuid(),
        CreatedAt = DateTime.UtcNow,
        ExpiresAt = DateTime.UtcNow.AddDays(7)
    };
    _db.RefreshTokens.Add(entity);
    await _db.SaveChangesAsync();
    return (raw, entity.ExpiresAt);
}

public async Task<RotationResult?> RotateAsync(string raw)
{
    var stored = await _db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == Hash(raw));
    if (stored is null) return null;

    // A rotated (revoked) token was presented again: assume theft, kill the family.
    if (stored.RevokedAt is not null)
    {
        await _db.RefreshTokens
            .Where(t => t.FamilyId == stored.FamilyId && t.RevokedAt == null)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, DateTime.UtcNow));
        return null;
    }

    if (stored.ExpiresAt <= DateTime.UtcNow) return null;

    var (newRaw, expires) = await CreateAsync(stored.UserId, stored.FamilyId);
    stored.RevokedAt = DateTime.UtcNow;
    stored.ReplacedByHash = Hash(newRaw);
    await _db.SaveChangesAsync();

    return new RotationResult(stored.UserId, newRaw, expires);
}

private static string Hash(string raw) =>
    Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)));
```

### Auth endpoints

```csharp
[HttpPost("login")]
public async Task<IActionResult> Login(LoginDto model)
{
    var user = await _userManager.FindByEmailAsync(model.Email);
    if (user is null || !await _userManager.CheckPasswordAsync(user, model.Password))
        return Unauthorized(); // same response for both cases: no user enumeration

    var roles = await _userManager.GetRolesAsync(user);
    var (refresh, expires) = await _refreshTokens.CreateAsync(user.Id);

    SetRefreshCookie(refresh, expires);
    return Ok(new { accessToken = _jwt.GenerateAccessToken(user, roles) });
}

[HttpPost("refresh")]
public async Task<IActionResult> Refresh()
{
    var raw = Request.Cookies["refreshToken"];
    if (string.IsNullOrEmpty(raw)) return Unauthorized();

    var result = await _refreshTokens.RotateAsync(raw);
    if (result is null)
    {
        Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });
        return Unauthorized();
    }

    var user = await _userManager.FindByIdAsync(result.UserId);
    var roles = await _userManager.GetRolesAsync(user!);

    SetRefreshCookie(result.RawToken, result.Expires);
    return Ok(new { accessToken = _jwt.GenerateAccessToken(user!, roles) });
}

[HttpPost("logout")]
public async Task<IActionResult> Logout()
{
    if (Request.Cookies["refreshToken"] is { } raw)
        await _refreshTokens.RevokeAsync(raw);

    Response.Cookies.Delete("refreshToken", new CookieOptions { Path = "/api/auth" });
    return NoContent();
}

private void SetRefreshCookie(string token, DateTime expires) =>
    Response.Cookies.Append("refreshToken", token, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Path = "/api/auth",   // only sent to auth endpoints
        Expires = expires
    });
```

What each cookie flag does:

- `HttpOnly` blocks JavaScript access, which stops token theft via XSS.
- `Secure` sends the cookie over HTTPS only.
- `SameSite=Strict` blocks cross-site sends, which is a strong CSRF defense.
- `Path` limits the cookie to auth endpoints, so it isn't attached to every API call.

> **Gotcha:** `SameSite=Strict` requires the Angular app and API to be *same-site* (e.g. `app.example.com` and `api.example.com`). Different registrable domains means the cookie won't be sent. Then you need `SameSite=None` plus explicit CSRF protection.

### CORS, middleware order, and authorization

```csharp
builder.Services.AddCors(o => o.AddPolicy("spa", p => p
    .WithOrigins("https://app.example.com")   // never "*" with credentials
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

```csharp
[Authorize(Policy = "AdminOnly")]
[HttpDelete("users/{id}")]
public IActionResult DeleteUser(string id) { /* ... */ }
```

Authentication verifies who you are. Authorization verifies what you may do. Prefer policies over scattered role strings, because rules like "Admin or the resource owner" are easier to evolve that way.

## Frontend (Angular)

### Auth service: in-memory token and single-flight refresh

```ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private readonly _token = signal<string | null>(null);
  readonly accessToken = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());

  private refresh$?: Observable<string>;

  login(dto: LoginDto) {
    return this.http
      .post<{ accessToken: string }>(`${API}/auth/login`, dto, { withCredentials: true })
      .pipe(tap(r => this._token.set(r.accessToken)));
  }

  /** Concurrent callers share one refresh request. */
  refresh(): Observable<string> {
    this.refresh$ ??= this.http
      .post<{ accessToken: string }>(`${API}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        map(r => r.accessToken),
        tap(t => this._token.set(t)),
        finalize(() => (this.refresh$ = undefined)),
        shareReplay(1)
      );
    return this.refresh$;
  }

  logout() {
    this.http.post(`${API}/auth/logout`, {}, { withCredentials: true }).subscribe();
    this._token.set(null);
    this.router.navigate(['/login']);
  }
}
```

The single-flight part matters. Without it, five parallel requests that hit a 401 fire five refresh calls. The second one presents an already-rotated token, trips reuse detection, and logs the user out.

### Interceptor: attach the token and retry once on 401

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthCall = req.url.includes('/auth/');

  const withToken = (r: HttpRequest<unknown>, token: string | null) =>
    token ? r.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : r;

  return next(isAuthCall ? req : withToken(req, auth.accessToken())).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall) return throwError(() => err);

      return auth.refresh().pipe(
        switchMap(token => next(withToken(req, token))),
        catchError(e => { auth.logout(); return throwError(() => e); })
      );
    })
  );
};

// app.config.ts
provideHttpClient(withInterceptors([authInterceptor])),
provideAppInitializer(() =>
  firstValueFrom(inject(AuthService).refresh().pipe(catchError(() => of(null))))
),
```

The initializer restores the session after a page reload by using the cookie to get a fresh access token before the app renders.

### Route guard

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isAuthenticated()
    ? true
    : auth.refresh().pipe(
        map(() => true),
        catchError(() => of(router.createUrlTree(['/login'])))
      );
};
```

> **Important:** a guard is UX, not security. Anyone can bypass client-side checks, so the API's `[Authorize]` attributes are the real enforcement.

## Security checklist

- [ ] HTTPS everywhere, with HSTS
- [ ] Access token ≤ 15 min; refresh token ≤ 7 days
- [ ] Refresh tokens hashed in DB, rotated on every use, with family revocation on reuse
- [ ] Refresh cookie: `HttpOnly; Secure; SameSite=Strict`, Path scoped
- [ ] Issuer, audience, lifetime, and signature validated; small `ClockSkew`
- [ ] Secret from a vault or environment, never from source control
- [ ] CORS limited to known origins
- [ ] Rate limiting and lockout on `/login` (`AddRateLimiter`, Identity lockout)
- [ ] Strict CSP on the Angular app to reduce XSS
- [ ] Generic login errors (no user enumeration)
- [ ] Revoke all refresh tokens on password change

## Trade-offs

- **In-memory access tokens don't make XSS harmless.** An attacker running script in your page can still call your API as the user. They just can't steal a long-lived credential. A strong CSP and Angular's built-in output sanitization are your first line of defense.
- **Stateless JWTs and instant revocation conflict.** A stolen access token works until it expires. The 15-minute lifetime caps the damage. If you need immediate kill switches, add a token blacklist or a per-user security stamp check.
- **HS256 shares one secret** between signer and validator. If multiple services validate tokens, use asymmetric keys (RS256/ES256) so only the auth service holds the private key.

## Conclusion

Secure authentication is a system, not a token. The backend, the storage strategy, the cookie flags, middleware order, and the client's refresh logic all have to agree. The core ideas that matter most: short-lived access tokens, hashed and rotating refresh tokens with reuse detection, HttpOnly cookies, and server-side enforcement of every rule.

## References

1. [RFC 7519: JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
2. [RFC 8725: JSON Web Token Best Current Practices](https://datatracker.ietf.org/doc/html/rfc8725)
3. [RFC 9700: Best Current Practice for OAuth 2.0 Security](https://datatracker.ietf.org/doc/html/rfc9700) (refresh token rotation and reuse detection)
4. [OWASP: JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html) (token storage and sidejacking)
5. [OWASP: Cross-Site Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
6. [OWASP: Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
7. [Microsoft Learn: ASP.NET Core Security and Identity](https://learn.microsoft.com/en-us/aspnet/core/security/)
8. [Microsoft Learn: Policy-based authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies)
9. [Microsoft Learn: Enable CORS in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/cors)
10. [Microsoft Learn: ASP.NET Core Middleware (ordering)](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/)
11. [Angular: HTTP interceptors](https://angular.dev/guide/http/interceptors)
12. [Angular: Route guards](https://angular.dev/guide/routing/route-guards)
13. [MDN: Set-Cookie header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)

---

*Ali Ahsan, Full-Stack Developer | ASP.NET Core | Angular | SQL*

[LinkedIn](https://www.linkedin.com/in/ali-ahsan-6895a9315/) | [GitHub](https://github.com/aliahsan9) | [Blogs](/blogs) | [Newsletter](/news)