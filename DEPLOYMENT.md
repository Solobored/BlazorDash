# 🚀 Blazor Dash - Deployment & Running Guide

## Quick Start (Development)

### Prerequisites
- .NET 9 SDK ([Download](https://dotnet.microsoft.com/download))
- Git (optional, for version control)
- Modern web browser

### Steps

1. **Navigate to project:**
   ```bash
   cd BlazorDash
   ```

2. **Run the application:**
   ```bash
   dotnet run
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:5059`
   - The application will automatically create the SQLite database on first run

---

## Building for Production

### Create a Release Build

```bash
dotnet publish -c Release -o ./publish
```

This creates optimized binaries in the `./publish` folder.

### Deploy on Windows Server

```bash
# Copy publish folder to server
# IIS Configuration: Create Application Pool with .NET CLR Version = No Managed Code

# Run as Windows Service (recommended)
sc create BlazorDash binPath="C:\app\BlazorDash.exe"
net start BlazorDash
```

### Deploy on Linux/Docker

```bash
# Using Docker
docker run -d -p 80:5059 \
  -v /data/blazor-dash:/app/data \
  mcr.microsoft.com/dotnet/aspnet:9.0 \
  /app/BlazorDash

# Or using systemd on Linux
sudo cp ./publish/* /opt/blazordash/
sudo systemctl start blazordash
```

---

## Running Tests

### Unit Tests

```bash
cd BlazorDash.Tests
dotnet test

# With coverage
dotnet test /p:CollectCoverage=true /p:CoverageFormat=opencover
```

### Test Results
- **Total Tests:** 11
- **Passing:** 11 ✅
- **Coverage:** Physics, collision detection, scoring, obstacle spawning

---

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=BlazorDash.db"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Environment-Specific Settings

```bash
# Development
dotnet run --environment Development

# Production
dotnet run --environment Production
```

---

## Database

### SQLite Location
- **File:** `BlazorDash.db` (in application root)
- **Auto-created:** Yes, on first run
- **Schema:** Single table `HighScores`

### Backup & Reset

```bash
# Backup database
cp BlazorDash.db BlazorDash.db.backup

# Reset database (delete file - will recreate on next run)
rm BlazorDash.db
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 5059 in use** | Change port in `Properties/launchSettings.json` |
| **Database locked error** | Close other instances; restart app |
| **Slow performance** | Check system resources; consider increasing cache |
| **Canvas not rendering** | Clear browser cache (Ctrl+Shift+Delete); check browser console (F12) |
| **Game loop stuttering** | Close other applications; check CPU/GPU usage |

---

## Performance Optimization

### For Better Performance

1. **Enable compression:**
   ```csharp
   // In Program.cs
   app.UseResponseCompression();
   ```

2. **Cache static assets:**
   ```csharp
   app.UseStaticFiles(new StaticFileOptions {
       OnPrepareResponse = ctx => {
           ctx.Context.Response.Headers.Add("Cache-Control", "public,max-age=31536000");
       }
   });
   ```

3. **Minimize bandwidth:**
   - Game.js is minified automatically in Release mode
   - CSS is optimized by Blazor bundler

---

## Monitoring

### Enable Logging

```bash
# Set log level
export DOTNET_LOG_LEVEL=Debug
dotnet run
```

### Application Insights (Optional)

```bash
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

Then configure in `Program.cs`:
```csharp
services.AddApplicationInsightsTelemetry();
```

---

## Health Checks

### Add Health Check Endpoint

```csharp
// In Program.cs
app.MapHealthChecks("/health");

// In browser
GET http://localhost:5059/health
```

---

## Security Considerations

- ✅ No external dependencies (secure by default)
- ✅ Local-only data storage (no cloud sync needed)
- ✅ Input validation on all user inputs
- Consider enabling HTTPS in production:

```csharp
app.UseHttpsRedirection();
```

---

## Containerization

### Docker Setup

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 5059
ENV ASPNETCORE_URLS=http://+:5059
ENTRYPOINT ["dotnet", "BlazorDash.dll"]
```

```bash
docker build -t blazor-dash:latest .
docker run -d -p 80:5059 --name blazor-dash blazor-dash:latest
```

---

## Support & Issues

For issues:
1. Check the **README.md** for general documentation
2. Review browser console (F12) for client-side errors
3. Check terminal output for server-side errors
4. Verify .NET 9 SDK is installed: `dotnet --version`

---

**Happy Deploying! 🎮✨**
