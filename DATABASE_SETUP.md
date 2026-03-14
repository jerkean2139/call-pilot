# Local Database Setup

This guide will help you set up a local PostgreSQL database using Docker for CoreTrack development.

## Prerequisites

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
2. PowerShell (on Windows) or Terminal (on Mac/Linux)

## Quick Start

### Option 1: Using the setup script (Recommended)

```bash
npm run db:setup
```

This will:
- Start PostgreSQL and pgAdmin containers
- Wait for the database to be ready
- Apply the database schema automatically

### Option 2: Manual setup

1. Start the containers:
   ```bash
   npm run db:start
   ```

2. The database schema will be applied automatically from the migration file

## Database Connection Details

- **Host**: localhost
- **Port**: 5434
- **Database**: coretrack
- **Username**: coretrack
- **Password**: coretrack123

## pgAdmin Access

For a visual database management tool:

- **URL**: http://localhost:5050
- **Email**: admin@coretrack.com
- **Password**: admin123

## Useful Commands

- Start database: `npm run db:start`
- Stop database: `npm run db:stop`
- Reset database (wipe data): `npm run db:reset`

## Database Schema

The database includes an `assessments` table with the following structure:
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `completed_at` (timestamp)
- `answers` (JSONB)
- `results` (JSONB)
- `created_at` (timestamp)

Row Level Security (RLS) is enabled with policies for:
- Users can read their own assessments
- Users can create their own assessments
- Admin users can read all assessments

## Troubleshooting

### Port already in use
If you get a port conflict, you can change the port in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Use 5433 instead of 5432
```

### Database not ready
If the database seems slow to start, check the logs:
```bash
docker logs coretrack-db
```

### Reset everything
To completely reset the database (lose all data):
```bash
npm run db:reset
```
