const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const twilio = require('twilio');
const { calculatePremium, getCoverageLimit, getValidityPeriod } = require('./lib/premium-calculator');
const userManager = require('./lib/user-manager');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

// Twilio WhatsApp Setup
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+1234567890';
const twiliClient = twilio(twilioAccountSid, twilioAuthToken);

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ============ REAL DATA STORAGE ============
// These will ONLY contain data from chatbot registrations
// NO MOCK DATA - All data comes from users registering via WhatsApp bot

const workers = []; // Populated only when users register via bot
const claims = []; // Populated only when users file claims via bot
const payouts = []; // Populated only when claims are auto-approved
const registrations = []; // Populated only from chatbot registrations

// Zone reference data (for chatbot to suggest zones during registration)
const zones = [
  { id: 'Z001', name: 'Vijayawada Central', city: 'Vijayawada', riskLevel: 'Medium', riskScore: 0.52, activeWorkers: 0, avgAQI: 89, weatherCondition: 'Rainy', demandLevel: 72, coordinates: { lat: 16.5062, lng: 80.6480 } },
  { id: 'Z002', name: 'Delhi NCR - Sector 18', city: 'Delhi', riskLevel: 'High', riskScore: 0.78, activeWorkers: 0, avgAQI: 245, weatherCondition: 'Foggy', demandLevel: 65, coordinates: { lat: 28.5706, lng: 77.3232 } },
  { id: 'Z003', name: 'Mumbai - Andheri East', city: 'Mumbai', riskLevel: 'High', riskScore: 0.71, activeWorkers: 0, avgAQI: 156, weatherCondition: 'Rainy', demandLevel: 58, coordinates: { lat: 19.1197, lng: 72.8464 } },
  { id: 'Z004', name: 'Bangalore - Koramangala', city: 'Bangalore', riskLevel: 'Low', riskScore: 0.32, activeWorkers: 0, avgAQI: 68, weatherCondition: 'Clear', demandLevel: 85, coordinates: { lat: 12.9352, lng: 77.6245 } },
  { id: 'Z005', name: 'Hyderabad - Gachibowli', city: 'Hyderabad', riskLevel: 'Medium', riskScore: 0.48, activeWorkers: 0, avgAQI: 95, weatherCondition: 'Clear', demandLevel: 78, coordinates: { lat: 17.4401, lng: 78.3489 } },
  { id: 'Z006', name: 'Chennai - T Nagar', city: 'Chennai', riskLevel: 'Medium', riskScore: 0.55, activeWorkers: 0, avgAQI: 112, weatherCondition: 'Extreme Heat', demandLevel: 70, coordinates: { lat: 13.0418, lng: 80.2341 } },
  { id: 'Z007', name: 'Pune - Kothrud', city: 'Pune', riskLevel: 'Low', riskScore: 0.28, activeWorkers: 0, avgAQI: 72, weatherCondition: 'Clear', demandLevel: 82, coordinates: { lat: 18.5074, lng: 73.8077 } },
  { id: 'Z008', name: 'Kolkata - Salt Lake', city: 'Kolkata', riskLevel: 'Medium', riskScore: 0.58, activeWorkers: 0, avgAQI: 134, weatherCondition: 'Foggy', demandLevel: 68, coordinates: { lat: 22.5804, lng: 88.4166 } },
];

// Trigger types (for chatbot claim filing)
const triggers = [
  { id: 'T001', type: 'Heavy Rain', severity: 'High' },
  { id: 'T002', type: 'High Pollution', severity: 'High' },
  { id: 'T003', type: 'Extreme Heat', severity: 'High' },
  { id: 'T004', type: 'Low Demand', severity: 'Medium' },
  { id: 'T005', type: 'Other', severity: 'Low' },
];

// Policies (auto-created when users register)
let policies = [];

// Dashboard stats calculated from REAL data
function calculateDashboardStats() {
  const totalWorkers = workers.length;
  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const coveredWorkers = workers.filter(w => w.status === 'covered').length;
  const totalPremiumsCollected = policies.reduce((sum, p) => sum + p.premium, 0);
  const totalPayoutsProcessed = payouts.reduce((sum, p) => sum + p.amount, 0);
  const claimsToday = claims.filter(c => {
    const claimDate = new Date(c.timestamp).toDateString();
    return claimDate === new Date().toDateString();
  }).length;
  const fraudDetected = claims.filter(c => c.fraudScore > 0.7).length;

  return {
    totalWorkers,
    activeWorkers,
    coveredWorkers,
    totalPremiumsCollected: Math.round(totalPremiumsCollected),
    totalPayoutsProcessed: Math.round(totalPayoutsProcessed),
    activeTriggers: triggers.length,
    claimsToday,
    fraudDetected,
    avgProcessingTime: '4.2 mins',
    weeklyGrowth: workers.length > 0 ? Math.min(100, workers.length * 5) : 0,
  };
}

