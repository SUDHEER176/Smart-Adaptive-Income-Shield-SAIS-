# GigShield AI+ - Setup & Demo Guide

## 📋 Complete Setup Instructions

### Step 1: Install Dependencies

#### Backend
```bash
cd server
npm install
```

#### Frontend
```bash
cd client
npm install
```

### Step 2: Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Or use MongoDB community edition

# Default connection string in .env
MONGO_URI=mongodb://localhost:27017/gigshield
```

**Option B: MongoDB Atlas (Cloud)**
```
Sign up at https://www.mongodb.com/cloud/atlas
Create cluster
Get connection string
Update MONGO_URI in server/.env
```

### Step 3: Environment Variables

**Server (.env)**
```
MONGO_URI=mongodb://localhost:27017/gigshield
PORT=5000
JWT_SECRET=gigshield_secret_key_2024
NODE_ENV=development
WEATHER_API_KEY=optional_api_key
```

### Step 4: Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm start
# Port 5000
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
# Port 3000
```

✅ App is ready at **http://localhost:3000**

---

## 🎮 Demo Walkthrough (5 Minutes)

### Demo User Account
```
Email: demo@gigshield.com
Password: demo123456
City: Hyderabad
Job Type: Delivery
```

### 1. **Login Screen** (30 sec)
- Navigate to http://localhost:3000
- Click "Login"
- Enter demo credentials
- ✅ Redirected to Dashboard

### 2. **Dashboard** (1 min)
- See tomorrow's prediction: ₹450 loss
- Confidence: 80%
- Risk Level: HIGH 🔴
- Weather: Cloudy
- Quick buttons visible below

### 3. **What-If Simulator** (1 min)
- Click "▶ Run Simulation"
- Select time slot (try "Evening")
- Click "Run Simulation"
- See results:
  - Without Insurance: ₹450
  - With Insurance: ₹200
  - Savings: ₹250
- Table shows all 3 time slots

### 4. **Buy Insurance** (1 min)
- Click "🛡️ Buy Insurance"
- Select "Evening" plan (₹20/day)
- Check "Weekly Plan" checkbox
- Total: ₹140 for 7 days coverage
- Click "Activate Plan"
- ✅ Policy purchased!

### 5. **Admin Panel** (1 min)
- Go to URL: http://localhost:3000/admin
- See dashboard metrics:
  - Total Users
  - Total Claims
  - Total Payout
  - Avg Behavior Score
- View city heatmap
- See high-risk areas

---

## 🧪 Testing Specific Features

### Test 1: Predict Loss by City
```bash
curl -X POST http://localhost:5000/api/prediction/get \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Mumbai",
    "timeSlot": "evening"
  }'
```

### Test 2: Buy Insurance Plan
```bash
curl -X POST http://localhost:5000/api/insurance/buy \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "timeSlots": ["morning", "evening"],
    "weeklyPlan": true
  }'
```

### Test 3: File a Claim
```bash
curl -X POST http://localhost:5000/api/claims/file \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "policyId": "POLICY_ID",
    "loss": 400,
    "weatherCondition": "Rainy",
    "timeSlot": "evening"
  }'
```

### Test 4: Get Admin Stats
```bash
curl http://localhost:5000/api/admin/stats
```

---

## 🔧 Debugging Tips

### Issue: "Cannot connect to MongoDB"
```
✅ Check if MongoDB is running
✅ Verify MONGO_URI in .env
✅ Use `mongosh` to connect manually
```

### Issue: "JWT Token Failed"
```
✅ Check Authorization header format: "Bearer TOKEN"
✅ Verify token not expired (7 days)
✅ Check JWT_SECRET matches in .env
```

### Issue: CORS Errors
```
✅ Verify backend running on http://localhost:5000
✅ Check client proxy in package.json
✅ Restart both servers
```

### Issue: Port Already In Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 📊 Database Seeding (Optional)

To pre-populate database with test data:

```bash
# Create test users
POST /api/auth/register
{
  "name": "Sudheer",
  "email": "sudheer@gigshield.com",
  "phone": "9999999999",
  "password": "test123",
  "city": "Hyderabad",
  "jobType": "Delivery"
}

# Repeat for more users with different cities
```

---

## 🎯 Feature Checklist for Demo

### Core Features
- [x] User registration & login
- [x] JWT authentication
- [x] Weather-based prediction
- [x] AI loss estimation
- [x] Insurance plan selection
- [x] Policy purchase & activation
- [x] What-if simulation
- [x] Claims filing
- [x] Auto-payout generation
- [x] Fraud detection
- [x] Behavior scoring
- [x] Admin dashboard

### UI/UX Features
- [x] Beautiful gradients
- [x] Responsive design
- [x] Smooth animations
- [x] Color-coded risk levels
- [x] Real-time updates
- [x] Error handling
- [x] Loading states
- [x] Confirmation messages

### Backend Features
- [x] REST API
- [x] Protected routes
- [x] Database models
- [x] Business logic
- [x] Error handling
- [x] Data validation
- [x] Admin endpoints

---

## 🚀 Production Deployment

### Firebase Hosting (Frontend)
```bash
npm run build
firebase deploy
```

### Heroku (Backend)
```bash
heroku login
heroku create gigshield-api
git push heroku main
```

### MongoDB Atlas
```
Already managed - no setup needed
```

---

## 📈 Performance Optimization

### Already Implemented
- JWT caching in localStorage
- API response caching
- Lazy loading pages
- CSS optimization
- Database indexing

### Future Optimization
- Code splitting
- PWA support
- Image optimization
- API rate limiting

---

## 🎓 Learning Resources

### Backend Development
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Tutorials](https://docs.mongodb.com/)
- [JWT Authentication](https://jwt.io/)

### Frontend Development
- [React Documentation](https://react.dev/)
- [CSS Grid & Flexbox](https://css-tricks.com/)
- [API Integration](https://axios-http.com/)

---

## ❓ FAQ

**Q: Can I use MySQL instead of MongoDB?**
A: Yes, but you'll need to change models. MongoDB works best with our schema design.

**Q: How long does the demo take?**
A: 5-10 minutes for full walkthrough, 2-3 minutes for core features.

**Q: Can I modify the AI engine?**
A: Yes! Check `/server/services/aiService.js` for the decision logic.

**Q: How do I add more cities?**
A: Update `weatherService.js` with new city data.

**Q: Is this production-ready?**
A: Mostly! Just add proper error handling, validation, and testing before launch.

---

## 🎬 Recording Demo

```bash
# Use screen recording tool
# Recommended: OBS Studio (free)
# Focus on:
# 1. Login flow (10 sec)
# 2. Dashboard prediction (15 sec)
# 3. Simulator in action (20 sec)
# 4. Buying insurance (15 sec)
# 5. Admin panel (20 sec)
# Total: ~80 seconds
```

---

## 🏁 You're All Set!

1. ✅ Backend running on port 5000
2. ✅ Frontend running on port 3000
3. ✅ MongoDB connected
4. ✅ Ready for demo

**Time to impress the judges! 🚀**

---

Last Updated: March 2024  
Questions? Check the main README.md
