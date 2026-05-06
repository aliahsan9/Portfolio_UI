<!-- <img 
  src="assets/blogs/images/cors.jfif" 
  alt="Alt Text" 
  width="100%" 
  style="max-width: 700px; height: auto; border-radius: 12px;" -->
<!-- ![CORS Img](assets/blogs/images/cors.jfif) -->
<img 
  src="assets/blogs/images/cors.jfif" 
  alt="CORS Img" 
  style="width:100%; max-width:100%; height:auto; display:block; margin:16px 0;" 
/>
 
# How to Fix CORS in ASP.NET Core (Real Fix)

If you've ever built a frontend with Angular or React and connected it to an ASP.NET Core API, you've probably seen this nightmare:

> "Access to XMLHttpRequest has been blocked by CORS policy…"

Everything works fine in Postman… but your frontend just refuses to talk to your backend.

**Frustrating?** Yes.  
**Confusing?** At first.  
**Hard to fix?** Not really — once you actually understand it.

Let's fix it properly.

---

## First — What CORS Actually Is (Simple Explanation)

**CORS** stands for **Cross-Origin Resource Sharing**.

In simple terms:

> Your browser is protecting users by blocking requests from one origin (frontend) to another origin (backend).

### Example:

- **Frontend** → `http://localhost:4200`
- **Backend** → `http://localhost:5293`

These are different origins, so the browser blocks the request unless your backend explicitly allows it.

### Important:
👉 This is a **browser security feature**, not an ASP.NET issue.

---

## Why Your API Works in Postman But Not in Browser

Postman doesn't care about CORS.

Browsers do.

So:

- ✅ **Postman** → Works
- ❌ **Angular/React** → Blocked

That's your first clue: it's a CORS issue.

---

## The Real Fix (Step-by-Step)

Let's fix this correctly in ASP.NET Core.

### Step 1 — Add CORS Services

Go to your `Program.cs` (or `Startup.cs` in older versions).

Add this:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
```

**What this does:**

- Allows requests from your frontend
- Allows all headers (like Authorization)
- Allows GET, POST, PUT, DELETE, etc.

### Step 2 — Enable CORS Middleware (IMPORTANT)

This is where most people mess up.

Add this in the correct order:

```csharp
var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
```

👉 **Order matters.**

Wrong order = CORS still fails.

### Step 3 — Test Again

Run both apps:

- **Backend** → `http://localhost:5293`
- **Frontend** → `http://localhost:4200`

Now try your request again.

If configured correctly → it works instantly.

---

## Common Mistakes (That Waste Hours)

Let's save you time.

### ❌ Mistake 1: Using AllowAnyOrigin with Credentials

This will break:

```csharp
policy.AllowAnyOrigin()
      .AllowCredentials();
```

👉 This is **not allowed** by browsers.

**Correct approach:**

```csharp
policy.WithOrigins("http://localhost:4200")
      .AllowCredentials();
```

### ❌ Mistake 2: Wrong Middleware Order

This is wrong:

```csharp
app.UseAuthorization();
app.UseCors();
```

**CORS must come before authorization.**

### ❌ Mistake 3: Forgetting HTTPS vs HTTP

If your frontend is:

```
https://localhost:4200
```

And backend allows:

```
http://localhost:4200
```

👉 It will **fail**.

Origins must match **exactly**.

### ❌ Mistake 4: Trailing Slash Issue

This fails:

```csharp
.WithOrigins("http://localhost:4200/")
```

**Correct:**

```csharp
.WithOrigins("http://localhost:4200")
```

---

## Handling JWT Authentication (Very Important)

If you're using JWT (which you probably are), you need this:

```csharp
policy.WithOrigins("http://localhost:4200")
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
```

And in frontend:

```javascript
withCredentials: true
```

**Otherwise:**  
👉 Your token won't be sent → auth fails → confusing bugs.

---

## Production Setup (Don't Skip This)

In production, **NEVER** use:

```csharp
AllowAnyOrigin()
```

**Instead:**

```csharp
policy.WithOrigins(
    "https://yourdomain.com",
    "https://www.yourdomain.com"
)
.AllowAnyHeader()
.AllowAnyMethod();
```

👉 Be strict. **Security matters.**

---

## Advanced: Multiple Frontends

If you have:

- Angular app
- Admin panel
- Mobile app

Do this:

```csharp
policy.WithOrigins(
    "http://localhost:4200",
    "http://localhost:4300",
    "https://app.yoursite.com"
);
```

---

## Debugging Trick (Pro Tip)

Open browser **DevTools** → **Network** tab

Look for:

> **OPTIONS** request (preflight request)

If it fails:  
👉 Your CORS config is wrong.

---

## The Real Insight (Most Tutorials Don't Tell You)

CORS errors are rarely about "missing config".

They are usually about:

- Wrong origin
- Wrong middleware order
- Credentials mismatch

Once you understand that:  
👉 You stop guessing and start fixing fast.

---

## Final Working Example (Clean Setup)

Here's a clean version you can copy:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

---

## Wrap Up

CORS feels complicated at first, but it's actually simple:

- Browser blocks requests by default
- Backend must allow specific origins
- Middleware order matters
- Credentials need special handling

Once you get this right, you'll never struggle with CORS again.

---

## Before You Go

If you're building real apps with .NET and Angular:

I share practical, no-fluff guides like this every week — the kind that actually solve real dev problems.

👉 Subscribe to my newsletter and level up your backend + frontend skills.