# Quick Start: Supabase Setup

## 1. Create Supabase Project (2 minutes)

1. Go to https://supabase.com
2. Sign up / Sign in
3. Click "New Project"
4. Fill in:
   - Project name: `gigshield`
   - Database password: (strong password)
   - Region: (closest to you)
5. Click "Create new project"
6. Wait for initialization (~1 minute)

## 2. Get Credentials (1 minute)

1. Click "Settings" → "API"
2. Copy these values:
   - **Project URL** (e.g., `https://abcde.supabase.co`)
   - **Anon Key** (under "Project API keys")

## 3. Configure Backend (1 minute)

In `/server` folder:

1. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add:
   ```
   SUPABASE_URL=https://your-url.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   PORT=5000
   JWT_SECRET=gigshield_secret_2024
   NODE_ENV=development
   ```

## 4. Create Database Tables (2 minutes)

1. In Supabase dashboard: Go to "SQL Editor"
2. Click "New Query"
3. Copy entire content from `/server/SUPABASE_SCHEMA.sql`
4. Paste it into the SQL editor
5. Click "Run"
6. You should see 5 tables created in "Table Editor"

## 5. Install & Run Backend (2 minutes)

```bash
cd server
npm install
npm start
```

Expected output:
```
✅ Supabase Connected
🚀 GigShield Server running on port 5000
```

## 6. Start Frontend (1 minute)

In another terminal:
```bash
cd client
npm start
```

Expected output:
```
Compiled successfully!
You can now view gigshield-frontend in the browser.
```

## 7. Test the App

1. Go to http://localhost:3000
2. Register with test account:
   - Name: John Doe
   - Email: john@test.com
   - Password: test123
   - City: Hyderabad
   - Job: Delivery
3. You should see the dashboard!

## Verification Checklist

- [ ] Supabase project created
- [ ] SUPABASE_URL and SUPABASE_ANON_KEY copied
- [ ] .env file created in /server
- [ ] SQL schema executed (5 tables visible)
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can register and login
- [ ] Dashboard shows predictions

## Default Test User

If you want to test manually in Supabase:

1. Go to Supabase "Table Editor"
2. Click "users" table
3. Insert test data:
   ```
   name: Demo User
   email: demo@gigshield.com
   phone: 9999999999
   password: (bcrypt hash of demo123)
   city: Hyderabad
   job_type: Delivery
   behavior_score: 85
   points: 0
   ```

## Next Steps

- [ ] Explore the admin panel at `/admin`
- [ ] Try the risk map feature
- [ ] Test insurance purchase flow
- [ ] File sample claims
- [ ] View analytics

## Troubleshooting

**"Cannot connect to Supabase"**
→ Check SUPABASE_URL and SUPABASE_ANON_KEY in .env

**"Tables not created"**
→ Go to Supabase SQL Editor and verify 5 tables exist

**"Login fails"**
→ Check user exists in Supabase "users" table

**"Port 5000 already in use"**
→ Change PORT in .env to 5001

## Support

- Supabase Docs: https://supabase.com/docs
- Schema: See `/server/SUPABASE_SCHEMA.sql`
- Migration Guide: See `/server/MIGRATION_GUIDE.md`
- Setup Details: See `/server/SUPABASE_SETUP.md`

**Total Setup Time: ~10 minutes**
