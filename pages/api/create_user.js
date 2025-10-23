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
function validateFarcasterUsername(username) {
  if (!username || typeof username !== 'string') {
    return false;
  }
  // Basic validation for farcaster username
  return username.trim().length >= 1 && username.trim().length <= 50;
}

function validateWalletAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }
  // Basic Ethereum address validation (0x followed by 40 hex characters)
  const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethAddressRegex.test(address.trim());
}

function validateInterests(interests) {
  const validInterests = [
    'sports', 'crypto', 'entertainment', 'social network', 
    'tech', 'politics', 'weather'
  ];
  
  if (!Array.isArray(interests)) {
    return false;
  }
  
  if (interests.length !== 3) {
    return false;
  }
  
  // Check if all interests are valid
  return interests.every(interest => 
    validInterests.includes(interest.toLowerCase().trim())
  );
}

function validateUserData(data) {
  const errors = [];
  
  if (!validateFarcasterUsername(data.farcasterUsername)) {
    errors.push('Valid Farcaster username is required (1-50 characters)');
  }
  
  if (!validateWalletAddress(data.farcasterWalletAddress)) {
    errors.push('Valid Farcaster wallet address is required (Ethereum format: 0x...)');
  }
  
  if (!validateInterests(data.interests)) {
    errors.push('Exactly 3 interests are required from: sports, crypto, entertainment, social network, tech, politics, weather');
  }
  
  return errors;
}

async function createUserHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use POST to create a user.'
    });
  }
  
  await initializeDatabase();
  
  try {
    const { farcasterUsername, interests, farcasterWalletAddress } = req.body;
    
    // Validate required fields
    const validationErrors = validateUserData({ 
      farcasterUsername, 
      interests, 
      farcasterWalletAddress 
    });
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Prepare user data for storage
    const userData = {
      farcasterUsername: farcasterUsername.trim(),
      interests: interests.map(interest => interest.toLowerCase().trim()),
      farcasterWalletAddress: farcasterWalletAddress.trim(),
      createdAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };
    
    // Add to database
    const result = await database.createUser(userData);
    
    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'User created successfully!',
        data: {
          id: result.id,
          farcasterUsername: userData.farcasterUsername,
          interests: userData.interests,
          farcasterWalletAddress: userData.farcasterWalletAddress,
          createdAt: userData.createdAt
        }
      });
    } else {
      throw new Error('Failed to create user');
    }
    
  } catch (error) {
    console.error('Create user error:', error);
    
    // Handle duplicate username error
    if (error.message.includes('duplicate') || error.message.includes('E11000')) {
      return res.status(409).json({
        success: false,
        message: 'Farcaster username already exists'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = createUserHandler;