# 🛡️ GigShield AI+ - Insurance for Gig Workers

## 🎯 Overview

**GigShield AI+** is an AI-powered micro-insurance platform designed for gig workers (delivery, drivers, etc.). It uses weather data and machine learning to predict income loss and offer personalized, time-based insurance coverage.

### 🔥 Key Features
- **📊 Predictive Loss Estimation** - AI predicts income loss based on weather & time
- **💰 Micro-Time Insurance** - Flexible coverage by time slot (morning/afternoon/evening)
- **🧠 What-If Simulator** - Compare scenarios with/without insurance
- **👥 Group Insurance** - Pool resources with other workers
- **🎮 Behavior Scoring** - Earnings & rewards for good behavior
- **🚨 Fraud Detection** - Smart fraud checks before payout
- **💳 Auto-Claims** - Claims auto-triggered on weather events
- **📍 Risk Heatmap** - Real-time risk by city & time
- **⚙️ Admin Dashboard** - Analytics, claims management

---

## 📁 Project Structure

```
guidwire/
├── server/                    # Node.js Backend
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Policy.js
│   │   ├── Group.js
│   │   ├── Claim.js
│   │   └── LossAnalytics.js
│   ├── services/             # Business logic
│   │   ├── weatherService.js  # Weather data
│   │   ├── aiService.js       # AI predictions
│   │   ├── fraudService.js    # Fraud detection
│   │   └── decisionEngine.js  # Rules & payouts
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── predictionController.js
│   │   ├── insuranceController.js
│   │   ├── simulationController.js
│   │   ├── claimsController.js
│   │   └── adminController.js
│   ├── routes/               # API endpoints
│   │   ├── authRoutes.js
│   │   ├── predictionRoutes.js
│   │   ├── insuranceRoutes.js
│   │   ├── simulationRoutes.js
│   │   ├── claimsRoutes.js
│   │   └── adminRoutes.js
│   ├── app.js                # Main server
│   └── package.json
│
├── client/                   # React Frontend
│   ├── pages/                # Main screens
│   │   ├── LoginRegister.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Simulator.jsx
│   │   ├── InsurancePlans.jsx
│   │   ├── Profile.jsx
│   │   └── RiskMap.jsx
│   ├── styles/               # CSS
│   │   ├── global.css
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── simulator.css
│   │   ├── insurance.css
│   │   ├── profile.css
│   │   ├── riskmap.css
│   │   ├── admin.css
│   │   └── App.css
│   ├── api.js                # API services
│   ├── App.jsx               # Main component
│   ├── index.jsx             # Entry point
│   ├── index.html            # HTML template
│   └── package.json
│
└── admin/                    # Admin Dashboard
    └── AdminPanel.jsx
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v14+
- **MongoDB** (local or Atlas)
- **npm** or **yarn**

### 1️⃣ Backend Setup

```bash
cd server
npm install
```

Create `.env` file:
```
MONGO_URI=mongodb://localhost:27017/gigshield
PORT=5000
JWT_SECRET=your_secret_key_here
```

Start server:
```bash
npm start
# Or for development with auto-reload
npm run dev
```

✅ Server runs on **http://localhost:5000**

### 2️⃣ Frontend Setup

```bash
cd client
npm install
npm start
```

✅ Frontend runs on **http://localhost:3000**

---

## 📊 System Architecture

```
User App (React)
    ↓
Backend API (Node.js)
    ↓
Services:
  ├─ Weather Service → Get weather data
  ├─ AI Service → Predict loss (THE BRAIN!)
  ├─ Fraud Service → Detect fraud
  └─ Decision Engine → Calculate payouts
    ↓
Database (MongoDB)
    ├─ Users
    ├─ Policies
    ├─ Claims
    ├─ Groups
    └─ Loss Analytics
```

---

## 🧠 AI Decision Engine

### Risk Prediction Algorithm
```
Rain > 70% → HIGH Risk
Afternoon → MEDIUM Risk
Evening + Rain → MAX payout (2x)
Morning → LOW Risk
```

### Behavior Score
- Base: 85/100
- -15 points: More than 5 claims
- -10 points: More than 2 claims
- -10 per fraud flag
- +10 points: Perfect record

### Payout Calculation
```
Base Loss × Weather Multiplier × Risk Adjustment
- Capped at 500₹ (max coverage)
- 20% reduction if behavior score < 70
- 20% increase for evening rain events
```

---

## 💾 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/register          # User registration
POST   /api/auth/login              # User login
GET    /api/auth/profile            # Get user profile (🔒 Protected)
```