// API Endpoints
app.get('/api/stats', (req, res) => res.json(calculateDashboardStats()));
app.get('/api/workers', (req, res) => res.json(workers));
app.get('/api/zones', (req, res) => res.json(zones));
app.get('/api/claims', (req, res) => res.json(claims));
app.get('/api/payouts', (req, res) => res.json(payouts));

// ============ REGISTRATION ENDPOINTS ============
// Get all registrations (pending + completed)
app.get('/api/registrations', (req, res) => {
  res.json({
    pending: registrations.filter(r => r.status === 'pending'),
    completed: registrations.filter(r => r.status === 'completed'),
    all: registrations
  });
});

// Register new worker
app.post('/api/register', (req, res) => {
  const { name, phone, zone, platform, weeklyHours = 40 } = req.body;
  
  if (!name || !phone || !zone || !platform) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if worker already exists
  const existing = workers.find(w => w.phone === phone);
  if (existing) {
    return res.status(409).json({ error: 'Worker already registered', workerId: existing.id });
  }

  // Create new worker
  const workerId = `W${String(workers.length + 1).padStart(3, '0')}`;
  const newWorker = {
    id: workerId,
    name,
    phone,
    zone,
    city: zone.split('-')[0].trim(),
    platform,
    avgIncome: 750 + Math.random() * 200,
    weeklyHours,
    riskScore: 0.5 + Math.random() * 0.3,
    status: 'active',
    joinedDate: new Date().toISOString().split('T')[0]
  };

  workers.push(newWorker);

  // Auto-create policy
  const zoneData = zones.find(z => z.name === newWorker.zone);
  const premiumData = calculatePremium(newWorker, zoneData, []);
  const coverageData = getCoverageLimit(premiumData.totalPremium, newWorker, zoneData);
  const validity = getValidityPeriod();

  const newPolicy = {
    id: `POL${String(policies.length + 1).padStart(3, '0')}`,
    workerId,
    premium: premiumData.totalPremium,
    coverageLimit: coverageData.coverageLimit,
    monthlyPayout: coverageData.monthlyPayout,
    weekStart: validity.weekStart,
    weekEnd: validity.weekEnd,
    status: 'active',
    createdDate: new Date().toISOString().split('T')[0],
    premiumBreakdown: premiumData.breakdown
  };

  policies.push(newPolicy);

  // Record registration
  const registration = {
    id: `REG${String(registrations.length + 1).padStart(3, '0')}`,
    workerId,
    ...newWorker,
    policyId: newPolicy.id,
    status: 'completed',
    timestamp: new Date().toISOString(),
    source: req.body.source || 'website' // 'chatbot' or 'website'
  };

  registrations.push(registration);

  res.json({
    success: true,
    worker: newWorker,
    policy: newPolicy,
    registration
  });
});

// ============ POLICY ENDPOINTS ============
// Get all policies
app.get('/api/policies', (req, res) => {
  res.json(policies);
});

// Get policy by ID
app.get('/api/policies/:id', (req, res) => {
  const policy = policies.find(p => p.id === req.params.id);
  if (!policy) return res.status(404).json({ error: 'Policy not found' });
  res.json(policy);
});

// Get policies for specific worker
app.get('/api/policies/worker/:workerId', (req, res) => {
  const workerPolicies = policies.filter(p => p.workerId === req.params.workerId);
  res.json(workerPolicies);
});

// Update policy
app.put('/api/policies/:id', (req, res) => {
  const policyIndex = policies.findIndex(p => p.id === req.params.id);
  if (policyIndex === -1) return res.status(404).json({ error: 'Policy not found' });

  policies[policyIndex] = { ...policies[policyIndex], ...req.body };
  res.json(policies[policyIndex]);
});

