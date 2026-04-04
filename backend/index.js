const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const twilio = require('twilio');
const { calculatePremium, getCoverageLimit, getValidityPeriod } = require('./lib/premium-calculator');
const userManager = require('./lib/user-manager');
const db = require('./lib/supabase');

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

// ============ ZONE REFERENCE DATA ============
// Static reference data (not persisted in Supabase)
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

// Trigger types (reference data)
const triggers = [
  { id: 'T001', type: 'Heavy Rain', zone: 'Vijayawada Central', severity: 'High', affectedWorkers: 124, startTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(), verified: true },
  { id: 'T002', type: 'High Pollution', zone: 'Delhi NCR - Sector 18', severity: 'Critical', affectedWorkers: 850, startTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(), verified: true },
  { id: 'T003', type: 'Extreme Heat', zone: 'Hyderabad - Gachibowli', severity: 'Medium', affectedWorkers: 342, startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), verified: false },
  { id: 'T004', type: 'Low Demand', zone: 'Mumbai - Andheri East', severity: 'Low', affectedWorkers: 215, startTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), verified: true },
  { id: 'T005', type: 'Heavy Rain', zone: 'Chennai - T Nagar', severity: 'Medium', affectedWorkers: 180, startTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(), endTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(), verified: true },
];

// ============ DASHBOARD STATS ============
async function calculateDashboardStats() {
  try {
    const dashboardStats = await db.calculateDashboardStats();
    return dashboardStats;
  } catch (error) {
    console.error('Error calculating dashboard stats:', error.message);
    return {
      totalWorkers: 0,
      activeWorkers: 0,
      coveredWorkers: 0,
      totalPremiumsCollected: 0,
      totalPayoutsProcessed: 0,
      activeTriggers: triggers.length,
      claimsToday: 0,
      fraudDetected: 0,
      avgProcessingTime: '4.2 mins',
      weeklyGrowth: 0
    };
  }
}

// ============ API ENDPOINTS ============

// Dashboard stats
app.get('/api/stats', async (req, res) => {
  const stats = await calculateDashboardStats();
  res.json(stats);
});

// Workers
app.get('/api/workers', async (req, res) => {
  const workers = await db.getAllWorkers();
  res.json(workers);
});

// Zones
app.get('/api/zones', (req, res) => {
  res.json(zones);
});

// Claims
app.get('/api/claims', async (req, res) => {
  const claims = await db.getAllClaims();
  res.json(claims);
});

// Payouts
app.get('/api/payouts', async (req, res) => {
  const payouts = await db.getAllPayouts();
  res.json(payouts);
});

// Registrations
app.get('/api/registrations', async (req, res) => {
  const registrations = await db.getAllRegistrations();
  res.json({
    completed: registrations,
    all: registrations
  });
});

// ============ REGISTRATION ENDPOINTS ============
app.post('/api/register', async (req, res) => {
  const { name, phone, zone, platform, weeklyHours = 40, upiId } = req.body;
  
  if (!name || !phone || !zone || !platform) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log('📝 REGISTRATION REQUEST:', req.body);

  try {
    // Check if worker already exists
    const existing = await db.getWorkerByPhone(phone);
    if (existing) {
      console.log('⚠️ Worker already exists:', existing.worker_id);
      return res.status(409).json({ error: 'Worker already registered', workerId: existing.worker_id });
    }

    // Create worker
    const workerId = `W${Date.now()}`;
    console.log('🛠 Creating worker...');
    const worker = await db.createWorker(phone, workerId, name, zone, platform, weeklyHours, upiId);

    if (!worker) {
      console.error('❌ FAILED TO CREATE WORKER');
      return res.status(500).json({ error: 'Failed to create worker' });
    }

    // Create policy
    console.log('🛠 Creating policy...');
    const zoneData = zones.find(z => z.name === zone);
    const premiumData = calculatePremium({ weeklyHours }, zoneData || zones[0], []);
    const coverageData = getCoverageLimit(premiumData.totalPremium, { weeklyHours }, zoneData || zones[0]);
    
    const policyId = `POL${Date.now()}`;
    const policy = await db.createPolicy(
      policyId,
      phone,
      zone,
      premiumData.totalPremium,
      coverageData.coverageLimit
    );

    if (!policy) {
      console.warn('⚠️ WORKER CREATED BUT POLICY FAILED');
    }

    // Record registration
    console.log('🛠 Recording registration...');
    await db.createRegistration(phone, 'completed', {
      name,
      zone,
      platform,
      weeklyHours,
      upiId
    });

    console.log('✅ REGISTRATION SUCCESSFUL');
    res.json({
      success: true,
      worker,
      policy
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ error: 'Registration failed', detail: error.message });
  }
});