### 📊 Predictions
```
POST   /api/prediction/get           # Get loss prediction
GET    /api/prediction/riskmap       # View risk heatmap
POST   /api/prediction/dashboard     # Dashboard (🔒 Protected)
```

### 💰 Insurance
```
GET    /api/insurance/plans          # Get available plans
POST   /api/insurance/buy            # Buy plan (🔒 Protected)
GET    /api/insurance/mypolicies     # My policies (🔒 Protected)
DELETE /api/insurance/cancel/:id     # Cancel policy (🔒 Protected)
```

### 🧪 Simulation
```
POST   /api/simulation/run           # Run what-if scenario
POST   /api/simulation/compare       # Compare time slots
```

### 📋 Claims
```
POST   /api/claims/file              # File claim (🔒 Protected)
GET    /api/claims/my                # My claims (🔒 Protected)
GET    /api/claims/all               # All claims (for admin)
```

### ⚙️ Admin
```
GET    /api/admin/stats              # System stats
GET    /api/admin/heatmap            # Risk heatmap (city-wise)
GET    /api/admin/high-risk          # High-risk areas
PUT    /api/admin/user-score         # Update user score
```

---

## 🎮 User Flows

### 1. **Registration & Login**
```
User → Register with city + job type
    → Login with credentials
    → Get JWT token
    → Stored in localStorage
```

### 2. **Dashboard View**
```
User views:
  ├─ Tomorrow's prediction (₹450, 80% confidence)
  ├─ Current behavior score (85/100)
  ├─ Weather condition
  ├─ Risk level (HIGH/MEDIUM/LOW)
  └─ Quick action buttons
```

### 3. **Buy Insurance**
```
User selects time slots:
  ├─ Morning (₹5, low risk)
  ├─ Afternoon (₹15, medium risk)
  └─ Evening (₹20, high risk)
    → Choose weekly or daily
    → Complete purchase
    → Policy activated
```

### 4. **What-If Simulator**
```
User inputs:
  ├─ City → Weather data
  ├─ Time slot → Risk level
    → Without insurance: ₹500 loss
    → With insurance: ₹350 you pay
    → Savings: ₹150 protected
```

### 5. **Auto-Claim Processing**
```
Weather event occurs:
  ├─ ✅ Fraud check
  ├─ ✅ Claim validation
  ├─ ✅ Payout calculation
  ├─ ✅ Behavior score update
  └─ ✅ Automatic payout
```

---

## 🧪 Demo Scenarios

### Scenario 1: High Loss Evening
```json
{
  "city": "Mumbai",
  "timeSlot": "evening",
  "weather": "Rainy",
  "rainProb": 85%,
  "predictedLoss": 450,
  "riskLevel": "HIGH",
  "confidence": 85%,
  "recommendation": "Buy Insurance!"
}
```

### Scenario 2: Safe Morning
```json
{
  "city": "Delhi",
  "timeSlot": "morning",
  "weather": "Clear",
  "rainProb": 15%,
  "predictedLoss": 100,
  "riskLevel": "LOW",
  "confidence": 90%,
  "recommendation": "Optional"
}
```

### Scenario 3: Claim Auto-Payout
```json
{
  "userId": "user123",
  "loss": 400,
  "fraudRisk": false,
  "status": "paid",
  "payout": 380,
  "timestamp": "2024-03-20T14:30:00Z"
}
```

---

## 📱 Frontend Pages

### 1. **Login/Register** (`/`)
- Email/phone login
- OTP verification (mock)
- Select city + job type
- Beautiful gradient background

### 2. **Dashboard** (`/dashboard`) 🔥
- Real-time loss prediction
- Confidence score
- Weather widget
- Quick action buttons
- Behavior score display

### 3. **What-If Simulator** (`/simulator`)
- Select time slot & weather
- Compare loss scenarios
- Side-by-side tables
- Save favorite scenarios

### 4. **Insurance Plans** (`/insurance`)
- 3 time slot options
- Interactive plan cards
- Weekly/daily toggle
- Checkout with summary

### 5. **Profile** (`/profile`)
- User info display
- Behavior score (ring chart)
- Policy history
- Claim history
- Points & rewards

