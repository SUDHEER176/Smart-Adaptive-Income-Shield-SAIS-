// Supabase Database Helper
const { createClient } = require('@supabase/supabase-js');

// Load from environment - will be set after dotenv.config() is called in index.js
let supabase = null;

function initializeSupabase() {
  if (supabase) return supabase; // Already initialized
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  }

  supabase = createClient(supabaseUrl, supabaseKey);
  return supabase;
}

// ==================== WORKERS ====================

async function createWorker(phoneNumber, workerId, name, zone, platform, workingHours, upiId = null) {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('workers')
      .insert([
        {
          phone_number: phoneNumber,
          worker_id: workerId,
          name,
          zone,
          platform,
          working_hours: workingHours,
          upi_id: upiId,
          status: 'active'
        }
      ])
      .select();

    if (error) {
      console.error('❌ Supabase error creating worker:', error);
      return null;
    }

    console.log('✅ Worker created:', workerId);
    return data[0];
  } catch (err) {
    console.error('❌ Exception creating worker:', err.message);
    return null;
  }
}

async function getWorkerByPhone(phoneNumber) {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('workers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error fetching worker:', error.message);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('❌ Exception fetching worker:', err.message);
    return null;
  }
}

async function getAllWorkers() {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('workers')
      .select('*')
      .eq('status', 'active');

    return (data || []).map(w => ({
      id: w.worker_id,
      name: w.name,
      phone: w.phone_number,
      zone: w.zone,
      platform: w.platform,
      status: w.status,
      avgIncome: 450, // Default for now as it's not and db
      weeklyHours: w.working_hours,
      riskScore: 0.45, // Default for now
      upiId: w.upi_id
    }));
  } catch (err) {
    console.error('❌ Exception fetching workers:', err.message);
    return [];
  }
}

async function updateWorkerUPI(workerId, upiId) {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('workers')
      .update({ upi_id: upiId })
      .eq('worker_id', workerId)
      .select();

    if (error) {
      console.error('❌ Error updating UPI:', error.message);
      return null;
    }

    return data[0];
  } catch (err) {
    console.error('❌ Exception updating UPI:', err.message);
    return null;
  }
}

// ==================== POLICIES ====================

async function createPolicy(policyId, workerId, zone, premium, coverageAmount) {
  try {
    const client = initializeSupabase();
    
    // Get worker's UUID
    const worker = await getWorkerByPhone(workerId);
    if (!worker) return null;

    const { data, error } = await client
      .from('policies')
      .insert([
        {
          policy_id: policyId,
          worker_id: worker.id,
          zone,
          premium,
          coverage_amount: coverageAmount,
          status: 'active'
        }
      ])
      .select();

    if (error) {
      console.error('❌ Supabase error creating policy:', error);
      return null;
    }

    console.log('✅ Policy created:', policyId);
    return data[0];
  } catch (err) {
    console.error('❌ Exception creating policy:', err.message);
    return null;
  }
}

async function getPoliciesByWorker(workerId) {
  try {
    const client = initializeSupabase();
    
    const worker = await getWorkerByPhone(workerId);
    if (!worker) return [];

    const { data, error } = await client
      .from('policies')
      .select('*')
      .eq('worker_id', worker.id);

    if (error) {
      console.error('❌ Error fetching policies:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching policies:', err.message);
    return [];
  }
}

async function getAllPolicies() {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('policies')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.error('❌ Error fetching all policies:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching all policies:', err.message);
    return [];
  }
}

// ==================== CLAIMS ====================

async function createClaim(claimId, phoneNumber, claimType, description, amount, upiId) {
  try {
    const client = initializeSupabase();
    
    const worker = await getWorkerByPhone(phoneNumber);
    if (!worker) {
      console.error('❌ Worker not found:', phoneNumber);
      return null;
    }

    // Get active policy for worker
    const policies = await getPoliciesByWorker(worker.phone_number);
    const policyId = policies.length > 0 ? policies[0].id : null;

    const { data, error } = await client
      .from('claims')
      .insert([
        {
          claim_id: claimId,
          worker_id: worker.id,
          policy_id: policyId,
          claim_type: claimType,
          description,
          amount,
          upi_id: upiId,
          status: 'pending',
          fraud_score: 0
        }
      ])
      .select();

    if (error) {
      console.error('❌ Supabase error creating claim:', error);
      return null;
    }

    console.log('✅ Claim created:', claimId);
    return data[0];
  } catch (err) {
    console.error('❌ Exception creating claim:', err.message);
    return null;
  }
}

async function getClaimsByWorker(phoneNumber) {
  try {
    const client = initializeSupabase();
    
    const worker = await getWorkerByPhone(phoneNumber);
    if (!worker) return [];

    const { data, error } = await client
      .from('claims')
      .select('*')
      .eq('worker_id', worker.id);

    if (error) {
      console.error('❌ Error fetching claims:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Exception fetching claims:', err.message);
    return [];
  }
}

async function getAllClaims() {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('claims')
      .select('*, workers(name, phone_number)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching all claims:', error.message);
      return [];
    }

    return (data || []).map(claim => ({
      ...claim,
      id: claim.claim_id,
      workerName: claim.workers?.name || 'Unknown',
      incomeLoss: claim.amount,
      payout: Math.round(claim.amount * 0.8),
      timestamp: claim.created_at,
      triggerType: claim.claim_type,
      fraudScore: claim.fraud_score || 0
    }));
  } catch (err) {
    console.error('❌ Exception fetching all claims:', err.message);
    return [];
  }
}