// ============ POLICY ENDPOINTS ============
app.get('/api/policies', async (req, res) => {
  const policies = await db.getAllPolicies();
  res.json(policies);
});

// ============ CLAIMS ENDPOINTS ============
app.post('/api/claims/submit', async (req, res) => {
  const { workerId, triggerType, incomeLoss, upiId } = req.body;
  
  if (!workerId || !triggerType || !incomeLoss || !upiId) {
    return res.status(400).json({ error: 'Missing required fields (need: workerId, triggerType, incomeLoss, upiId)' });
  }

  try {
    const payout = Math.round(incomeLoss * 0.8);
    const claimId = `C${Date.now()}`;
    
    // Create claim in Supabase
    const claim = await db.createClaim(
      claimId,
      workerId,
      triggerType,
      `Income loss from ${triggerType}`,
      incomeLoss,
      upiId
    );

    if (!claim) {
      return res.status(500).json({ error: 'Failed to create claim' });
    }

    // Auto-approve and create payout
    const approvedClaim = await db.approveClaim(claimId, payout);
    const payouts = await db.getAllPayouts();
    const relatedPayout = payouts.find(p => p.claim_id === claim.id);

    res.json({
      success: true,
      claim: approvedClaim,
      payout: relatedPayout
    });
  } catch (error) {
    console.error('Claim submission error:', error.message);
    res.status(500).json({ error: 'Claim submission failed', detail: error.message });
  }
});

// Real-time Stream Endpoint (SSE)
app.get('/api/stream', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'X-Accel-Buffering': 'no' // Disable proxy buffering
  });
  res.flushHeaders();

  const sendData = async () => {
    try {
      const [workers, claims, payouts, policies, registrations, dashboardStats] = await Promise.all([
        db.getAllWorkers(),
        db.getAllClaims(),
        db.getAllPayouts(),
        db.getAllPolicies(),
        db.getAllRegistrations(),
        db.calculateDashboardStats()
      ]);

      const packet = {
        dashboardStats,
        workers,
        zones,
        claims,
        triggers,
        payouts,
        policies,
        registrations,
        fraudAlerts: claims.filter(c => c.fraud_score > 0.5)
      };
      
      res.write(`data: ${JSON.stringify(packet)}\n\n`);
    } catch (error) {
      console.error('SSE error:', error.message);
    }
  };

  const interval = setInterval(sendData, 3000);
  
  // Ping interval to keep connection alive
  const pingInterval = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  sendData();

  req.on('close', () => {
    clearInterval(interval);
    clearInterval(pingInterval);
    res.end();
  });
});