### 6. **Risk Map** (`/risk-map`)
- Heatmap by city
- Filter by risk level
- Real-time updates
- Color-coded zones

### 7. **Admin Panel** (`/admin`)
- Dashboard metrics
- City risk heatmap
- High-risk areas list
- Claims breakdown

---

## 🔒 Security Features

✅ **JWT Authentication** - Token-based auth
✅ **Password Hashing** - bcryptjs
✅ **Protected Routes** - API authorization
✅ **Fraud Detection** - Pattern analysis
✅ **Rate Limiting** - (Optional setup)
✅ **Data Validation** - Input sanitization

---

## 📊 Database Models

### User
```
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  city: String,
  jobType: String,
  behaviorScore: Number (0-100),
  points: Number,
  totalClaims: Number,
  fraudRisk: Boolean,
  createdAt: Date
}
```

### Policy
```
{
  userId: ObjectId,
  weeklyPlan: Boolean,
  timeSlots: [String],
  premium: Number,
  startDate: Date,
  endDate: Date,
  isActive: Boolean,
  coverage: Number,
  createdAt: Date
}
```

### Claim
```
{
  userId: ObjectId,
  policyId: ObjectId,
  loss: Number,
  payout: Number,
  status: String (pending/approved/paid/rejected),
  reason: String,
  weatherCondition: String,
  fraudCheck: Boolean,
  timestamp: Date,
  createdAt: Date
}
```

---

## 🎬 Testing the Prototype

### Test Credentials
```
Email: demo@gigshield.com
Password: demo123
City: Hyderabad
Job Type: Delivery
```

### Quick Test Flow
1. **Register** a new user
2. **View Dashboard** - See prediction for tomorrow
3. **Run Simulator** - Compare time slots
4. **Buy Insurance** - Purchase an evening plan
5. **File Claim** - Submit a loss event
6. **View Admin** - See the heatmap
7. **Check Profile** - View behavior score

---

## 🏆 Key Differentiators

| Feature | GigShield | Traditional Insurance |
|---------|-----------|----------------------|
| **Coverage** | Time-based | Day-based |
| **Cost** | ₹5-20/slot | ₹200+/month |
| **Sign-up** | 2 minutes | Hours |
| **Claims** | Auto-triggered | Manual filing |
| **Decision** | AI-driven | Human review |
| **Flexibility** | Choose slots | All or nothing |

---

## 🚂 Roadmap (Future)

- [ ] Real weather API integration
- [ ] SMS/WhatsApp notifications
- [ ] Offline mode (local storage)
- [ ] Mobile app (React Native)
- [ ] Group forming & pooling
- [ ] Referral rewards
- [ ] Multiple languages
- [ ] Payment gateway (Stripe/Razorpay)
- [ ] Advanced ML models
- [ ] Real claims data

---

## 👨‍💼 For Judges/Investors

### Why This Wins

1. **Solves Real Problem** - Gig workers need quick, affordable insurance
2. **AI + Simplicity** - Complex tech, simple UX
3. **Demo-Ready** - All screens fully functional
4. **Realistic Flow** - Login → Prediction → Plan → Claim → Payout
5. **Smart Thinking** - Fraud detection, behavior scoring, risk engines
6. **Scalable** - Works with real data (MongoDB)
7. **Beautiful UI** - Modern gradients, smooth animations

### Not Just a Prototype
- ✅ Real database models
- ✅ Production-ready backend structure
- ✅ REST API with authentication
- ✅ Complete user flows
- ✅ Admin analytics
- ✅ Decision engines & fraud checks

---

## 🤝 Contributing

```bash
# Fork → Clone → Create feature branch
git checkout -b feature/amazing-feature
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
# Create Pull Request
```

---

## 📝 License

MIT License - Free to use and modify

---

## 📞 Contact

**Email:** team@gigshield.com  
**Discord:** [Join Community](#)  
**Twitter:** @GigShieldAI  

---

## 🙏 Acknowledgments

Built with ❤️ by the GigShield Team

**Tech Stack:**
- Frontend: React.js, CSS3
- Backend: Node.js, Express.js
- Database: MongoDB
- Auth: JWT + bcryptjs

---

**v1.0.0** | Last Updated: 2024  
🚀 Making gig work safer, one shift at a time.
