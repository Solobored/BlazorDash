# 🚀 BlazorDash Deployment Guide

This document provides detailed instructions for deploying BlazorDash to Vercel and other cloud platforms.

---

## Table of Contents

1. [Vercel Deployment](#vercel-deployment)
2. [Azure App Service](#azure-app-service)
3. [Docker Deployment](#docker-deployment)
4. [Local Deployment](#local-deployment)
5. [Database Setup](#database-setup)
6. [Environment Variables](#environment-variables)
7. [Troubleshooting](#troubleshooting)

---

## Vercel Deployment

Vercel is the recommended platform for deploying BlazorDash as it has excellent .NET support.

### Prerequisites

- [Vercel Account](https://vercel.com/signup) (free tier available)
- GitHub repository with your BlazorDash code
- Git installed locally

### Step 1: Push Code to GitHub

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial BlazorDash commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/blazor-dash.git
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project** (or Sign In if you have an account)
3. Click **Import Git Repository**
4. Select your GitHub account and find `blazor-dash` repo
5. Click **Import**

### Step 3: Configure Build Settings

Vercel should auto-detect your .NET project. Verify:

- **Project Type**: `dotnet`
- **Build Command**: `dotnet publish -c Release -o ./publish`
- **Output Directory**: `publish/wwwroot`
- **Install Command**: (leave empty - Vercel handles this)

### Step 4: Environment Variables

Add these in Vercel project settings > Environment Variables:

```
ASPNETCORE_ENVIRONMENT=Production
DOTNET_ENV=Production
```

### Step 5: Deploy

1. Click **Deploy**
2. Vercel will build and deploy automatically
3. Your app will be available at: `https://your-project-xyz.vercel.app`

### Monitor Deployment

- Check **Deployments** tab for build progress
- View **Logs** for any errors
- Check **Functions** dashboard if using serverless features

### Custom Domain (Optional)

1. Go to project **Settings > Domains**
2. Click **Add Domain**
3. Enter your custom domain
4. Update DNS records as instructed
5. Vercel will handle SSL automatically

---

## Azure App Service

### Prerequisites

- Azure subscription (free tier available)
- Azure CLI installed

### Step 1: Create App Service

```bash
# Login to Azure
az login

# Create resource group
az group create --name blazor-dash-rg --location eastus

# Create App Service Plan
az appservice plan create \
  --name blazor-dash-plan \
  --resource-group blazor-dash-rg \
  --sku B1 --is-linux

# Create Web App
az webapp create \
  --resource-group blazor-dash-rg \
  --plan blazor-dash-plan \
  --name blazor-dash-app \
  --runtime "DOTNET|9.0"
```

### Step 2: Publish Application

```bash
# Publish to Azure
az webapp up \
  --name blazor-dash-app \
  --resource-group blazor-dash-rg \
  --runtime "DOTNET|9.0"
```

### Step 3: Set Up Database

For production, migrate to a cloud database:

```bash
# Create Azure SQL Database
az sql server create \
  --name blazor-dash-sql \
  --resource-group blazor-dash-rg \
  --admin-user sqladmin \
  --admin-password YourSecurePassword123!
```

### Step 4: Update Connection String

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=tcp:blazor-dash-sql.database.windows.net,1433;Initial Catalog=blazordash_db;Persist Security Info=False;User ID=sqladmin;Password=YourSecurePassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  }
}
```

Set in Azure portal > App Service > Configuration > Connection Strings

---

## Docker Deployment

### Create Dockerfile

Create a `Dockerfile` in project root:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "BlazorDash.dll"]
```

### Build and Run Locally

```bash
# Build Docker image
docker build -t blazor-dash:latest .

# Run container
docker run -p 5000:5000 blazor-dash:latest
```

### Push to Docker Hub

```bash
# Tag image
docker tag blazor-dash:latest YOUR_USERNAME/blazor-dash:latest

# Login to Docker
docker login

# Push image
docker push YOUR_USERNAME/blazor-dash:latest
```

### Deploy to Cloud

**AWS ECS:**

```bash
aws ecs create-service \
  --cluster blazor-dash \
  --service-name blazor-dash-service \
  --task-definition blazor-dash:1 \
  --desired-count 1
```

**Google Cloud Run:**

```bash
gcloud run deploy blazor-dash \
  --image YOUR_USERNAME/blazor-dash:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## Local Deployment

### Prerequisites

- .NET 9 SDK
- SQLite (built-in with .NET)

### Installation

1. **Clone repository:**

   ```bash
   git clone https://github.com/YOUR_USERNAME/blazor-dash.git
   cd BlazorDash
   ```

2. **Restore dependencies:**

   ```bash
   dotnet restore
   ```

3. **Run application:**

   ```bash
   dotnet run
   ```

4. **Access application:**
   - Navigate to `http://localhost:5059`
   - Database created automatically as `BlazorDash.db`

### Production Build

```bash
# Build release version
dotnet publish -c Release -o ./publish

# Run from published directory
cd publish
dotnet BlazorDash.dll
```

---

## Database Setup

### SQLite (Default - Development)

- Automatically created as `BlazorDash.db`
- Suitable for local development
- Not recommended for production on Vercel (ephemeral filesystem)

### SQL Server (Production)

#### Connection String

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=blazordash;User Id=sa;Password=YOUR_PASSWORD;"
  }
}
```

#### Migration

```bash
dotnet ef database update
```

### PostgreSQL (Production)

#### Install NuGet Package

```bash
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL
```

#### Update Program.cs

```csharp
builder.Services.AddDbContext<GameDbContext>(options =>
    options.UseNpgsql(connectionString));
```

---

## Environment Variables

### Vercel Environment Variables

Set in project **Settings > Environment Variables**:

```
# Environment
ASPNETCORE_ENVIRONMENT=Production
DOTNET_ENV=Production

# Optional: Database
DATABASE_URL=your_database_connection_string

# Optional: Security
ASPNETCORE_URLS=https://+:443;http://+:80
```

### Azure Environment Variables

Set via Azure CLI:

```bash
az webapp config appsettings set \
  --name blazor-dash-app \
  --resource-group blazor-dash-rg \
  --settings ASPNETCORE_ENVIRONMENT=Production
```

### Docker Environment Variables

```bash
docker run -e ASPNETCORE_ENVIRONMENT=Production \
           -e ConnectionStrings__DefaultConnection=... \
           -p 5000:5000 \
           blazor-dash:latest
```

---

## Performance Optimization

### Build Optimization

```bash
# Enable tiered compilation
DOTNET_TieredCompilation=1 dotnet run

# Use ready-to-run images
dotnet publish -c Release -p:PublishReadyToRun=true
```

### Caching

Add to `Program.cs`:

```csharp
app.Use(async (context, next) =>
{
    context.Response.Headers.CacheControl = "public, max-age=3600";
    await next();
});
```

### Compression

Already enabled in Blazor Server, but ensure:

```csharp
app.UseResponseCompression();
```

---

## Monitoring & Debugging

### Vercel Analytics

- Check **Analytics** tab for page performance
- Review **Functions** for API performance
- Monitor **Deployments** for build issues

### Local Debugging

```bash
# Enable detailed logging
export DOTNET_LogLevel=Debug
dotnet run

# Check console for errors
# Browser F12 for client-side errors
```

### Application Insights (Azure)

```csharp
builder.Services.AddApplicationInsightsTelemetry();
```

---

## SSL/TLS Certificate

### Vercel (Automatic)

- Automatic SSL via Let's Encrypt
- Enabled for all deployments

### Azure (Automatic)

- Auto-managed SSL certificate
- Automatically renewed

### Custom Certificates

For self-hosted:

```bash
# Generate self-signed cert
dotnet dev-certs https --trust

# Use commercial cert
# Update launchSettings.json with cert path
```

---

## Backup & Recovery

### Database Backup (Vercel + SQLite)

SQLite on ephemeral filesystem will be lost. **Use cloud database instead**.

### Database Backup (Azure)

```bash
# Automated backups enabled
# Configure in Azure portal > SQL Database > Backups
```

### Code Backup

```bash
# Push to GitHub for version control
git add .
git commit -m "Backup before deployment"
git push origin main
```

---

## Scaling

### Vercel Scaling

- Automatic scaling included
- No configuration needed
- Check **Functions** dashboard for usage

### Azure Scaling

```bash
# Scale up App Service Plan
az appservice plan update \
  --name blazor-dash-plan \
  --resource-group blazor-dash-rg \
  --sku S1

# Auto-scaling
az monitor autoscale-settings create \
  --resource-group blazor-dash-rg \
  --resource blazor-dash-plan \
  --resource-type "Microsoft.Web/serverfarms" \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

---

## Security Checklist

- [ ] No hardcoded secrets in code
- [ ] Secrets stored in environment variables
- [ ] HTTPS enabled
- [ ] CORS configured properly
- [ ] Password requirements enforced
- [ ] Input validation on all forms
- [ ] SQL injection prevention (EF Core)
- [ ] CSRF tokens enabled
- [ ] Security headers configured

---

## Troubleshooting Deployment

### Build Fails

1. Check **Build logs** in Vercel/Azure
2. Verify .NET SDK version matches
3. Ensure all NuGet packages resolve
4. Check for syntax errors: `dotnet build`

### Application Won't Start

1. Check logs in Vercel/Azure dashboard
2. Verify environment variables set
3. Test locally: `dotnet run`
4. Check database connection string

### Database Errors

1. Verify connection string correct
2. Run migrations: `dotnet ef database update`
3. Check database permissions
4. Ensure database is accessible

### Performance Issues

1. Enable logging to identify bottlenecks
2. Check Lighthouse performance metrics
3. Optimize database queries
4. Enable caching

---

## Rollback Procedures

### Vercel Rollback

1. Go to **Deployments** tab
2. Find previous deployment
3. Click **Promote to Production**

### Azure Rollback

```bash
# View deployment history
az webapp deployment list \
  --resource-group blazor-dash-rg \
  --name blazor-dash-app

# Rollback to previous
az webapp deployment slot swap \
  --resource-group blazor-dash-rg \
  --name blazor-dash-app \
  --slot staging
```

---

## Support

For deployment issues:

1. Check relevant platform documentation
2. Review application logs
3. Verify environment configuration
4. Test locally first
5. Check GitHub issues

---

## Useful Resources

- [Vercel .NET Documentation](https://vercel.com/docs/frameworks/dotnet)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Docker .NET Guide](https://docs.microsoft.com/en-us/dotnet/architecture/containerized-lifecycle/design-develop-containerized-apps/build-aspnet-core-applications-linux-containers)
- [Blazor Deployment Guide](https://docs.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/)

---

**Questions?** Create an issue in the GitHub repository.