app.post('/api/claims/score', async (req, res) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/score`, req.body);
    res.json(response.data);
  } catch (error) {
    console.error('ML service error:', error.message);
    res.status(500).json({ error: 'Failed to score claim', detail: error.message });
  }
});

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    server: 'Backend running',
    timestamp: new Date().toISOString(),
    supabase: process.env.SUPABASE_URL ? 'configured' : 'not configured',
    whatsapp: twilioAccountSid ? 'configured' : 'not configured',
    sessions: Array.from(userManager.userSessions.keys())
  });
});

app.get('/api/test-webhook', (req, res) => {
  console.log('\n🧪 WEBHOOK TEST RECEIVED');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  res.json({
    status: 'webhook working',
    message: 'Webhook is accessible and receiving requests',
    timestamp: new Date().toISOString()
  });
});

// ============ WhatsApp Integration (Twilio) ============
app.get('/api/whatsapp/webhook', (req, res) => {
  console.log('✓ WhatsApp webhook GET request - Health check successful');
  res.status(200).send('WhatsApp webhook is active and responding');
});

app.post('/api/whatsapp/webhook', async (req, res) => {
  const timestamp = new Date().toLocaleTimeString('en-IN');
  console.log('\n' + '='.repeat(70));
  console.log(`⏰ ${timestamp} - NEW WHATSAPP MESSAGE RECEIVED`);
  console.log('='.repeat(70));
  
  const incomingMessage = req.body.Body?.trim() || ''; 
  let senderNumber = req.body.From || '';
  const messageId = req.body.MessageSid || 'NO_MSG_ID';

  if (senderNumber.startsWith('whatsapp:')) {
    senderNumber = senderNumber.replace('whatsapp:', '');
  }
  senderNumber = senderNumber.trim();

  let uniqueUserId = senderNumber;
  if (senderNumber === '+1' || senderNumber === '1' || senderNumber === '+') {
    uniqueUserId = messageId.substring(0, 10);
    console.log(`⚠️  TWILIO SANDBOX MODE - Using MessageSid: ${uniqueUserId}`);
  }

  console.log(`📱 Message: "${incomingMessage}"`);
  console.log(`👤 From: ${uniqueUserId}`);

  let botResponse;
  try {
    botResponse = await generateBotResponse(incomingMessage, uniqueUserId);
    console.log(`✅ Response generated for ${uniqueUserId}`);
  } catch (error) {
    console.error(`❌ BOT PROCESSING ERROR:`, error.message);
    botResponse = `❌ Sorry, there was an error processing your message. Please try again.`;
  }

  // Create TwiML response
  const MessagingResponse = require('twilio').twiml.MessagingResponse;
  const twiml = new MessagingResponse();
  twiml.message(botResponse);

  console.log(`📤 Sending TwiML Response to ${uniqueUserId}`);
  console.log('='.repeat(70) + '\n');
  
  res.type('text/xml').send(twiml.toString());
});

// ============ CHATBOT SYSTEM ============
async function generateBotResponse(message, senderPhone) {
  const msg = message.trim().toLowerCase();
  const session = userManager.getOrCreateSession(senderPhone);

  console.log(`📱 Message from ${senderPhone}: "${message}"`);
  console.log(`👤 Registered: ${session.isRegistered}, Worker: ${session.workerId}`);

  // ========== REGISTRATION ==========
  if (msg === 'register' || msg === 'registration' || msg === 'signup' || msg === 'new') {
    if (session.isRegistered) {
      return `✅ You're already registered!\n\n👤 Worker ID: ${session.workerId}\n📝 Name: ${session.workerData.name}\n📍 Zone: ${session.workerData.zone}\n\nNeed help? Type: POLICY, CLAIM, or HELP`;
    }

    session.registrationStep = 'step1_name';
    return `📝 *Welcome to SAIS Registration!*\n\nLet's get you registered in 4 easy steps.\n\n*Step 1 of 4:* What's your full name?\n\nExample: Raj Kumar`;
  }

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
    const platformInput = message.trim();
    const platformNum = parseInt(platformInput);
    let selectedPlatform;

    if (!isNaN(platformNum) && platformNum >= 1 && platformNum <= platforms.length) {
      selectedPlatform = platforms[platformNum - 1];
    } else {
      // Try searching by name
      selectedPlatform = platforms.find(p => p.toLowerCase() === platformInput.toLowerCase());
    }

    if (!selectedPlatform) {
      return `❌ Invalid platform. Please reply with a number (1-6) or the platform name from the list.`;
    }

    session.registrationData.platform = selectedPlatform;
    session.registrationStep = 'step4_hours';
    return `✅ ${selectedPlatform} it is!\n\n*Step 4 of 5:* How many hours do you work per week?\n\nExample: 40`;
  }

  if (session.registrationStep === 'step4_hours') {
    if (!session.registrationData) session.registrationData = {};
    const hours = parseInt(message.trim());

    if (isNaN(hours) || hours < 1 || hours > 168) {
      return `❌ Please enter a valid number between 1-168 hours.`;
    }

    session.registrationData.weeklyHours = hours;
    session.registrationStep = 'step5_upi';
    return `✅ Got it! ${hours} hours/week.\n\n*Step 5 of 5:* What is your UPI ID for receiving payments?\n\nExample: yourname@googleplay`;
  }

  if (session.registrationStep === 'step5_upi') {
    if (!session.registrationData) session.registrationData = {};
    const upiId = message.trim();

    if (!upiId.includes('@') || upiId.length < 5) {
      return `❌ Invalid UPI ID. Please enter a valid UPI ID.\n\nExample: yourname@googleplay`;
    }

    session.registrationData.upiId = upiId;

    session.registrationData.upiId = upiId;

    // INTERNAL REGISTRATION CALL (Direct DB access to avoid network loops)
    try {
      console.log('📝 BOT SIGNUP: Internal DB call for', senderPhone);
      
      const zoneData = zones.find(z => z.name === session.registrationData.zone);
      const workerId = `W${Date.now()}`;
      
      // 1. Create worker
      const worker = await db.createWorker(
        senderPhone, 
        workerId, 
        session.registrationData.name, 
        session.registrationData.zone, 
        session.registrationData.platform, 
        session.registrationData.weeklyHours, 
        session.registrationData.upiId
      );

      // 2. Create policy
      const premiumData = calculatePremium({ weeklyHours: session.registrationData.weeklyHours }, zoneData || zones[0], []);
      const coverageData = getCoverageLimit(premiumData.totalPremium, { weeklyHours: session.registrationData.weeklyHours }, zoneData || zones[0]);
      
      await db.createPolicy(
        `POL${Date.now()}`,
        senderPhone,
        session.registrationData.zone,
        premiumData.totalPremium,
        coverageData.coverageLimit
      );

      // 3. Record registration
      await db.createRegistration(senderPhone, 'completed', {
        name: session.registrationData.name,
        zone: session.registrationData.zone,
        platform: session.registrationData.platform,
        weeklyHours: session.registrationData.weeklyHours,
        upiId: session.registrationData.upiId
      });

      // Update session
      session.workerId = workerId;
      session.isRegistered = true;
      session.workerData = { ...session.registrationData };
      session.registrationStep = null;
      session.registrationData = {};

      return `🎉 *Registration Complete!*\n\n✅ Welcome, ${session.workerData.name}!\n\n*Your Details:*\n🆔 Worker ID: ${session.workerId}\n📍 Zone: ${session.workerData.zone}\n🚗 Platform: ${session.workerData.platform}\n⏰ Hours: ${session.workerData.weeklyHours}/week\n💳 UPI ID: ${session.workerData.upiId}\n\n🛡️ Coverage active immediately\n\nYou're all set! Use these commands:\n📋 POLICY | 💰 CLAIM | 📊 STATUS | 💬 HELP`;
    } catch (err) {
      console.error('❌ Error during internal BOT registration:', err.message);
      return `❌ *Registration Failed*\n\nSorry, we couldn't save your data. Error: ${err.message}\n\nPlease try again by typing *REGISTER*.`;
    }
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
    return `🛡️ *Your Insurance Policy*\n\n*Status:* ACTIVE ✅\n*Coverage:* ₹50,000\n*Premium:* ₹50-200/week (based on your profile)\n📅 *Valid:* This week and auto-renews\n\n💡 Your premium is calculated based on:\n• Your working hours\n• Your zone's risk level\n• Your claim history\n• Your delivery platform\n\nNeed to file a claim? Reply: *CLAIM*`;
  }

  // FILE CLAIM
  if (msg === 'claim' || msg.includes('file claim') || msg.includes('claim help')) {
    session.claimStep = 'select_trigger';
    const triggerList = ['1. Heavy Rain', '2. High Pollution', '3. Extreme Heat', '4. Low Demand', '5. Other'];
    return `💰 *File a New Claim*\n\nWhat triggered your income loss?\n\n${triggerList.join('\n')}\n\nReply with the number. (Example: 1)`;
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

  // Handle claim income loss
  if (session.claimStep === 'enter_income_loss') {
    if (!session.claimData) session.claimData = {};
    const incomeLoss = parseInt(message.trim());

    if (isNaN(incomeLoss) || incomeLoss < 0) {
      return `❌ Please enter a valid amount.`;
    }

    session.claimData.incomeLoss = incomeLoss;
    session.claimStep = 'enter_upi';
    return `✅ Income loss: ₹${incomeLoss}\n\n*Step 3:* What's your UPI ID for payment?\n\nExample: yourname@googleplay\nor yourname@paytm`;
  }

  // ========== NEW: COLLECT UPI ID ==========
  if (session.claimStep === 'enter_upi') {
    if (!session.claimData) session.claimData = {};
    const upiId = message.trim();

    // Basic UPI validation
    if (!upiId.includes('@') || upiId.length < 5) {
      return `❌ Invalid UPI ID. Please enter a valid UPI ID.\n\nExample: yourname@googleplay`;
    }

    session.claimData.upiId = upiId;

    // Capture data before resetting session
    const triggerType = session.claimData.triggerType;
    const incomeLoss = session.claimData.incomeLoss;
    const payout = Math.round(incomeLoss * 0.8);
    const claimId = `C${Date.now()}`;

    // INTERNAL CLAIM SUBMISSION
    try {
      const payout = Math.round(incomeLoss * 0.8);
      const claimId = `C${Date.now()}`;

      await db.createClaim(
        claimId,
        senderPhone,
        triggerType,
        `Income loss from ${triggerType}`,
        incomeLoss,
        upiId
      );

      // Auto-approve
      await db.approveClaim(claimId, payout);

      session.claimStep = null;
      session.claimData = {};
      session.claims = (session.claims || []).concat([{ id: claimId, payout, upiId }]);

      return `✅ *Claim Filed Successfully!*\n\n*Claim Details:*\n🆔 Claim ID: ${claimId}\n📋 Trigger: ${triggerType}\n💰 Income Loss: ₹${incomeLoss}\n💸 Payout (80%): ₹${payout}\n✅ Status: AUTO-APPROVED\n\n*Payment Details:*\n💵 Amount: ₹${payout}\n📱 UPI: ${upiId}\n⏱️ Status: PROCESSING\n⏳ Expected in: 2-4 hours\n\nYou'll get an SMS when payment is received.\n\nNeed more help? Reply: HELP`;
    } catch (err) {
      console.error('❌ Error during internal BOT claim:', err.message);
      return `❌ *Claim Submission Failed*\n\nError: ${err.message}\n\nPlease try again by typing *CLAIM*.`;
    }
  }

  // VIEW STATUS
  if (msg === 'status' || msg === 'profile' || msg === 'info') {
    if (!session.isRegistered || !session.workerData) {
      return `❌ You're not registered yet.\n\n📝 Type *REGISTER* to get started.`;
    }

    const claimsCount = (session.claims || []).length;
    const totalPayouts = session.claims.reduce((sum, c) => sum + (c.payout || 0), 0);

    return `📊 *Your Profile & Status*\n\n*Worker Info:*\n👤 Name: ${session.workerData.name}\n🆔 ID: ${session.workerId}\n📱 Phone: ${senderPhone}\n📍 Zone: ${session.workerData.zone}\n🚗 Platform: ${session.workerData.platform}\n⏰ Hours/Week: ${session.workerData.weeklyHours}\n✅ Status: ACTIVE\n\n*Insurance Status:*\n✅ Coverage: ACTIVE\n💵 Premium: ₹50-200/week\n📅 Valid Till: This week (auto-renews)\n\n*Claims & Payouts:*\n📋 Total Claims: ${claimsCount}\n💰 Total Payouts: ₹${totalPayouts.toLocaleString('en-IN')}\n\n📲 Everything looks good!\n\nReply: *CLAIM* for new claim or *HELP* for menu`;
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
    return `Got it. Now describe the issue:\n\n(Example: My payment for claim C001 hasn't been received)`;
  }

  if (session.reportStep === 'issue_desc') {
    if (!session.reportData) session.reportData = {};
    session.reportStep = null;
    return `✅ *Report Received*\n\n📋 Issue: ${session.reportData.issueType}\n📝 Description: ${message}\n👤 Worker: ${session.workerData.name}\n\n⏰ Our team will respond within 24 hours.\n\nThank you for reporting!`;
  }

  // HELP
  if (msg === 'help' || msg === 'menu' || msg === 'guide') {
    return `👋 *SAIS Help Menu*\n\n*Your Account:*\n📋 *POLICY* - View insurance plan\n📊 *STATUS* - See your profile\n\n*Claims & Payments:*\n💰 *CLAIM* - File a new claim\n⏱️ Payouts in 2-4 hours via UPI\n\n*Support:*\n🚨 *REPORT* - Report an issue\n❓ *HELP* - This menu\n\n*Commands:*\nREGISTER | POLICY | CLAIM | STATUS | REPORT | HELP`;
  }

  // DEFAULT
  if (session.isRegistered && session.workerData) {
    return `👋 Hi ${session.workerData.name}!\n\nWhat would you like?\n\n📋 *POLICY* - View insurance\n💰 *CLAIM* - File a claim\n📊 *STATUS* - Your profile\n🚨 *REPORT* - Report issue\n💬 *HELP* - Full menu`;
  } else {
    return `👋 Welcome to SAIS!\n\n📝 *REGISTER* - Get insured in 4 steps\n💬 *HELP* - All options`;
  }
}

