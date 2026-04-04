// Mock data for SAIS platform

export interface Worker {
  id: string
  name: string
  phone: string
  zone: string
  city: string
  platform: 'Swiggy' | 'Zomato' | 'Zepto' | 'Blinkit' | 'Dunzo'
  avgIncome: number
  weeklyHours: number
  riskScore: number
  status: 'active' | 'inactive' | 'covered'
  joinedDate: string
}

export interface Zone {
  id: string
  name: string
  city: string
  riskLevel: 'Low' | 'Medium' | 'High'
  riskScore: number
  activeWorkers: number
  avgAQI: number
  weatherCondition: 'Clear' | 'Rainy' | 'Extreme Heat' | 'Foggy'
  demandLevel: number
  coordinates: { lat: number; lng: number }
}

export interface Policy {
  id: string
  workerId: string
  workerName: string
  weekStart: string
  weekEnd: string
  premium: number
  coverageLimit: number
  status: 'active' | 'expired' | 'pending'
}

export interface Trigger {
  id: string
  zone: string
  type: 'Heavy Rain' | 'Extreme Heat' | 'High Pollution' | 'Traffic Disruption' | 'Low Demand' | 'Area Restriction'
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  startTime: string
  endTime: string | null
  verified: boolean
  affectedWorkers: number
}

export interface Claim {
  id: string
  workerId: string
  workerName: string
  triggerId: string
  triggerType: string
  incomeLoss: number
  payout: number
  fraudScore: number
  status: 'auto-approved' | 'under-review' | 'rejected' | 'paid'
  timestamp: string
}

export interface Payout {
  id: string
  claimId: string
  workerName: string
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  timestamp: string
  upiId: string
}

// Mock Workers
export const workers: Worker[] = [
  { id: 'W001', name: 'Ravi Kumar', phone: '+91 98765 43210', zone: 'Vijayawada Central', city: 'Vijayawada', platform: 'Swiggy', avgIncome: 850, weeklyHours: 42, riskScore: 0.45, status: 'covered', joinedDate: '2025-08-15' },
  { id: 'W002', name: 'Fatima Begum', phone: '+91 87654 32109', zone: 'Delhi NCR - Sector 18', city: 'Delhi', platform: 'Zepto', avgIncome: 720, weeklyHours: 38, riskScore: 0.72, status: 'covered', joinedDate: '2025-09-01' },
  { id: 'W003', name: 'Arjun Patel', phone: '+91 76543 21098', zone: 'Mumbai - Andheri East', city: 'Mumbai', platform: 'Blinkit', avgIncome: 920, weeklyHours: 45, riskScore: 0.68, status: 'active', joinedDate: '2025-07-20' },
  { id: 'W004', name: 'Priya Sharma', phone: '+91 65432 10987', zone: 'Bangalore - Koramangala', city: 'Bangalore', platform: 'Swiggy', avgIncome: 780, weeklyHours: 40, riskScore: 0.35, status: 'covered', joinedDate: '2025-10-05' },
  { id: 'W005', name: 'Mohammed Ali', phone: '+91 54321 09876', zone: 'Hyderabad - Gachibowli', city: 'Hyderabad', platform: 'Zomato', avgIncome: 810, weeklyHours: 44, riskScore: 0.52, status: 'covered', joinedDate: '2025-06-12' },
  { id: 'W006', name: 'Sneha Reddy', phone: '+91 43210 98765', zone: 'Chennai - T Nagar', city: 'Chennai', platform: 'Dunzo', avgIncome: 680, weeklyHours: 36, riskScore: 0.41, status: 'active', joinedDate: '2025-11-01' },
  { id: 'W007', name: 'Vikram Singh', phone: '+91 32109 87654', zone: 'Pune - Kothrud', city: 'Pune', platform: 'Swiggy', avgIncome: 750, weeklyHours: 39, riskScore: 0.38, status: 'covered', joinedDate: '2025-08-22' },
  { id: 'W008', name: 'Anita Devi', phone: '+91 21098 76543', zone: 'Kolkata - Salt Lake', city: 'Kolkata', platform: 'Zomato', avgIncome: 690, weeklyHours: 35, riskScore: 0.55, status: 'inactive', joinedDate: '2025-09-18' },
]

