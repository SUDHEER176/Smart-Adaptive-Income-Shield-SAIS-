/**
 * User/Worker Session Management
 * Maps phone numbers to worker profiles
 */

class UserManager {
  constructor() {
    this.userSessions = new Map(); // phone -> { workerId, workerData, policies, claims }
    this.phoneToWorkerId = new Map(); // phone -> workerId
  }

  /**
   * Create or get user session by phone number
   */
  getOrCreateSession(phoneNumber) {
    const hasSession = this.userSessions.has(phoneNumber);
    
    if (!hasSession) {
      const newSession = {
        phone: phoneNumber,
        workerId: null,
        workerData: null,
        policies: [],
        claims: [],
        registrationStep: null, // For multi-step registration
        registrationData: {}, // Temporary data during registration
        isRegistered: false,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      };
      this.userSessions.set(phoneNumber, newSession);
      console.log(`🆕 NEW SESSION CREATED for user: "${phoneNumber}"`);
      console.log(`   Total active sessions: ${this.userSessions.size}`);
      return newSession;
    } else {
      const session = this.userSessions.get(phoneNumber);
      session.lastMessageAt = new Date().toISOString();
      console.log(`📬 REUSING SESSION for user: "${phoneNumber}"`);
      console.log(`   Created at: ${session.createdAt}`);
      console.log(`   Is Registered: ${session.isRegistered}`);
      console.log(`   Worker ID: ${session.workerId}`);
      console.log(`   Total active sessions: ${this.userSessions.size}`);
      return session;
    }
  }

  /**
   * Get session by phone
   */
  getSession(phoneNumber) {
    return this.userSessions.get(phoneNumber);
  }

  /**
   * Register user (step-by-step)
   */
  registerUser(phoneNumber, name, zone, platform, weeklyHours, workerId) {
    const session = this.getOrCreateSession(phoneNumber);
    console.log(`\n✅ REGISTERING USER: "${phoneNumber}"`);
    console.log(`   Name: ${name}`);
    console.log(`   Zone: ${zone}`);
    console.log(`   Platform: ${platform}`);
    console.log(`   Hours: ${weeklyHours}`);
    console.log(`   Worker ID: ${workerId}`);
    
    session.workerId = workerId;
    session.workerData = {
      id: workerId,
      name,
      phone: phoneNumber,
      zone,
      platform,
      weeklyHours,
    };
    session.isRegistered = true;
    this.phoneToWorkerId.set(phoneNumber, workerId);
    
    console.log(`✓ Session updated. Total sessions now: ${this.userSessions.size}`);
    console.log(`✓ All registered workers: ${Array.from(this.phoneToWorkerId.values()).join(', ')}`);
    
    return session;
  }

  /**
   * Update user policy
   */
  updateUserPolicy(phoneNumber, policy) {
    const session = this.getOrCreateSession(phoneNumber);
    session.policies = Array.isArray(session.policies) ? session.policies : [];
    
    const existingIndex = session.policies.findIndex(p => p.id === policy.id);
    if (existingIndex >= 0) {
      session.policies[existingIndex] = policy;
    } else {
      session.policies.push(policy);
    }
    return session;
  }

  /**
   * Add claim to user
   */
  addUserClaim(phoneNumber, claim) {
    const session = this.getOrCreateSession(phoneNumber);
    session.claims = Array.isArray(session.claims) ? session.claims : [];
    session.claims.push(claim);
    return session;
  }

  /**
   * Get user info
   */
  getUserInfo(phoneNumber) {
    const session = this.getOrCreateSession(phoneNumber);
    return {
      phone: phoneNumber,
      workerId: session.workerId,
      workerData: session.workerData,
      isRegistered: session.isRegistered,
      policiesCount: session.policies?.length || 0,
      claimsCount: session.claims?.length || 0,
    };
  }

  /**
   * Get all sessions (for analytics)
   */
  getAllSessions() {
    return Array.from(this.userSessions.values());
  }

  /**
   * Get sessions by status
   */
  getSessionsByStatus(isRegistered) {
    return Array.from(this.userSessions.values()).filter(
      s => s.isRegistered === isRegistered
    );
  }
}

module.exports = new UserManager();
