# MongoDB to Supabase Migration Guide

## Summary of Changes

The GigShield AI+ backend has been migrated from MongoDB to **Supabase** (PostgreSQL). This document outlines all changes made.

## What Changed

### 1. Database Layer
- **From**: MongoDB with Mongoose ODM
- **To**: Supabase (PostgreSQL) with Supabase JS client
- **File Changed**: `/server/database.js` - Complete rewrite
- **New File**: `/server/SUPABASE_SCHEMA.sql` - PostgreSQL schema

### 2. Dependencies
- **Removed**: `mongoose@7.0.0`
- **Added**: `@supabase/supabase-js@2.38.0`

Update your dependencies:
```bash
cd server
npm install
```

### 3. Model Files
All models now export Supabase operations instead of Mongoose schemas:
- `/server/models/User.js`
- `/server/models/Policy.js`
- `/server/models/Claim.js`
- `/server/models/Group.js`
- `/server/models/LossAnalytics.js`

### 4. Database Operations

#### Before (MongoDB/Mongoose):
```javascript
const user = new User({ name, email, password });
await user.save();
```

#### After (Supabase):
```javascript
const user = await User.create({ name, email, password });
```

#### Key Method Changes:
| Operation | Mongoose | Supabase |
|-----------|----------|----------|
| Create | `new Model().save()` | `Model.create(data)` |
| Find one | `Model.findOne(query)` | `Model.findOne(query)` |
| Find by ID | `Model.findById(id)` | `Model.findById(id)` |
| Find all | `Model.find(query)` | `Model.find(query)` |
| Update one | `model.updateOne()` | `Model.updateOne(query, data)` |
| Update by ID | `model.save()` | `Model.updateById(id, data)` |
| Delete | `model.deleteOne()` | `Model.deleteOne(query)` |
| Count | `Model.countDocuments()` | `Model.countDocuments(query)` |

### 5. Field Name Changes
Database field names changed from camelCase to snake_case:

| Mongoose | PostgreSQL |
|----------|-----------|
| `userId` | `user_id` |
| `policyId` | `policy_id` |
| `weeklyPlan` | `weekly_plan` |
| `timeSlots` | `time_slots` |
| `startDate` | `start_date` |
| `endDate` | `end_date` |
| `isActive` | `is_active` |
| `createdAt` | `created_at` |
| `updatedAt` | `updated_at` |
| `jobType` | `job_type` |
| `behaviorScore` | `behavior_score` |
| `fraudRisk` | `fraud_risk` |
| `totalClaims` | `total_claims` |
| `weatherCondition` | `weather_condition` |
| `fraudCheck` | `fraud_check` |
| `joinCode` | `join_code` |
| `creatorId` | `creator_id` |
| `totalPool` | `total_pool` |
| `lossAnalytics` | `loss_analytics` |

### 6. Controllers Updated
All controllers updated to use Supabase async operations:
- `/server/controllers/authController.js` - User registration/login
- `/server/controllers/insuranceController.js` - Policy management
- `/server/controllers/claimsController.js` - Claim processing
- `/server/controllers/adminController.js` - Analytics (replaced aggregations with JS)

### 7. Aggregation Changes
MongoDB aggregation pipelines removed and replaced with in-memory aggregation:

**Before** (MongoDB aggregation):
```javascript
const result = await Model.aggregate([
  { $group: { _id: '$city', count: { $sum: 1 } } }
]);
```

**After** (JavaScript aggregation):
```javascript
const records = await Model.find();
const grouped = {};
records.forEach(r => {
  grouped[r.city] = (grouped[r.city] || 0) + 1;
});
```

## Configuration

### 1. Environment Variables
Update `.env` file with Supabase credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
PORT=5000
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 2. Database Setup
Run the SQL schema in Supabase:

```bash
# Copy the schema
cat /server/SUPABASE_SCHEMA.sql
```

Then in Supabase dashboard:
1. Go to SQL Editor
2. Click "New Query"
3. Paste the schema
4. Click "Run"

## API Response Changes

### ID Field Changes
MongoDB used `_id`, Supabase uses `id`:

**Before**: `{ _id: "507f...", name: "John" }`
**After**: `{ id: 1, name: "John" }`

### Timestamps
Now in ISO 8601 format from PostgreSQL:

**Before**: `{ createdAt: "2024-01-01T12:00:00.000Z" }`
**After**: `{ created_at: "2024-01-01T12:00:00+00:00" }`

## Advantages of Supabase

✅ **PostgreSQL** - Proven relational database  
✅ **Real-time subscriptions** - WebSocket support for live updates  
✅ **Row-level security** - Fine-grained access control  
✅ **Better analytics** - SQL for complex queries  
✅ **Scalability** - Enterprise-grade infrastructure  
✅ **No ODM overhead** - Direct SQL when needed  

## Troubleshooting

### Error: "SUPABASE_URL or SUPABASE_ANON_KEY not defined"
→ Make sure `.env` file exists with correct credentials

### Error: "relation 'users' does not exist"
→ Run the SQL schema from `SUPABASE_SCHEMA.sql`

### Error: "permission denied for schema public"
→ Check Supabase RLS policies or use service role key for admin operations

### Error: "invalid input syntax for type integer"
→ Check data types match PostgreSQL schema (no ObjectId in Supabase)

## Next Steps

1. Set up Supabase project at https://supabase.com
2. Get SUPABASE_URL and SUPABASE_ANON_KEY
3. Create `.env` file with credentials
4. Run SQL schema in Supabase
5. Install dependencies: `npm install`
6. Start server: `npm start`

## Testing

All endpoints should work the same way from the frontend's perspective:

```javascript
// Frontend API calls unchanged
const response = await api.auth.register({ name, email, password, city, jobType });
const user = response.data.user; // Now has `id` instead of `_id`
```

## Performance Notes

- **Queries are faster** - PostgreSQL is optimized for analytical workloads
- **Aggregations are slower** - Done in JavaScript instead of database
- **Consider adding views** - For complex aggregations used frequently
- **Use indexes** - Already created for common queries (email, city, time)

## Files Not Changed

- All frontend files remain unchanged
- All service files (AI, fraud, weather, decision engine) remain unchanged
- All route files remain unchanged
- All middleware remains unchanged

## Support

For Supabase documentation, visit: https://supabase.com/docs
For PostgreSQL docs: https://www.postgresql.org/docs/
