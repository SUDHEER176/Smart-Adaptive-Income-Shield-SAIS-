-- Supabase PostgreSQL Schema for GigShield AI+
-- Run these SQL commands in your Supabase SQL Editor

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  phone varchar(20),
  password varchar(255) NOT NULL,
  city varchar(100) NOT NULL,
  job_type varchar(50) CHECK (job_type IN ('Delivery', 'Driver', 'Other')),
  behavior_score integer DEFAULT 85 CHECK (behavior_score >= 0 AND behavior_score <= 100),
  points integer DEFAULT 0,
  total_claims integer DEFAULT 0,
  fraud_risk boolean DEFAULT false,
  created_at timestamp DEFAULT current_timestamp,
  updated_at timestamp DEFAULT current_timestamp
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Policies Table
CREATE TABLE IF NOT EXISTS policies (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  weekly_plan boolean DEFAULT false,
  time_slots text[] DEFAULT '{}',
  premium decimal(10, 2) NOT NULL,
  start_date timestamp NOT NULL,
  end_date timestamp NOT NULL,
  is_active boolean DEFAULT true,
  coverage decimal(10, 2) NOT NULL,
  created_at timestamp DEFAULT current_timestamp
);

-- Create index on user_id for faster lookups
CREATE INDEX idx_policies_user_id ON policies(user_id);

-- Claims Table
CREATE TABLE IF NOT EXISTS claims (
  id serial PRIMARY KEY,
  user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  policy_id integer NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  loss decimal(10, 2) NOT NULL,
  payout decimal(10, 2) NOT NULL,
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
  reason text,
  weather_condition varchar(100),
  timestamp timestamp DEFAULT current_timestamp,
  fraud_check boolean DEFAULT false,
  created_at timestamp DEFAULT current_timestamp
);

-- Create indexes for claims
CREATE INDEX idx_claims_user_id ON claims(user_id);
CREATE INDEX idx_claims_policy_id ON claims(policy_id);

-- Groups Table
CREATE TABLE IF NOT EXISTS groups (
  id serial PRIMARY KEY,
  name varchar(255) NOT NULL,
  area varchar(100) NOT NULL,
  creator_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  members integer[] DEFAULT '{}',
  total_pool decimal(10, 2) DEFAULT 0,
  coverage decimal(10, 2) NOT NULL,
  join_code varchar(50) UNIQUE,
  created_at timestamp DEFAULT current_timestamp
);

-- Loss Analytics Table
CREATE TABLE IF NOT EXISTS loss_analytics (
  id serial PRIMARY KEY,
  city varchar(100) NOT NULL,
  time varchar(50) CHECK (time IN ('morning', 'afternoon', 'evening')),
  weather varchar(100),
  loss decimal(10, 2) NOT NULL,
  frequency integer DEFAULT 1,
  date timestamp DEFAULT current_timestamp
);

-- Create index on city and time for faster analytics queries
CREATE INDEX idx_loss_analytics_city_time ON loss_analytics(city, time);