async function approveClaim(claimId, amount) {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('claims')
      .update({
        status: 'approved',
        approval_date: new Date().toISOString()
      })
      .eq('claim_id', claimId)
      .select();

    if (error) {
      console.error('❌ Error approving claim:', error.message);
      return null;
    }

    if (data.length === 0) return null;

    // Auto-create payout for approved claim
    const claim = data[0];
    const payoutId = `PAYOUT-${Date.now()}`;
    
    await createPayout(payoutId, claim.id, claim.worker_id, amount, claim.upi_id);

    return claim;
  } catch (err) {
    console.error('❌ Exception approving claim:', err.message);
    return null;
  }
}

// ==================== PAYOUTS ====================

async function createPayout(payoutId, claimId, workerId, amount, upiId) {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('payouts')
      .insert([
        {
          payout_id: payoutId,
          claim_id: claimId,
          worker_id: workerId,
          amount,
          upi_id: upiId,
          status: 'pending'
        }
      ])
      .select();

    if (error) {
      console.error('❌ Supabase error creating payout:', error);
      return null;
    }

    console.log('✅ Payout created:', payoutId);
    return data[0];
  } catch (err) {
    console.error('❌ Exception creating payout:', err.message);
    return null;
  }
}

async function getAllPayouts() {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('payouts')
      .select('*, workers(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching payouts:', error.message);
      return [];
    }

    return (data || []).map(payout => ({
      ...payout,
      id: payout.payout_id,
      workerName: payout.workers?.name || 'Unknown',
      claimId: payout.claim_id,
      timestamp: payout.created_at,
      upiId: payout.upi_id
    }));
  } catch (err) {
    console.error('❌ Exception fetching payouts:', err.message);
    return [];
  }
}

async function updatePayoutStatus(payoutId, status) {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('payouts')
      .update({
        status,
        processed_date: status === 'completed' ? new Date().toISOString() : null
      })
      .eq('payout_id', payoutId)
      .select();

    if (error) {
      console.error('❌ Error updating payout:', error.message);
      return null;
    }

    return data[0];
  } catch (err) {
    console.error('❌ Exception updating payout:', err.message);
    return null;
  }
}

// ==================== REGISTRATIONS ====================

async function createRegistration(phoneNumber, stepCompleted, registrationData) {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('registrations')
      .insert([
        {
          phone_number: phoneNumber,
          step_completed: stepCompleted,
          registration_data: registrationData,
          completed: stepCompleted === 'completed'
        }
      ])
      .select();

    if (error) {
      console.error('❌ Supabase error creating registration:', error);
      return null;
    }

    return data[0];
  } catch (err) {
    console.error('❌ Exception creating registration:', err.message);
    return null;
  }
}

async function getAllRegistrations() {
  try {
    const client = initializeSupabase();
    
    const { data, error } = await client
      .from('registrations')
      .select('*')
      .eq('completed', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching registrations:', error.message);
      return [];
    }

    return (data || []).map(r => ({
      id: `REG-${r.id}`,
      name: r.registration_data?.name || 'Incomplete',
      phone: r.phone_number,
      zone: r.registration_data?.zone || 'N/A',
      source: 'chatbot',
      completed: r.completed,
      upiId: r.registration_data?.upiId,
      timestamp: r.created_at
    }));
  } catch (err) {
    console.error('❌ Exception fetching registrations:', err.message);
    return [];
  }
}

// ==================== DASHBOARD STATS ====================

async function calculateDashboardStats() {
  try {
    const workers = await getAllWorkers();
    const claims = await getAllClaims();
    const payouts = await getAllPayouts();
    const policies = await getAllPolicies();

    const totalWorkers = workers.length;
    const activeWorkers = workers.filter(w => w.status === 'active').length;
    const coveredWorkers = policies.length;
    
    const totalPremiumsCollected = policies.reduce((sum, p) => 
      sum + (parseFloat(p.premium) || 0), 0);
    
    const totalPayoutsProcessed = payouts.reduce((sum, p) => 
      sum + (parseFloat(p.amount) || 0), 0);
    
    const fraudDetected = claims.filter(c => c.fraud_score > 0.5).length;
    
    const claimsToday = claims.filter(c => {
      const claimDate = new Date(c.filed_date);
      const today = new Date();
      return claimDate.toDateString() === today.toDateString();
    }).length;

    const activeTriggers = claims.filter(c => c.status === 'pending').length;

    return {
      totalWorkers,
      activeWorkers,
      coveredWorkers,
      totalPremiumsCollected: parseFloat(totalPremiumsCollected.toFixed(2)),
      totalPayoutsProcessed: parseFloat(totalPayoutsProcessed.toFixed(2)),
      activeTriggers,
      claimsToday,
      fraudDetected,
      avgProcessingTime: '4.2 mins',
      weeklyGrowth: 0
    };
  } catch (err) {
    console.error('❌ Exception calculating stats:', err.message);
    return {
      totalWorkers: 0,
      activeWorkers: 0,
      coveredWorkers: 0,
      totalPremiumsCollected: 0,
      totalPayoutsProcessed: 0,
      activeTriggers: 0,
      claimsToday: 0,
      fraudDetected: 0,
      avgProcessingTime: '0 mins',
      weeklyGrowth: 0
    };
  }
}

// Export all functions
module.exports = {
  initializeSupabase,
  // Workers
  createWorker,
  getWorkerByPhone,
  getAllWorkers,
  updateWorkerUPI,
  // Policies
  createPolicy,
  getPoliciesByWorker,
  getAllPolicies,
  // Claims
  createClaim,
  getClaimsByWorker,
  getAllClaims,
  approveClaim,
  // Payouts
  createPayout,
  getAllPayouts,
  updatePayoutStatus,
  // Registrations
  createRegistration,
  getAllRegistrations,
  // Stats
  calculateDashboardStats
};
