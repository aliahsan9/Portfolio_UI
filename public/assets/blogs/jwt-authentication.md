# Production-Ready JWT Authentication in ASP.NET Core and Angular

![JWT Authentication](assets/blogs/images/jwt.avif)

Login is the easy part. The design shows itself at minute 16, when the access token expires while five requests are in flight, and again the morning a proxy log contains a Bearer token that still works.

This is the authentication system I ship on ASP.NET Core APIs in front of an Angular SPA. The SPA is a public client: the browser cannot hold a client secret. [RFC 9700](https://www.rfc-editor.org/rfc/rfc9700) section 4.14.2 therefore requires the refresh token to be sender-constrained or rotated. I rotate it, store only a hash, and keep the access token too short to be worth stealing for long. Sender-constrained tokens (DPoP, mutual TLS) are the stronger option. I say at the end when I would switch.

**Stack:** ASP.NET Core Web API, ASP.NET Core Identity, EF Core, Angular standalone APIs.

## The bytes on the wire

A JWT in the `Authorization` header is a compact JWS, defined in [RFC 7515](https://www.rfc-editor.org/rfc/rfc7515) section 3.1 and section 7.1. Three segments, separated by `.`:

![The JWT is three base64url segments. The first two decode to JSON. The third is a MAC.](assets/blogs/images/jwt-wire.svg)

*Figure 1. Compact serialization. The dots are part of the signing input.*

`base64url` is the URL-safe alphabet from [RFC 4648](https://www.rfc-editor.org/rfc/rfc4648) section 5: `-` and `_` instead of `+` and `/`, and the `=` padding is omitted. It is an encoding. Anyone with the token can decode the header and the claims with no key at all.

The registered claims I rely on are the ones in [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519) section 4.1.

| Claim | What I put there | Why it exists |
|---|---|---|
| `iss` | `https://api.example.com` | Who minted the token. Checked against the API's configured issuer. |
| `sub` | The Identity user id | The stable subject. This is the only user identifier I need in the token. |
| `aud` | `portfolio-spa` | Which audience may accept it. Stops a token minted for another API of mine from being replayed here ([RFC 8725](https://www.rfc-editor.org/rfc/rfc8725) section 3.9). |
| `exp` | 15 minutes from issue, Unix time | After this instant the token is dead, plus a small clock skew. |
| `iat` | Issue time | Useful when I am reading a log. Not an authorization decision. |
| `jti` | A new GUID | A unique id, so a denylist has something to name later. Today nothing reads it. |
| `role` | `Admin`, `User`, ... | Repeated once per role. See the .NET mapping trap below before you rename this. |

I leave email, name, and anything a customer would call private out of the payload. The token is readable to every proxy, browser extension, and APM agent that records the `Authorization` header. TLS protects the header on the wire. It does not protect the copy sitting in a log.

`typ` is `at+jwt`. [RFC 9068](https://www.rfc-editor.org/rfc/rfc9068) section 2.1 defines that type for OAuth access tokens, and [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725) section 3.11 recommends an explicit type so one JWT profile cannot be substituted for another. I am not running a full OAuth authorization server. I still refuse any token whose `typ` is the generic `JWT`, because that is what an ID token or a hand-rolled debug token will say.

## What HS256 computes

The third segment is a message authentication code over the ASCII bytes of `base64url(header) + "." + base64url(claims)`. [RFC 7518](https://www.rfc-editor.org/rfc/rfc7518) section 3.2 names that construction for `HS256`: HMAC-SHA256, as specified in [RFC 2104](https://www.rfc-editor.org/rfc/rfc2104).

![Header and claims are base64url-encoded, joined with a dot, and passed through HMAC-SHA256.](assets/blogs/images/jwt-hmac.svg)

*Figure 2. The signing input is the encoded segments, not the raw JSON. A different JSON serializer that changes whitespace would not matter, because the MAC covers the encoded form that is actually sent.*

HMAC-SHA256 has a 64-byte block and a 32-byte output. With the key padded (or hashed, if it were longer than the block) to `K0`:

```text
HMAC(K, m) = SHA256( (K0 XOR opad) || SHA256( (K0 XOR ipad) || m ) )
ipad = byte 0x36, repeated 64 times
opad = byte 0x5c, repeated 64 times
```

Two properties fall out of that, and they shape the rest of the design.

**The MAC is unforgeable only while K is secret and strong.** RFC 7518 section 3.2 requires a key at least as long as the hash output: 256 bits for `HS256`. The requirement traces to NIST SP 800-107, via that section. A passphrase fails it twice: it is shorter than 256 bits of entropy, and it can be guessed offline by anyone who has captured a single token ([RFC 8725](https://www.rfc-editor.org/rfc/rfc8725) section 2.2 and section 3.5). I refuse to boot if `Jwt:Secret` is under 32 bytes:

```csharp
var secretBytes = Encoding.UTF8.GetByteCount(jwt.Secret);
if (secretBytes < 32)
    throw new InvalidOperationException(
        "Jwt:Secret must be at least 256 bits for HS256 (RFC 7518 section 3.2).");
```

Generate it with `RandomNumberGenerator.GetBytes(32)` and store it in user-secrets, an environment variable, or a vault. A 32-character English sentence is not 256 bits.

**The header is covered by the MAC, and it is still attacker-controlled until the MAC is checked.** The `alg` value sits inside the signed header, but a verifier that *reads* `alg` in order to *choose* the verification algorithm has already let the attacker pick the algorithm. Tim McLean documented the two consequences in 2015, later written up as [CVE-2015-9235](https://nvd.nist.gov/vuln/detail/CVE-2015-9235) and cited by RFC 8725 section 2.1:

- Some libraries treated `alg: none` as a successful verification. The signature segment can be empty. [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725) section 3.2 allows `none` only when some other layer has already protected the token. A bearer token on a public API is not that case. `RequireSignedTokens` defaults to true in `TokenValidationParameters`, and I also pin the algorithm so a later config change cannot reopen it.
- If a service expects RS256 and a library uses "whatever `alg` says" with "whatever key you passed," an attacker can switch the header to HS256 and HMAC the token using the RSA *public* key as the symmetric secret. Public keys are public. [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725) section 3.1 requires each key to be used with exactly one algorithm, and the library must enforce the caller's allowlist.

I have one HMAC key. I do not read `kid`, `jku`, or `x5u` from the token. Those headers are how a JWT library turns into an SSRF or a SQL injection if they are interpolated into a URL or a query (RFC 8725 section 3.10). With a single key there is nothing to look up.

The comparison of the recomputed MAC to the received MAC has to be constant-time (RFC 7518 section 3.2). `JsonWebTokenHandler` / `JwtSecurityTokenHandler` do that. I do not reimplement HMAC to "see the bytes."

```csharp
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            RequireSignedTokens = true,
            ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
            ValidTypes = ["at+jwt"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret)),
            ClockSkew = TimeSpan.FromSeconds(30),
            RoleClaimType = "role",
            NameClaimType = JwtRegisteredClaimNames.Sub
        };
    });
```

`ClockSkew` defaults to five minutes (`TokenValidationParameters.DefaultClockSkew`). Left alone, a 15-minute token is a 20-minute token. Thirty seconds covers real clock drift between two machines on NTP. It does not cover a token I meant to expire.

![Validation checks algorithm, MAC, issuer, audience, lifetime, and typ before any policy runs.](assets/blogs/images/jwt-validation.svg)

*Figure 3. Authorization runs only after the token has survived every cryptographic and claim check. A failed check is a 401 with an empty body. The response does not say whether the MAC was wrong or the audience was.*

## Two credentials, three stores

An access token that lives for 15 minutes cannot remember a logout. A refresh token that lives for days has to be revocable, so it has to be state on the server. Once it is state on the server, making it a JWT adds a signature and no capability I use. The refresh token is 64 bytes from `RandomNumberGenerator`, which on Windows is backed by the OS CSPRNG. 64 bytes is 512 bits. I store `SHA-256` of that string.

![Access token in memory, refresh token in an HttpOnly cookie, hash and family id in the database.](assets/blogs/images/jwt-storage.svg)

*Figure 4. XSS and CSRF steal different stores. The long-lived credential is placed where script cannot read it.*

| | Access token | Refresh token |
|---|---|---|
| Form | JWS, `HS256`, `typ=at+jwt` | 64 CSPRNG bytes, base64url |
| Lifetime | 15 minutes | 7 days idle, 30 days absolute for the family |
| Browser | JavaScript memory (a signal) | `HttpOnly` cookie |
| Server | Nothing. Signature is the record. | SHA-256 hex, family id, expiry, revocation |
| Sent | `Authorization: Bearer` on API calls | Cookie on `/api/auth` only |

SHA-256 is the right hash here because the input already has hundreds of bits of entropy. A slow password hash (PBKDF2, bcrypt, scrypt) exists to stretch a low-entropy secret. Using one on a 512-bit token spends latency on every refresh and does not move the attack from "impossible" to "more impossible." [RFC 8725](https://www.rfc-editor.org/rfc/rfc8725) section 3.5 is about passwords used as MAC keys. It is the same distinction: match the function to the entropy you actually have.

A database backup then contains hashes. Recovering a live refresh token from `SHA-256` of a 512-bit random string is a preimage search. I still treat the refresh table as sensitive, because family ids and user ids are an account map, but the backup is not a bag of session cookies.

The cookie:

```csharp
private void SetRefreshCookie(string token, DateTime expires) =>
    Response.Cookies.Append("refreshToken", token, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Path = "/api/auth",
        Expires = expires,
        IsEssential = true
    });
```

- `HttpOnly` keeps `document.cookie` from reading it. An XSS payload can still call `fetch` and *use* the cookie. It cannot exfiltrate the refresh token to another origin.
- `Secure` refuses to send it on plain HTTP. [MDN's Set-Cookie notes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) are the practical reference; the semantics live in [RFC 6265](https://www.rfc-editor.org/rfc/rfc6265).
- `SameSite=Strict` withholds the cookie from cross-site requests, which is the CSRF control for this endpoint. I can use Strict because the SPA and the API share a registrable domain (`app.example.com` and `api.example.com`). Cookies key off the *site* (scheme + registrable domain). CORS keys off the *origin* (scheme + host + port). Those are different comparisons, documented in the [Chrome same-site writeup](https://web.dev/articles/same-site-same-origin/). `localhost:4200` calling `localhost:5001` is cross-origin, so CORS applies, and same-site, so a Strict cookie is still sent. That split is why a dev environment needs a CORS policy and does not need `SameSite=None`.
- `Path=/api/auth` means the browser attaches the cookie to `/api/auth/refresh` and `/api/auth/logout`, and to nothing else. Access logs for `/orders` never contain it.

The `__Host-` cookie prefix would be a nice extra lock (Secure, no `Domain` attribute, `Path=/`). It requires `Path=/`. I would rather keep the cookie off ordinary API requests than take the prefix. Deleting the cookie later has to repeat Path, Secure, and SameSite. A delete that omits them leaves the old cookie in the jar.

If the SPA and the API are on different registrable domains, Strict will not send the cookie and the design has to change: `SameSite=None; Secure`, plus a CSRF defense on the refresh endpoint. I do not pretend Strict still applies in that deployment.

## Rotation is a row update, and reuse is an alarm

[RFC 9700](https://www.rfc-editor.org/rfc/rfc9700) section 4.14.2 describes rotation for public clients. Each refresh issues a new refresh token and invalidates the one that was presented. The server keeps the relationship. If an invalidated token shows up again, the server revokes the active refresh token. The RFC is explicit that the server cannot tell which party presented the old token. The legitimate client is logged out along with the thief. That is the signal.

![A refresh chain RT1, RT2, RT3 in one family, and what happens when RT1 is presented again.](assets/blogs/images/jwt-rotation.svg)

*Figure 5. Every token from one login shares a family id. Reuse of any revoked member kills the family.*

I also cap the family. Each rotation extends the presented token's successor by 7 days, and never past 30 days from the original login. A pure sliding window lets a stolen refresh token live forever, as long as the thief uses it at least once a week. The idle timeout matches the RFC's inactivity advice. The absolute cap is what makes theft finite even when the thief is diligent.

The race that makes this design fail in production is two requests presenting the same token before either has stored the successor. Two tabs. Or one tab, five parallel 401s. The second request finds a revoked row and looks exactly like theft. If I revoke the family there, a normal user with two tabs gets logged out once an hour.

The server side has to claim the row atomically, or both requests will issue a successor:

```csharp
var now = DateTime.UtcNow;
var current = await _db.RefreshTokens.AsNoTracking()
    .SingleOrDefaultAsync(t => t.TokenHash == hash, ct);

if (current is null)
    return null;

// Reuse is checked before expiry. A thief who rotated near the end of the
// idle window leaves the victim holding a row that is both revoked and expired.
// Skipping the alarm there would leave the thief's successor alive.
if (current.RevokedAt is not null)
{
    await RevokeFamilyAsync(current.FamilyId, ct);
    return null;
}

if (current.ExpiresAt <= now || current.FamilyExpiresAt <= now)
    return null;

var rawNext = Base64UrlEncoder.Encode(RandomNumberGenerator.GetBytes(64));
var nextExpires = now.AddDays(7);
if (nextExpires > current.FamilyExpiresAt)
    nextExpires = current.FamilyExpiresAt;

var next = new RefreshToken
{
    UserId = current.UserId,
    TokenHash = Hash(rawNext),
    FamilyId = current.FamilyId,
    FamilyExpiresAt = current.FamilyExpiresAt,
    CreatedAt = now,
    ExpiresAt = nextExpires
};

await using var tx = await _db.Database.BeginTransactionAsync(ct);

// One statement, so a tracked entity cannot write RevokedAt back to null later.
var claimed = await _db.RefreshTokens
    .Where(t => t.Id == current.Id && t.RevokedAt == null)
    .ExecuteUpdateAsync(s => s
        .SetProperty(t => t.RevokedAt, now)
        .SetProperty(t => t.ReplacedByHash, next.TokenHash), ct);

if (claimed == 0)
{
    await tx.CommitAsync(ct);
    await RevokeFamilyAsync(current.FamilyId, ct);
    return null;
}

_db.RefreshTokens.Add(next);
await _db.SaveChangesAsync(ct);
await tx.CommitAsync(ct);
return new RotationResult(current.UserId, rawNext, next.ExpiresAt);
```

`ExecuteUpdate` is the claim. Exactly one caller gets `claimed == 1`, and `ReplacedByHash` is written in that same statement. `ExecuteUpdate` does not refresh the change tracker, so setting `RevokedAt` on an entity loaded earlier and then calling `SaveChanges` can persist the stale `null` and undo the claim. The snapshot above is `AsNoTracking` for that reason.

The transaction wraps the claim and the insert. A crash between them rolls the revoke back. Without that, a process kill leaves the user holding a cookie the server has already forgotten. The `claimed == 0` branch is the alarm: someone else already consumed this row, so the whole family goes. A healthy browser never lands there, because of the lock in the client section. A browser that lost the previous response does land there, and the user logs in again.

`TokenHash` has a unique index. `FamilyId` has a non-unique index, because reuse revocation is `WHERE FamilyId = @id AND RevokedAt IS NULL`.

The client side has to stop the second tab from presenting the old cookie at all. `navigator.locks` is a per-origin lock that works across tabs in a secure context (localhost counts, production is HTTPS). One tab refreshes. The others wait. When the waiter runs, the browser has already stored the `Set-Cookie` from the winner, so the waiter sends the new refresh token and rotates it forward instead of tripping the alarm.

A lost response still looks like reuse: the server rotated, the client never saw the new cookie, the client retries the old one, the family dies, the user logs in again. I accept that. A grace window that ignores reuse for a few seconds also ignores a thief who replays inside that window, and RFC 9700's property is specifically that a second presentation kills the active token. I would rather have a rare re-login than a hole whose size is "however long the grace is."

## Issuing the access token

```csharp
public string GenerateAccessToken(ApplicationUser user, IList<string> roles)
{
    var now = DateTime.UtcNow;
    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id),
        new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new(JwtRegisteredClaimNames.Iat, EpochTime.GetIntDate(now).ToString(), ClaimValueTypes.Integer64)
    };
    claims.AddRange(roles.Select(role => new Claim("role", role)));

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwt.Secret));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var header = new JwtHeader(creds);
    header["typ"] = "at+jwt";

    var payload = new JwtPayload(
        issuer: _jwt.Issuer,
        audience: _jwt.Audience,
        claims: claims,
        notBefore: now,
        expires: now.AddMinutes(15));

    return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(header, payload));
}
```

The claim type is the string `role`, not `ClaimTypes.Role`. This is the trap that makes `[Authorize(Roles = "Admin")]` pass in one environment and fail in another.

`JwtSecurityTokenHandler` has an outbound map that rewrites the long WS-Federation role URI to `role` when it writes a token. `JwtBearerOptions.MapInboundClaims` defaults to `true`, which maps `role` back to `http://schemas.microsoft.com/ws/2008/06/identity/claims/role` on the way in. `TokenValidationParameters.RoleClaimType` defaults to that same long URI. The defaults happen to line up, until someone sets `MapInboundClaims = false` (to keep `sub` as `sub`) or clears `DefaultOutboundClaimTypeMap` (a snippet that has been copied around for years). I set `MapInboundClaims = false`, I write the short name myself, and I set `RoleClaimType = "role"`. All three have to agree. Microsoft's description of the flag is on [`JwtBearerOptions.MapInboundClaims`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.jwtbearer.jwtbeareroptions.mapinboundclaims).

## Login, refresh, logout

Identity's `UserManager.CheckPasswordAsync` verifies a hash. It does not increment the failed-access counter, so a lockout policy configured next to it never fires. `SignInManager.CheckPasswordSignInAsync(..., lockoutOnFailure: true)` does. It also does not create a cookie session, which is what I want on an API that is about to issue a JWT.

`VerifyHashedPassword` returns immediately on a malformed hash. A missing user is then faster than a wrong password, and the timing is a user-enumeration oracle. I keep one well-formed hash of a random password and verify against it when the email is unknown, so both paths do the PBKDF2 work. The HTTP result is the same `401` either way.

```csharp
[HttpPost("login")]
[EnableRateLimiting("login")]
public async Task<IActionResult> Login(LoginDto model, CancellationToken ct)
{
    var user = await _users.FindByEmailAsync(model.Email);
    if (user is null)
    {
        _users.PasswordHasher.VerifyHashedPassword(new ApplicationUser(), _dummyHash, model.Password);
        return Unauthorized();
    }

    var signIn = await _signIn.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: true);
    if (!signIn.Succeeded)
        return Unauthorized();

    var roles = await _users.GetRolesAsync(user);
    var issued = await _refresh.CreateAsync(user.Id, ct);

    SetRefreshCookie(issued.Raw, issued.Expires);
    return Ok(new { accessToken = _jwt.GenerateAccessToken(user, roles) });
}

[HttpPost("refresh")]
public async Task<IActionResult> Refresh(CancellationToken ct)
{
    if (!Request.Cookies.TryGetValue("refreshToken", out var raw) || string.IsNullOrEmpty(raw))
        return Unauthorized();

    var rotated = await _refresh.RotateAsync(raw, ct);
    if (rotated is null)
    {
        ClearRefreshCookie();
        return Unauthorized();
    }

    var user = await _users.FindByIdAsync(rotated.UserId);
    if (user is null)
    {
        ClearRefreshCookie();
        return Unauthorized();
    }

    var roles = await _users.GetRolesAsync(user);
    SetRefreshCookie(rotated.Raw, rotated.Expires);
    return Ok(new { accessToken = _jwt.GenerateAccessToken(user, roles) });
}

[HttpPost("logout")]
public async Task<IActionResult> Logout(CancellationToken ct)
{
    if (Request.Cookies.TryGetValue("refreshToken", out var raw))
        await _refresh.RevokeFamilyAsync(raw, ct);

    ClearRefreshCookie();
    return NoContent();
}
```

Logout revokes the family behind *this* cookie, which is this browser. A password change revokes every live refresh token for the user id, on every device. Outstanding access tokens still work until `exp`. That window is at most 15 minutes plus 30 seconds of skew. Closing it means a server lookup on every request (a security-stamp check, or a `jti` denylist), which gives up the reason the access token was stateless. I do that lookup only on refresh, where I am already in the database: if Identity's security stamp changed since issue, refresh fails. I do not pretend a copied access token dies at the moment of logout.

`_dummyHash` is built once:

```csharp
_dummyHash = new PasswordHasher<ApplicationUser>()
    .HashPassword(new ApplicationUser(), Convert.ToHexString(RandomNumberGenerator.GetBytes(32)));
```

The login limiter is a fixed window, 10 permits per minute per remote IP, rejection status `429`. It sits in front of the hasher so a flood does not turn PBKDF2 into a CPU exhaustion bug. IP limits are crude behind NAT. The per-account lockout is the control that still works when a thousand customers share an address.

```csharp
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("login", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});
```

The refresh row:

```csharp
public sealed class RefreshToken
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;
    public string TokenHash { get; set; } = default!;
    public Guid FamilyId { get; set; }
    public DateTime FamilyExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByHash { get; set; }
}
```

```csharp
builder.Entity<RefreshToken>(e =>
{
    e.HasIndex(t => t.TokenHash).IsUnique();
    e.HasIndex(t => t.FamilyId);
    e.Property(t => t.TokenHash).HasMaxLength(64);
    e.Property(t => t.UserId).HasMaxLength(450);
});
```

`Hash` is `Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw)))`. Hex is 64 characters, which is why the column is `HasMaxLength(64)`. The same function has to run on insert and on lookup. `ToHexString` emits uppercase; mixing in a lowercase writer would miss every row.

A nightly job deletes rows whose `ExpiresAt` and `FamilyExpiresAt` are both in the past. Revoked rows have to stay until the family expires, or a replay of an old token finds no row and I cannot tell reuse from a token I never issued. Both cases return `401`. Only the reuse case should kill the siblings.

## CORS, middleware, authorization

```csharp
builder.Services.AddCors(o => o.AddPolicy("spa", p => p
    .WithOrigins("https://app.example.com")
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));

app.UseHttpsRedirection();
app.UseCors("spa");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
```

`AllowCredentials()` with `AllowAnyOrigin()` is rejected by the CORS middleware, and the browser would reject the response anyway. The origin list is the allowlist.

Order is load-bearing. A JWT failure inside `UseAuthentication`, before `UseCors` has run, produces a 401 that the browser hides as a CORS error. The Angular interceptor then never sees the 401 and never refreshes. I want CORS headers on the failure as well as on the success. Microsoft's pipeline notes are in the [middleware documentation](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/).

If a reverse proxy already terminated TLS, the API should not answer the SPA with a redirect. A redirected credentialed preflight is a miserable bug to read in the network panel, and it is avoided by not combining `UseHttpsRedirection` with cross-origin browser clients when the process itself only sees HTTP.

```csharp
builder.Services.AddAuthorizationBuilder()
    .AddPolicy("CanManageUsers", p => p.RequireRole("Admin"));
```

```csharp
[Authorize(Policy = "CanManageUsers")]
[HttpDelete("users/{id}")]
public IActionResult DeleteUser(string id) { /* ... */ }
```

Authentication answers "which user is this." Authorization answers "may this user do this." A missing or rejected token is `401`. A valid token for a user who lacks the policy is `403`. The interceptor refreshes on `401` only. Treating `403` as "try a new token" hides broken policies behind a refresh loop.

Policies live in one place so a rule like "Admin, or the subject matches the route id" does not end up copied, slightly differently, into six actions. The [policy documentation](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies) is the model I follow.

## The Angular side

![Parallel API calls share one refresh lock, then the original request is retried once.](assets/blogs/images/jwt-client-flow.svg)

*Figure 6. The lock name is arbitrary and per origin. What matters is that a second tab blocks inside `navigator.locks` instead of sending the cookie the first tab just rotated.*

```ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly accessToken = signal<string | null>(null);
  readonly isAuthenticated = computed(() => this.accessToken() !== null);

  private refreshInFlight: Promise<string> | null = null;

  token(): string | null {
    return this.accessToken();
  }

  login(dto: LoginDto) {
    return this.http
      .post<{ accessToken: string }>(`${API}/auth/login`, dto, { withCredentials: true })
      .pipe(tap(response => this.accessToken.set(response.accessToken)));
  }

  refresh(): Observable<string> {
    this.refreshInFlight ??= this.refreshOnce().finally(() => {
      this.refreshInFlight = null;
    });
    return from(this.refreshInFlight);
  }

  logout(): void {
    this.accessToken.set(null);
    this.http
      .post(`${API}/auth/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe();
    void this.router.navigate(['/login']);
  }

  private refreshOnce(): Promise<string> {
    const request = () => firstValueFrom(
      this.http.post<{ accessToken: string }>(`${API}/auth/refresh`, {}, { withCredentials: true }).pipe(
        map(response => response.accessToken),
        tap(token => this.accessToken.set(token))
      )
    );

    if (!globalThis.navigator?.locks) return request();
    return navigator.locks.request('auth-refresh', request);
  }
}
```

The assignment to `refreshInFlight` happens before the first `await`, so callers in this tab share one promise. Callers in other tabs share the Web Lock. `shareReplay` alone only covers one JavaScript realm. It does nothing for the second tab, which is the case that actually kills families.

```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isAuthCall = req.url.includes('/auth/');

  const withToken = (request: HttpRequest<unknown>, token: string | null) =>
    token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;

  return next(isAuthCall ? req : withToken(req, auth.token())).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || isAuthCall) return throwError(() => err);

      return auth.refresh().pipe(
        switchMap(token => next(withToken(req, token))),
        catchError(refreshError => {
          auth.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};
```

`/auth/` is excluded because a 401 from refresh must not start another refresh. That recursion is how one dead cookie becomes a loop and then a family revocation.

```ts
provideHttpClient(withInterceptors([authInterceptor])),
provideAppInitializer(() => {
  const auth = inject(AuthService);
  return firstValueFrom(auth.refresh().pipe(catchError(() => of(null))));
});
```

The initializer runs before routing. A reload has no signal value; the cookie is the only session left, and this is what turns it back into an access token. If the cookie is missing, the error is swallowed and the user is simply logged out.

```ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  return auth.refresh().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};
```

The guard is a routing convenience. The API's `[Authorize]` attributes are the control. A rewritten client can call the API with no guard at all.

Register the interceptor and the initializer in `app.config.ts`. `withCredentials: true` is required on login, refresh, and logout. Ordinary API calls carry the Bearer token and do not need the cookie; the cookie's path would have kept it off those calls regardless.

## What I check before calling it done

- HTTPS between browser and API, HSTS at the edge.
- `Jwt:Secret` is at least 32 bytes from a CSPRNG, and the process throws on startup if it is not. It is not in `appsettings.json`.
- `ValidAlgorithms` is HS256 only, `RequireSignedTokens` is true, `ValidTypes` is `at+jwt`, issuer and audience are set, clock skew is 30 seconds.
- Access tokens live in memory. Refresh tokens are `HttpOnly; Secure; SameSite=Strict; Path=/api/auth`.
- The refresh table stores SHA-256, a family id, an idle expiry, and an absolute family expiry. `TokenHash` is unique.
- Rotation is a single `ExecuteUpdate` claim inside a transaction. Reuse revokes the family.
- The Angular client takes a Web Lock around refresh and ignores 401s from `/auth/`.
- Login uses `CheckPasswordSignInAsync` with lockout, a dummy verify for unknown emails, and a rate limit.
- Password change revokes every family for that user.
- CORS allows the SPA origin with credentials. `UseCors` runs before `UseAuthentication`.
- A 403 is not treated as an expired token.
- The SPA sends a strict Content-Security-Policy. Angular's template sanitizer is the other half of the XSS story. An in-memory access token does not survive script running in the page: that script can call the API as the user until the access token expires. What it cannot do is lift a 30-day credential out of the cookie jar.

## What this design does not do

A stolen access token works until `exp`. Fifteen minutes is the bound I chose, not a property of JWTs. A bank transfer screen would get five minutes and a step-up. A denylist of `jti` would shrink the window to one request's round trip, at the cost of a cache read on every call. I have not needed that cache on these products.

`HS256` means every process that validates tokens holds the same secret. That is acceptable while the API is the only verifier. The moment a second service verifies tokens, that service becomes another place the MAC key can leak, and a leak lets the holder mint tokens. At that point I switch the issuer to ES256 (or RS256) and distribute only the public key. RFC 8725 section 3.1 still applies: that public key is for that one algorithm, and `ValidAlgorithms` stays a single entry so the HMAC confusion from 2015 has nothing to attach to. ECDSA signatures need a fresh nonce per token; libraries that implement [RFC 6979](https://www.rfc-editor.org/rfc/rfc6979) deterministic ECDSA avoid the class of bugs where a repeated nonce leaks the private key. I do not hand-roll that either.

[RFC 9700](https://www.rfc-editor.org/rfc/rfc9700) allows sender-constrained refresh tokens instead of rotation. [RFC 9449](https://www.rfc-editor.org/rfc/rfc9449) (DPoP) and [RFC 8705](https://www.rfc-editor.org/rfc/rfc8705) (mutual TLS) bind the token to a key the client holds, so a copied bearer string is not enough. A browser can do DPoP. It cannot comfortably do mutual TLS. I have not shipped DPoP here. Rotation plus a short access token is the control I can explain, test, and revoke with a SQL update. If a product cannot tolerate a bearer token in JavaScript at all, the next design is a backend-for-frontend that keeps the session in its own cookie and never hands the SPA a token. That is a different architecture, and it is the honest answer when the threat model forbids script-visible credentials entirely.

## References

1. [RFC 2104: HMAC: Keyed-Hashing for Message Authentication](https://www.rfc-editor.org/rfc/rfc2104). The construction behind HS256.
2. [RFC 4648: The Base16, Base32, and Base64 Data Encodings](https://www.rfc-editor.org/rfc/rfc4648). Section 5 is base64url.
3. [RFC 6265: HTTP State Management Mechanism](https://www.rfc-editor.org/rfc/rfc6265). Cookie attributes.
4. [RFC 6749: The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749). Public clients and refresh tokens.
5. [RFC 6979: Deterministic ECDSA](https://www.rfc-editor.org/rfc/rfc6979). Relevant the day the issuer moves off HS256.
6. [RFC 7515: JSON Web Signature (JWS)](https://www.rfc-editor.org/rfc/rfc7515). Compact serialization and the signing input.
7. [RFC 7518: JSON Web Algorithms (JWA)](https://www.rfc-editor.org/rfc/rfc7518). Section 3.2, HMAC key size and constant-time comparison.
8. [RFC 7519: JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519). Registered claims.
9. [RFC 8705: OAuth 2.0 Mutual-TLS Client Authentication and Certificate-Bound Access Tokens](https://www.rfc-editor.org/rfc/rfc8705).
10. [RFC 8725: JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725). Algorithm pinning, audience, `typ`, `kid` / `jku`.
11. [RFC 9068: JSON Web Token (JWT) Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068). `typ` of `at+jwt`.
12. [RFC 9449: OAuth 2.0 Demonstrating Proof of Possession (DPoP)](https://www.rfc-editor.org/rfc/rfc9449).
13. [RFC 9700: Best Current Practice for OAuth 2.0 Security](https://www.rfc-editor.org/rfc/rfc9700). Section 4.14.2, refresh token rotation and reuse.
14. Tim McLean, [Critical vulnerabilities in JSON Web Token libraries](https://auth0.com/blog/critical-vulnerabilities-in-json-web-token-libraries/) (March 2015), and [CVE-2015-9235](https://nvd.nist.gov/vuln/detail/CVE-2015-9235).
15. NIST, [SP 800-107 Rev. 1: Recommendation for Applications Using Approved Hash Algorithms](https://csrc.nist.gov/pubs/sp/800/107/r1/final). The key-strength discussion RFC 7518 points at.
16. [OWASP JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html).
17. [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
18. Microsoft, [`JwtBearerOptions.MapInboundClaims`](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.authentication.jwtbearer.jwtbeareroptions.mapinboundclaims), [policy-based authorization](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/policies), [CORS](https://learn.microsoft.com/en-us/aspnet/core/security/cors), [middleware order](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/).
19. [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie) and [Schemeful same-site](https://web.dev/articles/same-site-same-origin/).
20. Angular: [HTTP interceptors](https://angular.dev/guide/http/interceptors) and [route guards](https://angular.dev/guide/routing/route-guards).

---

*Ali Ahsan, Full-Stack Developer | ASP.NET Core | Angular | SQL*

[LinkedIn](https://www.linkedin.com/in/ali-ahsan-6895a9315/) | [GitHub](https://github.com/aliahsan9) | [Blogs](/blogs) | [Newsletter](/news)
