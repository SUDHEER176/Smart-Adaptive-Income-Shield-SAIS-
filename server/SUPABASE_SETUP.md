# Supabase Setup Guide for GigShield AI+

This guide explains how to set up Supabase (PostgreSQL) for the GigShield AI+ backend.

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- Backend dependencies installed: `cd server && npm install`

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Enter project name: `gigshield-ai`
5. Set a strong database password
6. Select your region
7. Click "Create new project" and wait for initialization

## Step 2: Get Your Credentials

1. Once the project is created, go to **Settings** → **API**
2. Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy your **Anon Key** (public API key under Project API keys)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env` in the `/server` directory:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   PORT=5000
   JWT_SECRET=your_secure_jwt_secret
   NODE_ENV=development
   ```

## Step 4: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents from `SUPABASE_SCHEMA.sql`
4. Click "Run"
5. Verify all tables are created in the **Table Editor**

## Step 5: (Optional) Enable Row-Level Security (RLS)

For production, enable RLS on tables:

1. Go to **Authentication** → **Policies**
2. Create policies for each table to control data access

## Step 6: Install Dependencies & Run Server

```bash
cd server
npm install
npm start
```

You should see:
```
✅ Supabase Connected
🚀 GigShield Server running on port 5000
```

## Step 7: Test the Backend

The backend is now using Supabase. All API endpoints will:
- Store data in PostgreSQL (via Supabase)
- Authenticate users using JWT tokens
- Run AI/Fraud detection services

## API Endpoints Available

All endpoints are async and work with Supabase:

- **Auth**: POST `/api/auth/register`, `/api/auth/login`
- **Prediction**: GET `/api/prediction/predict/:city/:time`
- **Insurance**: GET/POST `/api/insurance/plans`, `/api/insurance/purchase`
- **Claims**: POST `/api/claims/file`, GET `/api/claims/:userId`
- **Simulation**: POST `/api/simulation/whatif`
- **Admin**: GET `/api/admin/metrics`, `/api/admin/analytics`

## Troubleshooting

### "SUPABASE_URL or SUPABASE_ANON_KEY not defined"
- Make sure `.env` file exists in `/server` directory
- Verify credentials are correct from Supabase dashboard

### "Error: relation 'users' does not exist"
- Run the SQL schema from `SUPABASE_SCHEMA.sql` in Supabase SQL Editor
- Verify tables appear in Table Editor

### Connection timeout
- Check your Supabase project is active
- Verify internet connection
- Try disabling VPN

## Database Schema

Tables created:
- `users` - User accounts and profiles
- `policies` - Insurance policy records
- `claims` - Insurance claim submissions
- `groups` - Group insurance pools
- `loss_analytics` - Loss prediction analytics

All tables have timestamps and proper indexing for performance.