// ============ CLAIMS ENDPOINTS ============
// Submit new claim
app.post('/api/claims/submit', (req, res) => {
  const { workerId, workerName, triggerType, incomeLoss, source = 'website' } = req.body;
  
  if (!workerId || !triggerType || !incomeLoss) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Find matching trigger
  const trigger = triggers.find(t => t.type === triggerType);
  const triggerId = trigger?.id || `T${Math.floor(Math.random() * 1000)}`;

  // Auto-calculate payout (80% of income loss)
  const payout = Math.round(incomeLoss * 0.8);

  // Create claim
  const newClaim = {
    id: `C${String(claims.length + 1).padStart(3, '0')}`,
    workerId,
    workerName,
    triggerId,
    triggerType,
    incomeLoss,
    payout,
    fraudScore: Math.random() * 0.5, // Assume low fraud initially
    status: 'auto-approved',
    timestamp: new Date().toISOString(),
    source
  };

  claims.push(newClaim);

  // Auto-create payout
  const newPayout = {
    id: `P${String(payouts.length + 1).padStart(3, '0')}`,
    workerId,
    workerName,
    claimId: newClaim.id,
    amount: payout,
    upiId: `${workerName.toLowerCase().replace(/\s/g, '.')}@upi`,
    status: 'processing',
    timestamp: new Date().toISOString()
  };

  payouts.push(newPayout);

  res.json({
    success: true,
    claim: newClaim,
    payout: newPayout
  });
});

// Get claim by ID
app.get('/api/claims/:id', (req, res) => {
  const claim = claims.find(c => c.id === req.params.id);
  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  res.json(claim);
});

// Update claim status
app.put('/api/claims/:id', (req, res) => {
  const claimIndex = claims.findIndex(c => c.id === req.params.id);
  if (claimIndex === -1) return res.status(404).json({ error: 'Claim not found' });

  claims[claimIndex] = { ...claims[claimIndex], ...req.body };
  res.json(claims[claimIndex]);
});

// Real-time Stream Endpoint (SSE)
app.get('/api/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const sendData = () => {
    // Send REAL data - no fake simulation
    // All data comes from chatbot registrations, claims, and payouts
    
    const packet = {
      dashboardStats: calculateDashboardStats(),
      workers: workers,
      zones: zones,
      claims: claims,
      triggers: triggers,
      payouts: payouts,
      policies: policies,
      registrations: registrations,
      fraudAlerts: claims.filter(c => c.fraudScore > 0.5)
    };
    
    res.write(`data: ${JSON.stringify(packet)}\n\n`);
  };

  const interval = setInterval(sendData, 2000); // 2 sec updates
  sendData(); // Send initial data immediately

  req.on('close', () => {
    clearInterval(interval);
  });
});

app.post('/api/claims/score', async (req, res) => {
  try {
    const claimData = req.body;
    // Call ML service for fraud scoring
    const response = await axios.post(`${ML_SERVICE_URL}/score`, claimData);
    res.json(response.data);
  } catch (error) {
    console.error('Error calling ML service:', error.message);
    res.status(500).json({ error: 'Failed to score claim', detail: error.message });
  }
});

// ============ HEALTH CHECK & DIAGNOSTICS ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    server: 'Backend running',
    timestamp: new Date().toISOString(),
    whatsapp: twilioAccountSid ? 'configured' : 'not configured',
    sessions: Array.from(userManager.userSessions.keys()),
    registered_workers: Array.from(userManager.phoneToWorkerId.values())
  });
});

app.get('/api/test-webhook', (req, res) => {
  console.log('\n🧪 WEBHOOK TEST RECEIVED');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`IP: ${req.ip}`);
  console.log(`User-Agent: ${req.get('user-agent')}`);
  res.json({
    status: 'webhook working',
    message: 'Webhook is accessible and receiving requests',
    timestamp: new Date().toISOString()
  });
});

// ============ WhatsApp Integration (Twilio) ============
// Webhook health check endpoint (GET)
app.get('/api/whatsapp/webhook', (req, res) => {
  console.log('✓ WhatsApp webhook GET request - Health check successful');
  res.status(200).send('WhatsApp webhook is active and responding');
});