// Mock Zones
export const zones: Zone[] = [
  { id: 'Z001', name: 'Vijayawada Central', city: 'Vijayawada', riskLevel: 'Medium', riskScore: 0.52, activeWorkers: 145, avgAQI: 89, weatherCondition: 'Rainy', demandLevel: 72, coordinates: { lat: 16.5062, lng: 80.6480 } },
  { id: 'Z002', name: 'Delhi NCR - Sector 18', city: 'Delhi', riskLevel: 'High', riskScore: 0.78, activeWorkers: 312, avgAQI: 245, weatherCondition: 'Foggy', demandLevel: 65, coordinates: { lat: 28.5706, lng: 77.3232 } },
  { id: 'Z003', name: 'Mumbai - Andheri East', city: 'Mumbai', riskLevel: 'High', riskScore: 0.71, activeWorkers: 287, avgAQI: 156, weatherCondition: 'Rainy', demandLevel: 58, coordinates: { lat: 19.1197, lng: 72.8464 } },
  { id: 'Z004', name: 'Bangalore - Koramangala', city: 'Bangalore', riskLevel: 'Low', riskScore: 0.32, activeWorkers: 198, avgAQI: 68, weatherCondition: 'Clear', demandLevel: 85, coordinates: { lat: 12.9352, lng: 77.6245 } },
  { id: 'Z005', name: 'Hyderabad - Gachibowli', city: 'Hyderabad', riskLevel: 'Medium', riskScore: 0.48, activeWorkers: 176, avgAQI: 95, weatherCondition: 'Clear', demandLevel: 78, coordinates: { lat: 17.4401, lng: 78.3489 } },
  { id: 'Z006', name: 'Chennai - T Nagar', city: 'Chennai', riskLevel: 'Medium', riskScore: 0.55, activeWorkers: 165, avgAQI: 112, weatherCondition: 'Extreme Heat', demandLevel: 70, coordinates: { lat: 13.0418, lng: 80.2341 } },
  { id: 'Z007', name: 'Pune - Kothrud', city: 'Pune', riskLevel: 'Low', riskScore: 0.28, activeWorkers: 132, avgAQI: 72, weatherCondition: 'Clear', demandLevel: 82, coordinates: { lat: 18.5074, lng: 73.8077 } },
  { id: 'Z008', name: 'Kolkata - Salt Lake', city: 'Kolkata', riskLevel: 'Medium', riskScore: 0.58, activeWorkers: 143, avgAQI: 134, weatherCondition: 'Foggy', demandLevel: 68, coordinates: { lat: 22.5804, lng: 88.4166 } },
]

// Mock Policies
export const policies: Policy[] = [
  { id: 'P001', workerId: 'W001', workerName: 'Ravi Kumar', weekStart: '2026-03-16', weekEnd: '2026-03-22', premium: 45, coverageLimit: 1500, status: 'active' },
  { id: 'P002', workerId: 'W002', workerName: 'Fatima Begum', weekStart: '2026-03-16', weekEnd: '2026-03-22', premium: 70, coverageLimit: 1500, status: 'active' },
  { id: 'P003', workerId: 'W003', workerName: 'Arjun Patel', weekStart: '2026-03-16', weekEnd: '2026-03-22', premium: 80, coverageLimit: 1700, status: 'pending' },
  { id: 'P004', workerId: 'W004', workerName: 'Priya Sharma', weekStart: '2026-03-16', weekEnd: '2026-03-22', premium: 42, coverageLimit: 1400, status: 'active' },
  { id: 'P005', workerId: 'W005', workerName: 'Mohammed Ali', weekStart: '2026-03-16', weekEnd: '2026-03-22', premium: 55, coverageLimit: 1500, status: 'active' },
  { id: 'P006', workerId: 'W007', workerName: 'Vikram Singh', weekStart: '2026-03-09', weekEnd: '2026-03-15', premium: 48, coverageLimit: 1450, status: 'expired' },
]

// Mock Triggers
export const triggers: Trigger[] = [
  { id: 'T001', zone: 'Delhi NCR - Sector 18', type: 'High Pollution', severity: 'Critical', startTime: '2026-03-20T06:00:00', endTime: null, verified: true, affectedWorkers: 89 },
  { id: 'T002', zone: 'Mumbai - Andheri East', type: 'Heavy Rain', severity: 'High', startTime: '2026-03-20T14:30:00', endTime: null, verified: true, affectedWorkers: 156 },
  { id: 'T003', zone: 'Vijayawada Central', type: 'Heavy Rain', severity: 'Medium', startTime: '2026-03-20T11:00:00', endTime: '2026-03-20T15:00:00', verified: true, affectedWorkers: 45 },
  { id: 'T004', zone: 'Chennai - T Nagar', type: 'Extreme Heat', severity: 'High', startTime: '2026-03-20T12:00:00', endTime: null, verified: true, affectedWorkers: 72 },
  { id: 'T005', zone: 'Kolkata - Salt Lake', type: 'Low Demand', severity: 'Low', startTime: '2026-03-20T09:00:00', endTime: '2026-03-20T13:00:00', verified: true, affectedWorkers: 28 },
]

