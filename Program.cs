using BlazorDash.Components;
using BlazorDash.Data;
using BlazorDash.Services;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Configure database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=BlazorDash.db";
builder.Services.AddDbContext<GameDbContext>(options =>
    options.UseSqlite(connectionString));

// Add Identity services
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password requirements
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;

    // User requirements
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<GameDbContext>()
.AddDefaultTokenProviders();

// Add AuthenticationStateProvider for Blazor Server with Identity
builder.Services.AddScoped<Microsoft.AspNetCore.Components.Authorization.AuthenticationStateProvider, 
    BlazorDash.Components.IdentityRevalidatingAuthenticationStateProvider>();

// Configure authentication cookies
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/login";
    options.LogoutPath = "/logout";
    options.AccessDeniedPath = "/access-denied";
    options.ExpireTimeSpan = TimeSpan.FromDays(30);
    options.SlidingExpiration = true;
    // Settings for Blazor Server development
    options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

// Register game services
builder.Services.AddScoped<GameService>();
builder.Services.AddScoped<LeaderboardService>();

// Register HttpClient for components
// Blazor Server automatically handles cookies through the browser context
builder.Services.AddScoped<HttpClient>(sp =>
{
    var navigationManager = sp.GetRequiredService<NavigationManager>();
    return new HttpClient { BaseAddress = new Uri(navigationManager.BaseUri) };
});

var app = builder.Build();

// Initialize database on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<GameDbContext>();
    context.Database.EnsureCreated();

    // Create default roles if they don't exist
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var roles = new[] { "Admin", "User" };
    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

app.MapStaticAssets();

// Add login endpoint that accepts form POST (must be before MapRazorComponents)
app.MapPost("/login-handler", async (
    HttpContext context,
    UserManager<ApplicationUser> userManager, 
    SignInManager<ApplicationUser> signInManager) =>
{
    try
    {
        var form = await context.Request.ReadFormAsync();
        var email = form["Email"].ToString();
        var password = form["Password"].ToString();
        var rememberMe = form.ContainsKey("RememberMe");

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return Results.Redirect($"/login?error={Uri.EscapeDataString("Invalid credentials")}&email={Uri.EscapeDataString(email ?? "")}");
        }

        // Find user by username or email
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
            user = await userManager.FindByNameAsync(email);

        if (user == null || string.IsNullOrEmpty(user.UserName))
        {
            Console.WriteLine($"User not found: {email}");
            return Results.Redirect($"/login?error={Uri.EscapeDataString("Invalid credentials")}&email={Uri.EscapeDataString(email ?? "")}");
        }

        // Sign in the user
        var result = await signInManager.PasswordSignInAsync(user.UserName, password, rememberMe, false);

        if (result.Succeeded)
        {
            Console.WriteLine($"User signed in successfully: {user.UserName}");
            return Results.Redirect("/");
        }
        else if (result.IsLockedOut)
        {
            return Results.Redirect($"/login?error={Uri.EscapeDataString("Account is locked")}&email={Uri.EscapeDataString(email ?? "")}");
        }
        else
        {
            Console.WriteLine($"Password check failed for user: {user.UserName}");
            return Results.Redirect($"/login?error={Uri.EscapeDataString("Invalid credentials")}&email={Uri.EscapeDataString(email ?? "")}");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Login handler error: {ex.Message} - {ex.StackTrace}");
        return Results.Redirect($"/login?error={Uri.EscapeDataString("An error occurred during login")}");
    }
}).DisableAntiforgery();

app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

// Add login endpoint that accepts JSON body (for API calls)
app.MapPost("/api/login", async (UserManager<ApplicationUser> userManager, SignInManager<ApplicationUser> signInManager, HttpContext context, LoginRequest request) =>
{
    try
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return Results.BadRequest("Username and password are required");

        // Find user by username or email
        var user = await userManager.FindByEmailAsync(request.Username);
        if (user == null)
            user = await userManager.FindByNameAsync(request.Username);

        if (user == null)
        {
            Console.WriteLine($"User not found: {request.Username}");
            return Results.BadRequest("Invalid credentials");
        }

        // Check password
        var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, false);
        if (!result.Succeeded)
        {
            Console.WriteLine($"Password check failed for user: {user.UserName}");
            return Results.BadRequest("Invalid credentials");
        }

        // Sign in the user - this sets the authentication cookie
        await signInManager.SignInAsync(user, request.RememberMe);
        Console.WriteLine($"User signed in successfully: {user.UserName}");

        // Return redirect URL instead of JSON response
        return Results.Ok(new { success = true, redirectUrl = "/" });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Login API error: {ex.Message} - {ex.StackTrace}");
        return Results.StatusCode(500);
    }
});

// Add logout endpoint
app.MapPost("/api/logout", async (SignInManager<ApplicationUser> signInManager) =>
{
    try
    {
        await signInManager.SignOutAsync();
        Console.WriteLine("User signed out successfully");
        return Results.Ok(new { success = true });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Logout API error: {ex.Message}");
        return Results.StatusCode(500);
    }
});

// Add check authentication endpoint
app.MapGet("/api/check-auth", (HttpContext context) =>
{
    var user = context.User;
    Console.WriteLine($"Check auth called - IsAuthenticated: {user?.Identity?.IsAuthenticated}");

    if (user?.Identity?.IsAuthenticated == true)
    {
        var userName = user.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value;
        var email = user.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
        Console.WriteLine($"Auth check: User {userName} is authenticated");
        return Results.Ok(new { authenticated = true, userName, email });
    }

    return Results.Ok(new { authenticated = false });
});

app.Run();

// Login request model
class LoginRequest
{
    public string Username { get; set; } = "";
    public string Password { get; set; } = "";
    public bool RememberMe { get; set; } = false;
}