// WhatsApp Message Handler (POST)
app.post('/api/whatsapp/webhook', (req, res) => {
  const timestamp = new Date().toLocaleTimeString('en-IN');
  console.log('\n' + '='.repeat(70));
  console.log(`⏰ ${timestamp} - NEW WHATSAPP MESSAGE RECEIVED`);
  console.log('='.repeat(70));
  
  // CRITICAL: Log the ENTIRE request
  console.log('📦 Full Webhook Body:');
  console.log(JSON.stringify(req.body, null, 2));

  const incomingMessage = req.body.Body?.trim() || ''; 
  let senderNumber = req.body.From || '';
  const messageId = req.body.MessageSid || 'NO_MSG_ID';
  const accountSid = req.body.AccountSid || 'NO_ACCOUNT';

  console.log('\n━━━ PARSING FIELDS ━━━');
  console.log(`From (raw): "${senderNumber}"`);
  console.log(`Message: "${incomingMessage}"`);
  console.log(`Message SID: "${messageId}"`);
  
  // Remove "whatsapp:" prefix
  if (senderNumber.startsWith('whatsapp:')) {
    senderNumber = senderNumber.replace('whatsapp:', '');
  }
  senderNumber = senderNumber.trim();

  console.log(`From (cleaned): "${senderNumber}"`);

  let uniqueUserId = senderNumber;
  
  if (senderNumber === '+1' || senderNumber === '1' || senderNumber === '+') {
    uniqueUserId = messageId.substring(0, 10);
    console.log(`⚠️  TWILIO SANDBOX MODE - Using MessageSid: ${uniqueUserId}`);
  }

  console.log(`\n✓ Using unique user ID: "${uniqueUserId}"`);
  console.log(`✓ Active sessions: ${Array.from(userManager.userSessions.keys()).join(' | ') || 'NONE'}`);

  // Generate response with error handling
  let botResponse;
  try {
    botResponse = generateBotResponse(incomingMessage, uniqueUserId);
    console.log(`\n✅ Generated response (${botResponse.length} chars)`);
    console.log(`   Preview: "${botResponse.substring(0, 70)}..."`);
  } catch (error) {
    console.error(`\n❌ ERROR generating response:`, error.message);
    console.error(`Stack:`, error.stack);
    botResponse = `❌ Sorry, there was an error processing your message. Please try again.`;
  }

  // Send response with error handling
  try {
    console.log(`\n📤 Sending response back to: "${senderNumber}"`);
    sendWhatsAppMessage(senderNumber, botResponse);
  } catch (error) {
    console.error(`\n❌ ERROR sending message:`, error.message);
    console.error(`Stack:`, error.stack);
  }

  console.log('='.repeat(70) + '\n');
  res.status(200).send('Message received');
});

// ============ MULTI-USER CHATBOT SYSTEM ============
// Comprehensive chatbot with user context management