// Mock Claims
export const claims: Claim[] = [
  { id: 'C001', workerId: 'W001', workerName: 'Ravi Kumar', triggerId: 'T003', triggerType: 'Heavy Rain', incomeLoss: 420, payout: 350, fraudScore: 0.12, status: 'paid', timestamp: '2026-03-20T16:00:00' },
  { id: 'C002', workerId: 'W002', workerName: 'Fatima Begum', triggerId: 'T001', triggerType: 'High Pollution', incomeLoss: 380, payout: 320, fraudScore: 0.08, status: 'auto-approved', timestamp: '2026-03-20T15:30:00' },
  { id: 'C003', workerId: 'W003', workerName: 'Arjun Patel', triggerId: 'T002', triggerType: 'Heavy Rain', incomeLoss: 520, payout: 450, fraudScore: 0.15, status: 'auto-approved', timestamp: '2026-03-20T17:00:00' },
  { id: 'C004', workerId: 'W005', workerName: 'Mohammed Ali', triggerId: 'T001', triggerType: 'High Pollution', incomeLoss: 290, payout: 0, fraudScore: 0.82, status: 'rejected', timestamp: '2026-03-20T14:00:00' },
  { id: 'C005', workerId: 'W006', workerName: 'Sneha Reddy', triggerId: 'T004', triggerType: 'Extreme Heat', incomeLoss: 340, payout: 280, fraudScore: 0.45, status: 'under-review', timestamp: '2026-03-20T16:30:00' },
]

// Mock Payouts
export const payouts: Payout[] = [
  { id: 'PO001', claimId: 'C001', workerName: 'Ravi Kumar', amount: 350, status: 'completed', timestamp: '2026-03-20T16:15:00', upiId: 'ravi.kumar@paytm' },
  { id: 'PO002', claimId: 'C002', workerName: 'Fatima Begum', amount: 320, status: 'processing', timestamp: '2026-03-20T15:45:00', upiId: 'fatima.b@gpay' },
  { id: 'PO003', claimId: 'C003', workerName: 'Arjun Patel', amount: 450, status: 'pending', timestamp: '2026-03-20T17:05:00', upiId: 'arjun.p@phonepe' },
]

// Dashboard Stats
export const dashboardStats = {
  totalWorkers: 1247,
  activeWorkers: 892,
  coveredWorkers: 634,
  totalPremiumsCollected: 45670,
  totalPayoutsProcessed: 28450,
  activeTriggers: 4,
  claimsToday: 23,
  fraudDetected: 3,
  avgProcessingTime: '4.2 mins',
  weeklyGrowth: 12.5,
}

// Chart data for analytics
export const weeklyClaimsData = [
  { day: 'Mon', claims: 12, payouts: 8500 },
  { day: 'Tue', claims: 18, payouts: 12400 },
  { day: 'Wed', claims: 15, payouts: 10200 },
  { day: 'Thu', claims: 22, payouts: 15800 },
  { day: 'Fri', claims: 28, payouts: 19500 },
  { day: 'Sat', claims: 35, payouts: 24200 },
  { day: 'Sun', claims: 23, payouts: 16800 },
]

export const riskDistributionData = [
  { name: 'Low Risk', value: 45, fill: 'var(--chart-1)' },
  { name: 'Medium Risk', value: 35, fill: 'var(--chart-3)' },
  { name: 'High Risk', value: 20, fill: 'var(--chart-4)' },
]

export const triggerTypeData = [
  { type: 'Heavy Rain', count: 45 },
  { type: 'High Pollution', count: 32 },
  { type: 'Extreme Heat', count: 28 },
  { type: 'Traffic', count: 18 },
  { type: 'Low Demand', count: 12 },
]

export const cityWiseData = [
  { city: 'Delhi', workers: 312, claims: 89, payouts: 42500 },
  { city: 'Mumbai', workers: 287, claims: 76, payouts: 38200 },
  { city: 'Bangalore', workers: 198, claims: 23, payouts: 11500 },
  { city: 'Hyderabad', workers: 176, claims: 34, payouts: 17800 },
  { city: 'Chennai', workers: 165, claims: 45, payouts: 22100 },
  { city: 'Pune', workers: 132, claims: 18, payouts: 9200 },
]
