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
    'sports', 'food', 'entertainment', 'gaming',
    'crypto', 'fitness', 'travel', 'music',
    'tech', 'art'
  ];
  
  if (!Array.isArray(interests)) {
    throw new Error('Interests must be an array');
  }
  
  if (interests.length !== 3) {
    throw new Error('Exactly 3 interests are required');
  }
  
  // Find invalid interests
  const invalidInterests = interests.filter(interest => 
    !validInterests.includes(interest.toLowerCase().trim())
  );
  
  if (invalidInterests.length > 0) {
    throw new Error(`Invalid interests: ${invalidInterests.join(', ')}. Valid options are: ${validInterests.join(', ')}`);
  }
  
  return true;
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
    // Log the incoming request body for debugging
    console.log('Create user request body:', req.body);
    console.log('Create user headers:', req.headers);
    
    const { farcasterUsername, interests, farcasterWalletAddress } = req.body;
    
    // Validate required fields
    try {
      validateUserData({ 
        farcasterUsername, 
        interests, 
        farcasterWalletAddress 
      });
    } catch (validationError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        error: validationError.message,
        validInterests: [
          'sports', 'food', 'entertainment', 'gaming',
          'crypto', 'fitness', 'travel', 'music',
          'tech', 'art'
        ]
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
    console.log('Attempting to create user with data:', userData);
    const result = await database.createUser(userData);
    console.log('Database create result:', result);
    
    if (result.success) {
      const response = {
        success: true,
        message: 'User created successfully!',
        data: {
          id: result.id,
          farcasterUsername: userData.farcasterUsername,
          interests: userData.interests,
          farcasterWalletAddress: userData.farcasterWalletAddress,
          createdAt: userData.createdAt
        }
      };
      console.log('Sending success response:', response);
      return res.status(201).json(response);
    } else {
      console.error('Create user failed:', result);
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