// Send WhatsApp message
function sendWhatsAppMessage(phoneNumber, message) {
  if (!twilioAccountSid || !twilioAuthToken) {
    console.error('❌ TWILIO NOT CONFIGURED');
    return;
  }

  let cleanNumber = phoneNumber;
  if (cleanNumber.startsWith('whatsapp:')) {
    cleanNumber = cleanNumber.replace('whatsapp:', '');
  }
  cleanNumber = cleanNumber.trim();

  const toNumber = `whatsapp:${cleanNumber}`;

  twiliClient.messages
    .create({
      from: twilioWhatsappNumber,
      to: toNumber,
      body: message
    })
    .then(msg => {
      console.log(`✅ Message sent to ${toNumber}`);
    })
    .catch(err => {
      console.error(`❌ Failed to send message:`, err.message);
    });
}

// ============ SERVER START ============
app.listen(PORT, '0.0.0.0', () => {
  const RENDER_EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ BACKEND SERVER STARTED WITH SUPABASE`);
  console.log(`${'='.repeat(70)}`);
  console.log(`\n📍 SERVER INFO:`);
  console.log(`   Port: ${PORT}`);
  console.log(`   URL: ${RENDER_EXTERNAL_URL}`);
  
  console.log(`\n🔐 INTEGRATIONS:`);
  console.log(`   ✅ Supabase: ${process.env.SUPABASE_URL ? 'CONFIGURED' : 'NOT SET'}`);
  console.log(`   ✅ Twilio WhatsApp: ${twilioAccountSid ? 'CONFIGURED' : 'NOT SET'}`);
  console.log(`   ✅ ML Service: ${ML_SERVICE_URL}`);
  
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🎯 Ready to receive WhatsApp messages!\n`);
  console.log(`💾 All data stored in Supabase`);
  console.log(`🤖 Bot collects UPI during claims\n`);
  console.log(`${'='.repeat(70)}\n`);
});
