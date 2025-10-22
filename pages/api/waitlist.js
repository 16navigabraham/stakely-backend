const database = require('../../lib/database');

// Initialize database connection on first import
let dbInitialized = false;

async function initializeDatabase() {
  if (!dbInitialized) {
    await database.connect();
    dbInitialized = true;
  }
}

// Validation helpers
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateWaitlistData(data) {
  const errors = [];
  
  if (!data.email) {
    errors.push('Email is required');
  } else if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }
  
  // At least one username is required
  if (!data.farcasterUsername && !data.twitterUsername) {
    errors.push('Either Farcaster username or Twitter username is required');
  }
  
  // Validate usernames format if provided
  if (data.farcasterUsername && (typeof data.farcasterUsername !== 'string' || data.farcasterUsername.trim().length < 1)) {
    errors.push('Farcaster username must be a valid string');
  }
  
  if (data.twitterUsername && (typeof data.twitterUsername !== 'string' || data.twitterUsername.trim().length < 1)) {
    errors.push('Twitter username must be a valid string');
  }
  
  return errors;
}

async function waitlistHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  await initializeDatabase();
  
  if (req.method === 'POST') {
    try {
      const { email, farcasterUsername, twitterUsername } = req.body;
      
      // Validate required fields
      const validationErrors = validateWaitlistData({ email, farcasterUsername, twitterUsername });
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }
      
      // Prepare data for storage
      const waitlistData = {
        email: email.toLowerCase().trim(),
        farcasterUsername: farcasterUsername?.trim() || null,
        twitterUsername: twitterUsername?.trim() || null,
        userAgent: req.headers['user-agent'],
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      };
      
      // Add to waitlist
      const result = await database.addToWaitlist(waitlistData);
      
      if (result.success) {
        return res.status(201).json({
          success: true,
          message: 'Successfully joined the waitlist!',
          id: result.id,
          position: result.data.position
        });
      } else {
        throw new Error('Failed to add to waitlist');
      }
      
    } catch (error) {
      console.error('Waitlist error:', error);
      
      // Handle duplicate email error
      if (error.message.includes('duplicate') || error.message.includes('E11000')) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists in waitlist'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  else if (req.method === 'GET') {
    try {
      // Public endpoint - return basic stats only
      const stats = await database.getWaitlistStats();
      
      return res.status(200).json({
        success: true,
        stats: {
          total: stats.total,
          todayCount: stats.todayCount,
          twitterSignups: stats.twitterSignups,
          farcasterSignups: stats.farcasterSignups
        }
      });
      
    } catch (error) {
      console.error('Waitlist stats error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve stats'
      });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}

module.exports = waitlistHandler;