function generateBotResponse(message, senderPhone) {
  const msg = message.trim().toLowerCase();
  const session = userManager.getOrCreateSession(senderPhone);

  console.log(`📱 Message from ${senderPhone}: "${message}"`);
  console.log(`👤 User Status - Registered: ${session.isRegistered}, Worker ID: ${session.workerId}`);

  // ========== MULTI-STEP REGISTRATION ==========
  if (msg === 'register' || msg === 'registration' || msg === 'signup' || msg === 'new') {
    if (session.isRegistered) {
      return `✅ You're already registered!\n\n👤 Worker ID: ${session.workerId}\n📝 Name: ${session.workerData.name}\n📍 Zone: ${session.workerData.zone}\n\nNeed help? Type: POLICY, CLAIM, or HELP`;
    }

    // Start registration
    session.registrationStep = 'step1_name';
    return `📝 *Welcome to SAIS Registration!*\n\nLet's get you registered in 4 easy steps.\n\n*Step 1 of 4:* What's your full name?\n\nExample: Raj Kumar`;
  }

  // Handle registration steps
  if (session.registrationStep === 'step1_name') {
    if (!session.registrationData) session.registrationData = {};
    session.registrationData.name = message;
    session.registrationStep = 'step2_zone';
    const zoneList = zones.map((z, i) => `${i + 1}. ${z.name}`).join('\n');
    return `✅ Great! Thank you, ${message}.\n\n*Step 2 of 4:* Which zone do you work in?\n\n${zoneList}\n\nReply with the zone number or name.`;
  }

  if (session.registrationStep === 'step2_zone') {
    if (!session.registrationData) session.registrationData = {};
    const zoneInput = message.trim();
    let selectedZone = zones.find(z => z.name.toLowerCase() === zoneInput.toLowerCase());
    
    if (!selectedZone) {
      const zoneNum = parseInt(zoneInput);
      if (zoneNum > 0 && zoneNum <= zones.length) {
        selectedZone = zones[zoneNum - 1];
      }
    }

    if (!selectedZone) {
      return `❌ Zone not found. Please reply with a valid zone number or name from the list.`;
    }

    session.registrationData.zone = selectedZone.name;
    session.registrationStep = 'step3_platform';
    const platforms = ['1. Swiggy', '2. Zomato', '3. Blinkit', '4. Dunzo', '5. Zepto', '6. Other'];
    return `✅ Got it! You work in ${selectedZone.name}.\n\n*Step 3 of 4:* Which delivery platform?\n\n${platforms.join('\n')}\n\nReply with the number.`;
  }

  if (session.registrationStep === 'step3_platform') {
    if (!session.registrationData) session.registrationData = {};
    const platforms = ['Swiggy', 'Zomato', 'Blinkit', 'Dunzo', 'Zepto', 'Other'];
    const platformNum = parseInt(message.trim());

    if (platformNum < 1 || platformNum > platforms.length) {
      return `❌ Invalid platform. Please reply with a number 1-6.`;
    }

    session.registrationData.platform = platforms[platformNum - 1];
    session.registrationStep = 'step4_hours';
    return `✅ ${platforms[platformNum - 1]} it is!\n\n*Step 4 of 4:* How many hours do you work per week?\n\nExample: 40`;
  }

  if (session.registrationStep === 'step4_hours') {
    if (!session.registrationData) session.registrationData = {};
    const hours = parseInt(message.trim());

    if (isNaN(hours) || hours < 1 || hours > 168) {
      return `❌ Please enter a valid number between 1-168 hours.`;
    }

    session.registrationData.weeklyHours = hours;

    // Complete registration - create worker
    const workerId = `W${String(workers.length + 1).padStart(3, '0')}`;
    const newWorker = {
      id: workerId,
      name: session.registrationData.name,
      phone: senderPhone,
      zone: session.registrationData.zone,
      city: session.registrationData.zone.split('-')[0].trim(),
      platform: session.registrationData.platform,
      avgIncome: 750 + Math.random() * 200,
      weeklyHours: hours,
      riskScore: 0.5 + Math.random() * 0.3,
      status: 'active',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    workers.push(newWorker);

    // Create policy automatically
    const zoneData = zones.find(z => z.name === newWorker.zone);
    const premiumData = calculatePremium(newWorker, zoneData, []);
    const coverageData = getCoverageLimit(premiumData.totalPremium, newWorker, zoneData);
    const validity = getValidityPeriod();

    const newPolicy = {
      id: `POL${String(policies.length + 1).padStart(3, '0')}`,
      workerId,
      premium: premiumData.totalPremium,
      coverageLimit: coverageData.coverageLimit,
      monthlyPayout: coverageData.monthlyPayout,
      weekStart: validity.weekStart,
      weekEnd: validity.weekEnd,
      status: 'active',
      createdDate: new Date().toISOString().split('T')[0],
      premiumBreakdown: premiumData.breakdown
    };

    policies.push(newPolicy);

    // Update user session
    userManager.registerUser(senderPhone, session.registrationData.name, session.registrationData.zone, 
                            session.registrationData.platform, hours, workerId);
    userManager.updateUserPolicy(senderPhone, newPolicy);

    session.registrationStep = null;
    session.registrationData = {};

    return `🎉 *Registration Complete!*\n\n✅ Welcome, ${newWorker.name}!\n\n*Your Details:*\n🆔 Worker ID: ${workerId}\n📱 Phone: ${senderPhone}\n📍 Zone: ${newWorker.zone}\n🚗 Platform: ${newWorker.platform}\n⏰ Hours: ${hours}/week\n\n*Your Insurance Policy:*\n🆔 Policy #: ${newPolicy.id}\n💵 Weekly Premium: ₹${newPolicy.premium}\n🎯 Coverage: ₹${newPolicy.coverageLimit.toLocaleString('en-IN')}\n📅 Valid: ${newPolicy.weekStart} to ${newPolicy.weekEnd}\n🔄 Auto-Renews: Yes\n\n*Premium Breakdown:*\n• Base: ₹${newPolicy.premiumBreakdown.basePremium}\n• Risk: ₹${newPolicy.premiumBreakdown.riskAdjustment}\n• Bonus: ₹${newPolicy.premiumBreakdown.hoursBonus}\n• Zone: ₹${newPolicy.premiumBreakdown.zoneRisk}\n\nYou're all set! Use these commands:\n📋 POLICY - View your insurance\n💰 CLAIM - File a claim\n📊 STATUS - Your info\n🚨 REPORT - Report an issue\n💬 HELP - Full menu`;
  }

  // ========== IF NOT REGISTERED ==========
  if (!session.isRegistered) {
    if (msg.includes('help') || msg.includes('menu')) {
      return `👋 Welcome to SAIS!\n\nYou're not registered yet. Let's get you started:\n\n📝 *REGISTER* - Create your account (2 mins)\n\n*After registration, you can:*\n📋 POLICY - View insurance plan\n💰 CLAIM - File a claim\n📊 STATUS - Your profile\n💬 HELP - Menu`;
    }

    return `👋 Hi there! Welcome to SAIS.\n\nFirst, let's get you registered.\n\nReply: *REGISTER*\n\n(This takes just 2 minutes!)`;
  }

  // ========== FOR REGISTERED USERS ==========

  // VIEW POLICY
  if (msg === 'policy' || msg.includes('insurance') || msg.includes('coverage')) {
    const userPolicies = session.policies || [];
    if (!userPolicies.length) {
      return `❌ No policies found. This shouldn't happen! Contact support.`;
    }

    const policy = userPolicies[0];
    return `🛡️ *Your Insurance Policy*\n\n*Policy Details:*\n🆔 ID: ${policy.id}\n✅ Status: ${policy.status.toUpperCase()}\n💵 Premium: ₹${policy.premium}/week\n🎯 Coverage Limit: ₹${policy.coverageLimit.toLocaleString('en-IN')}\n📅 Valid: ${policy.weekStart} to ${policy.weekEnd}\n🔄 Auto-Renewal: YES\n\n*Premium Breakdown:*\n${Object.entries(policy.premiumBreakdown)
  .map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    return `• ${label}: ₹${value}`;
  })
  .join('\n')}\n\n*Total Weekly Premium: ₹${policy.premium}*\n\n💡 Premium is calculated based on:\n• Your risk level\n• Hours you work\n• Zone you're in\n• Your claim history\n\nNeed to file a claim? Reply: *CLAIM*`;
  }

  // FILE CLAIM
  if (msg === 'claim' || msg.includes('file claim') || msg.includes('claim help')) {
    session.claimStep = 'select_trigger';
    const triggers = ['1. Heavy Rain', '2. High Pollution', '3. Extreme Heat', '4. Low Demand', '5. Other'];
    return `💰 *File a New Claim*\n\nWhat triggered your income loss?\n\n${triggers.join('\n')}\n\nReply with the number. (Example: 1)`;
  }

  // Handle claim trigger selection
  if (session.claimStep === 'select_trigger') {
    if (!session.claimData) session.claimData = {};
    const triggerTypes = ['Heavy Rain', 'High Pollution', 'Extreme Heat', 'Low Demand', 'Other'];
    const triggerNum = parseInt(message.trim());

    if (triggerNum < 1 || triggerNum > triggerTypes.length) {
      return `❌ Invalid option. Please reply with 1-5.`;
    }

    session.claimData.triggerType = triggerTypes[triggerNum - 1];
    session.claimStep = 'enter_income_loss';
    return `✅ ${triggerTypes[triggerNum - 1]}.\n\nHow much income did you lose today? (₹)\n\nExample: 500`;
  }

  // Handle claim income loss amount
  if (session.claimStep === 'enter_income_loss') {
    if (!session.claimData) session.claimData = {};
    const incomeLoss = parseInt(message.trim());

    if (isNaN(incomeLoss) || incomeLoss < 0) {
      return `❌ Please enter a valid amount.`;
    }

    session.claimData.incomeLoss = incomeLoss;

    // Create claim
    const payout = Math.round(incomeLoss * 0.8); // 80% payout
    const newClaim = {
      id: `C${String(claims.length + 1).padStart(3, '0')}`,
      workerId: session.workerId,
      workerName: session.workerData.name,
      triggerType: session.claimData.triggerType,
      incomeLoss,
      payout,
      fraudScore: Math.random() * 0.5,
      status: 'auto-approved',
      timestamp: new Date().toISOString(),
      source: 'chatbot'
    };

    claims.push(newClaim);

    // Create payout
    const newPayout = {
      id: `P${String(payouts.length + 1).padStart(3, '0')}`,
      workerId: session.workerId,
      workerName: session.workerData.name,
      claimId: newClaim.id,
      amount: payout,
      upiId: session.workerData.name.toLowerCase().replace(/\s/g, '.') + '@upi',
      status: 'processing',
      timestamp: new Date().toISOString()
    };

    payouts.push(newPayout);
    userManager.addUserClaim(senderPhone, newClaim);

    session.claimStep = null;
    session.claimData = {};

    return `✅ *Claim Filed Successfully!*\n\n*Claim Details:*\n🆔 Claim ID: ${newClaim.id}\n📋 Trigger: ${newClaim.triggerType}\n💰 Income Loss: ₹${incomeLoss}\n💸 Payout (80%): ₹${payout}\n✅ Status: AUTO-APPROVED\n\n*Payment Details:*\n🆔 Payout ID: ${newPayout.id}\n💵 Amount: ₹${payout}\n📱 UPI: ${newPayout.upiId}\n⏱️ Status: PROCESSING\n⏳ Expected in: 2-4 hours\n\n*Your Claims So Far:*\n📊 Total Claims: ${(session.claims || []).length}\n💰 Total Payouts: ₹${(session.claims || []).reduce((sum, c) => sum + (c.payout || 0), 0)}\n\n📲 You'll get an SMS when payment is received.\n\nNeed more help? Reply: HELP`;
  }

  // VIEW STATUS / PROFILE
  if (msg === 'status' || msg === 'profile' || msg === 'info') {
    if (!session.isRegistered || !session.workerData) {
      return `❌ You're not registered yet.\n\n📝 Type *REGISTER* to get started in 4 steps.\n\nOnce registered, use:\n• *POLICY* - View insurance\n• *CLAIM* - File a claim\n• *STATUS* - See your profile (after registration)`;
    }

    const claimsCount = (session.claims || []).length;
    const totalPayouts = session.claims.reduce((sum, c) => sum + (c.payout || 0), 0);
    const policy = (session.policies || [])[0];

    return `📊 *Your Profile & Status*\n\n*Worker Info:*\n👤 Name: ${session.workerData.name}\n🆔 ID: ${session.workerId}\n📱 Phone: ${senderPhone}\n📍 Zone: ${session.workerData.zone}\n🚗 Platform: ${session.workerData.platform}\n⏰ Hours/Week: ${session.workerData.weeklyHours}\n✅ Status: ACTIVE\n\n*Insurance Status:*\n✅ Coverage: ACTIVE\n💵 Premium: ₹${policy.premium}/week\n🎯 Coverage Limit: ₹${policy.coverageLimit.toLocaleString('en-IN')}\n📅 Valid Till: ${policy.weekEnd}\n\n*Claims & Payouts:*\n📋 Total Claims: ${claimsCount}\n💰 Total Payouts: ₹${totalPayouts.toLocaleString('en-IN')}\n\n📲 Everything looks good!\n\nWhat next?\n• *CLAIM* - File a new claim\n• *POLICY* - View insurance details\n• *HELP* - Full menu`;
  }

  // REPORT ISSUE
  if (msg === 'report' || msg.includes('issue') || msg.includes('problem')) {
    session.reportStep = 'issue_type';
    return `🚨 *Report an Issue*\n\nWhat's the problem?\n\n1. Payment Not Received\n2. Policy Question\n3. Claim Dispute\n4. Safety Concern\n5. Other\n\nReply with number (1-5):`;
  }

  if (session.reportStep === 'issue_type') {
    if (!session.reportData) session.reportData = {};
    const issueTypes = ['Payment Not Received', 'Policy Question', 'Claim Dispute', 'Safety Concern', 'Other'];
    const issueNum = parseInt(message.trim());

    if (issueNum < 1 || issueNum > issueTypes.length) {
      return `❌ Invalid option. Reply 1-5.`;
    }

    session.reportData.issueType = issueTypes[issueNum - 1];
    session.reportStep = 'issue_desc';
    return `Got it. Now, please describe the issue:\n\n(Example: My payment for claim C001 hasn't been received)`;
  }

  if (session.reportStep === 'issue_desc') {
    if (!session.reportData) session.reportData = {};
    session.reportStep = null;
    return `✅ *Report Received*\n\n📋 Issue: ${session.reportData.issueType}\n📝 Description: ${message}\n👤 Worker: ${session.workerData.name}\n📱 Phone: ${senderPhone}\n\n⏰ Our team will respond within 24 hours.\n✉️ We'll message you as soon as possible.\n\nThank you for reporting this issue!\n\n💬 Need anything else? Reply: HELP`;
  }

  // HELP / MENU
  if (msg === 'help' || msg === 'menu' || msg === 'guide') {
    return `👋 *SAIS Help Menu*\n\n*Your Account:*\n📋 *POLICY* - View insurance plan & premium\n📊 *STATUS* - See your profile & claims\n\n*Claims & Payments:*\n💰 *CLAIM* - File a new claim\n📲 Type CLAIM to get started\n⏱️ Payouts processed in 2-4 hours\n\n*Support:*\n🚨 *REPORT* - Report an issue\n❓ *HELP* - This menu\n\n*Commands:*\nREGISTER | POLICY | CLAIM | STATUS | REPORT | HELP\n\n💡 *Pro Tip:* Just type the command and follow the steps!`;
  }

  // DEFAULT - Show quick menu
  if (session.isRegistered && session.workerData) {
    return `👋 Hi ${session.workerData.name}!\n\nWhat would you like?\n\n📋 *POLICY* - View insurance\n💰 *CLAIM* - File a claim  \n📊 *STATUS* - Your profile\n🚨 *REPORT* - Report issue\n💬 *HELP* - Full menu\n\nJust type the keyword!`;
  } else {
    return `👋 Hello! Welcome to SAIS Insurance.\n\n*Quick Start:*\n📝 Type *REGISTER* to get insured in 4 steps\n💬 Type *HELP* for all options\n\n*Already registered?*\nIf you registered before, just type a command:\n📋 POLICY | 💰 CLAIM | 📊 STATUS | 🚨 REPORT`;
  }
}


// Function to send WhatsApp message via Twilio
function sendWhatsAppMessage(phoneNumber, message) {
  console.log(`\n📤 ATTEMPTING TO SEND MESSAGE`);
  console.log(`To Number (raw): "${phoneNumber}"`);
  console.log(`Message: "${message.substring(0, 80)}..."`);
  
  if (!twilioAccountSid || !twilioAuthToken) {
    console.error('❌ TWILIO NOT CONFIGURED - Cannot send message');
    return;
  }

  // Ensure phone number is clean (no "whatsapp:" prefix)
  let cleanNumber = phoneNumber;
  if (cleanNumber.startsWith('whatsapp:')) {
    cleanNumber = cleanNumber.replace('whatsapp:', '');
  }
  cleanNumber = cleanNumber.trim();

  // Add "whatsapp:" prefix for Twilio API
  const toNumber = `whatsapp:${cleanNumber}`;

  console.log(`To Number (formatted for Twilio): "${toNumber}"`);
  console.log(`From Number: "${twilioWhatsappNumber}"`);

  twiliClient.messages
    .create({
      from: twilioWhatsappNumber,
      to: toNumber,
      body: message
    })
    .then(msg => {
      console.log(`✅ MESSAGE SENT SUCCESSFULLY`);
      console.log(`   To: ${toNumber}`);
      console.log(`   Message SID: ${msg.sid}`);
      console.log(`   Status: ${msg.status}`);
    })
    .catch(err => {
      console.error(`❌ FAILED TO SEND MESSAGE`);
      console.error(`   Phone: ${toNumber}`);
      console.error(`   Error Code: ${err.code || 'UNKNOWN'}`);
      console.error(`   Error Message: ${err.message}`);
      console.error(`   Full Error:`, err);
      
      // Common Twilio errors
      if (err.code === 21614) {
        console.error(`   ⚠️ NOT_WHATSAPP_CAPABLE - Phone number not in WhatsApp sandbox`);
        console.error(`   💡 Solution: ${cleanNumber} needs to join the Twilio sandbox first`);
      } else if (err.code === 21608) {
        console.error(`   ⚠️ INVALID_PHONE_NUMBER - Malformed phone number`);
      } else if (err.code === 21201) {
        console.error(`   ⚠️ INVALID_PHONE_NUMBER_FORMAT`);
      }
    });
}

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ BACKEND SERVER STARTED`);
  console.log(`${'='.repeat(70)}`);
  console.log(`\n📍 SERVER INFO:`);
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: http://localhost:${PORT}`);
  console.log(`   Node Version: ${process.version}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  
  console.log(`\n🔐 TWILIO CONFIGURATION:`);
  if (twilioAccountSid && twilioAuthToken) {
    const maskedSid = twilioAccountSid.substring(0, 5) + '...' + twilioAccountSid.substring(twilioAccountSid.length - 3);
    const maskedToken = twilioAuthToken.substring(0, 5) + '...' + twilioAuthToken.substring(twilioAuthToken.length - 3);
    console.log(`   ✅ Account SID: ${maskedSid}`);
    console.log(`   ✅ Auth Token: ${maskedToken}`);
    console.log(`   ✅ WhatsApp Number: ${twilioWhatsappNumber}`);
    console.log(`   ✅ WhatsApp Integration: ACTIVE`);
  } else {
    console.log(`   ❌ Account SID: NOT CONFIGURED`);
    console.log(`   ❌ Auth Token: NOT CONFIGURED`);
    console.log(`   ❌ WhatsApp Integration: DISABLED`);
  }
  
  console.log(`\n📡 WEBHOOK ENDPOINTS:`);
  console.log(`   GET:  http://localhost:${PORT}/api/whatsapp/webhook`);
  console.log(`   POST: http://localhost:${PORT}/api/whatsapp/webhook`);
  console.log(`   TEST: http://localhost:${PORT}/api/health`);
  
  console.log(`\n🎯 NGROK TUNNEL:`);
  console.log(`   Public URL: ${process.env.WEBHOOK_URL || 'NOT CONFIGURED'}`);
  
  console.log(`\n⚠️  SETUP CHECKLIST:`);
  console.log(`   ✓ Backend running: YES`);
  console.log(`   ? Twilio sandbox configured: CHECK TWILIO CONSOLE`);
  console.log(`   ? Webhook URL in Twilio: ${process.env.WEBHOOK_URL || 'NOT SET'}`);
  console.log(`   ? ngrok running: CHECK NGROK TERMINAL`);
  console.log(`   ? Users joined sandbox: CHECK TWILIO MESSAGES`);
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎯 Ready to receive WhatsApp messages!`);
  console.log(`${'='.repeat(70)}\n`);
});
