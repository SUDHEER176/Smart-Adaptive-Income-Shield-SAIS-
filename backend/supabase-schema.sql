-- Create tables for SAIS (Smart Agriculture Insurance System)

-- 1. Workers table - stores worker registration info
CREATE TABLE IF NOT EXISTS workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  worker_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  zone VARCHAR(100) NOT NULL,
  platform VARCHAR(100) NOT NULL,
  working_hours INTEGER NOT NULL,
  upi_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Policies table - stores insurance policies
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id VARCHAR(50) UNIQUE NOT NULL,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  zone VARCHAR(100) NOT NULL,
  premium DECIMAL(10, 2) NOT NULL,
  coverage_amount DECIMAL(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  issue_date TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Claims table - stores filed claims
CREATE TABLE IF NOT EXISTS claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id VARCHAR(50) UNIQUE NOT NULL,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  policy_id UUID REFERENCES policies(id),
  claim_type VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  fraud_score DECIMAL(3, 2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  upi_id VARCHAR(100),
  filed_date TIMESTAMP DEFAULT NOW(),
  approval_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Payouts table - stores approved payouts
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id VARCHAR(50) UNIQUE NOT NULL,
  claim_id UUID NOT NULL REFERENCES claims(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  upi_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  processed_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Registrations table - tracks bot interactions
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  step_completed VARCHAR(100) NOT NULL,
  registration_data JSONB,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. Frames/Triggers table - for fraud detection triggers
CREATE TABLE IF NOT EXISTS triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id VARCHAR(50) UNIQUE NOT NULL,
  claim_id UUID REFERENCES claims(id) ON DELETE CASCADE,
  trigger_type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_workers_phone ON workers(phone_number);
CREATE INDEX IF NOT EXISTS idx_workers_worker_id ON workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_policies_worker_id ON policies(worker_id);
CREATE INDEX IF NOT EXISTS idx_claims_worker_id ON claims(worker_id);
CREATE INDEX IF NOT EXISTS idx_claims_policy_id ON claims(policy_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_payouts_worker_id ON payouts(worker_id);
CREATE INDEX IF NOT EXISTS idx_payouts_claim_id ON payouts(claim_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_registrations_phone ON registrations(phone_number);
CREATE INDEX IF NOT EXISTS idx_triggers_claim_id ON triggers(claim_id);

-- Enable Row Level Security (RLS)
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (everyone can read)
CREATE POLICY "Enable read access for all users" ON workers FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON policies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON claims FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON payouts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON registrations FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON triggers FOR SELECT USING (true);

-- Policies for insert (backend only)
CREATE POLICY "Enable insert for backend" ON workers FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for backend" ON policies FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for backend" ON claims FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for backend" ON payouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for backend" ON registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert for backend" ON triggers FOR INSERT WITH CHECK (true);

-- Policies for update (backend only)
CREATE POLICY "Enable update for backend" ON workers FOR UPDATE USING (true);
CREATE POLICY "Enable update for backend" ON policies FOR UPDATE USING (true);
CREATE POLICY "Enable update for backend" ON claims FOR UPDATE USING (true);
CREATE POLICY "Enable update for backend" ON payouts FOR UPDATE USING (true);
CREATE POLICY "Enable update for backend" ON registrations FOR UPDATE USING (true);
CREATE POLICY "Enable update for backend" ON triggers FOR UPDATE USING (true);
