# Railway Deployment Guide

## Quick Setup

### 1. Install Railway CLI
```bash
npm install -g @railway/cli
```

### 2. Login to Railway
```bash
railway login
```

### 3. Initialize Railway Project
```bash
railway init
```

### 4. Add PostgreSQL Plugin
```bash
railway add postgresql
```

### 5. Set Environment Variables
Copy the variables from `.env.railway` and paste them into your Railway project settings:
- Go to your Railway project dashboard
- Click on "Variables" tab
- Paste all variables from `.env.railway`

### 6. Deploy
```bash
railway up
```

## Environment Variables Explained

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string (auto-provided by Railway)
- `VITE_APP_URL` - Your app's public URL (auto-provided by Railway)
- `VITE_APP_NAME` - Application name

### Optional Variables
- `VITE_SUPABASE_URL` - If using Supabase instead of Railway PostgreSQL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_GOOGLE_ANALYTICS_ID` - For analytics tracking
- `VITE_SENTRY_DSN` - For error tracking

### Feature Flags
- `VITE_ENABLE_ADMIN` - Enable admin portal (default: true)
- `VITE_ENABLE_REPORTS` - Enable reports dashboard (default: true)

## Database Setup on Railway

### Option 1: Use Railway PostgreSQL (Recommended)
1. Add PostgreSQL plugin: `railway add postgresql`
2. Railway will automatically provide connection variables
3. The database will be created on first deploy

### Option 2: Use External PostgreSQL
1. Set `DATABASE_URL` to your external PostgreSQL connection string
2. Example: `postgresql://user:password@host:port/database`

## Migration on Railway

The database schema will be applied automatically when the app starts. Make sure your `local-schema.sql` is included in the build.

## Custom Domain (Optional)

1. Go to Railway project settings
2. Click on "Custom Domains"
3. Add your domain name
4. Update DNS records as instructed by Railway

## Troubleshooting

### Build Issues
- Ensure all dependencies are in `package.json`
- Check that `.env.railway` variables are correctly set

### Database Connection Issues
- Verify PostgreSQL plugin is added
- Check that `DATABASE_URL` is correctly set
- Ensure migrations are included in build

### Environment Variables Not Working
- Variables must start with `VITE_` to be exposed to Vite frontend
- Check Railway dashboard for correct variable names
