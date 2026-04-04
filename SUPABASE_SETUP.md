# SUPABASE SETUP Instructions

## Step 1: Create Tables in Supabase

1. Go to: https://app.supabase.com
2. Select your project: `eacjjyagndeiphxjhcjz`
3. Go to **SQL Editor** tab (left sidebar)
4. Click **New Query**
5. Copy and paste the entire content from: `backend/supabase-schema.sql`
6. Click **Run** button (or Ctrl+Enter)
7. Wait for success message "Query executed successfully"

## Step 2: Verify Tables Created

1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - `workers`
   - `claims`
   - `payouts`
   - `policies`
   - `registrations`
   - `triggers`

## Step 3: Backend Ready

The backend now has:
- Supabase client configuration (lib/supabase.js)
- .env file with SUPABASE_URL and SUPABASE_ANON_KEY
- Package installed: @supabase/supabase-js

## Step 4: Frontend Update (Next)

Frontend will be updated to read directly from Supabase endpoints.

## Data Flow After Setup

```
BOT Registration
    ↓
Create Worker in Supabase
    ↓
Create Policy in Supabase
    ↓
WEBSITE shows real data via API
    ↓
SSE stream broadcasts changes
```

## Commands to Test

After restarting backend:
1. Register via bot: `REGISTER`
2. Check dashboard at `http://localhost:3000`
3. Website shows new worker in real-time
