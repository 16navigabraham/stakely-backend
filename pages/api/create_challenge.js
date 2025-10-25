const database = require('../../lib/database');

// Initialize database connection on first import
let dbInitialized = false;

async function initializeDatabase() {
  if (!dbInitialized) {
    await database.connect();
    dbInitialized = true;
  }
}

// Vote duration mapping (in hours)
const VOTE_DURATIONS = {
  'sports': 2,
  'crypto': 2,
  'entertainment': 3,
  'social network': 3,
  'tech': 3,
  'politics': 2,
  'weather': 2
};

// Validation helpers
function validateCategory(category) {
  const validCategories = [
    'sports', 'crypto', 'entertainment', 'social network', 
    'tech', 'politics', 'weather'
  ];
  return validCategories.includes(category.toLowerCase().trim());
}

function validateSocialPlatform(platform) {
  const validPlatforms = ['farcaster', 'twitter', 'discord', 'telegram', 'other'];
  return validPlatforms.includes(platform.toLowerCase().trim());
}

function validateDateTime(dateStr, timeStr) {
  try {
    // Parse DD/MM/YYYY format
    const dateParts = dateStr.split('/');
    if (dateParts.length !== 3) return false;
    
    const day = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
    const year = parseInt(dateParts[2]);
    
    // Parse HH:MM:SS format
    const timeParts = timeStr.split(':');
    if (timeParts.length !== 3) return false;
    
    const hours = parseInt(timeParts[0]);
    const minutes = parseInt(timeParts[1]);
    const seconds = parseInt(timeParts[2]);
    
    const dateTime = new Date(year, month, day, hours, minutes, seconds);
    
    // Check if the date is valid and in the future
    return dateTime instanceof Date && !isNaN(dateTime) && dateTime > new Date();
  } catch (error) {
    return false;
  }
}

function validateChallengeData(data) {
  const errors = [];

  if (!data.Id) {
    errors.push('Challenge Id is required');
  } else if (typeof data.Id !== 'number' || isNaN(data.Id)) {
    errors.push('Challenge Id must be a number');
  }
  
  if (!data.farcasterUsername || data.farcasterUsername.trim().length < 1) {
    errors.push('Farcaster username is required');
  }
  
  if (!data.title || data.title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  
  if (!validateCategory(data.category)) {
    errors.push('Category must be one of: sports, crypto, entertainment, social network, tech, politics, weather');
  }
  
  if (!data.description || data.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }
  
  if (!data.winCondition || data.winCondition.trim().length < 5) {
    errors.push('Win condition is required and must be at least 5 characters long');
  }
  
  if (!validateSocialPlatform(data.socialPlatform)) {
    errors.push('Social platform must be one of: farcaster, twitter, discord, telegram, other');
  }
  
  if (!validateDateTime(data.startDate, data.startTime)) {
    errors.push('Start date/time must be in DD/MM/YYYY and HH:MM:SS format and in the future');
  }
  
  if (!validateDateTime(data.endDate, data.endTime)) {
    errors.push('End date/time must be in DD/MM/YYYY and HH:MM:SS format and in the future');
  }
  
  if (!data.stakeAmount || isNaN(parseFloat(data.stakeAmount)) || parseFloat(data.stakeAmount) <= 0) {
    errors.push('Stake amount must be a positive number');
  }
  
  // Check if end date is after start date
  try {
    const startDateTime = parseDateTimeString(data.startDate, data.startTime);
    const endDateTime = parseDateTimeString(data.endDate, data.endTime);
    
    if (endDateTime <= startDateTime) {
      errors.push('End date/time must be after start date/time');
    }
  } catch (error) {
    // Error already caught in individual validations
  }
  
  return errors;
}

function parseDateTimeString(dateStr, timeStr) {
  const dateParts = dateStr.split('/');
  const day = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]) - 1;
  const year = parseInt(dateParts[2]);
  
  const timeParts = timeStr.split(':');
  const hours = parseInt(timeParts[0]);
  const minutes = parseInt(timeParts[1]);
  const seconds = parseInt(timeParts[2]);
  
  return new Date(year, month, day, hours, minutes, seconds);
}

function calculateVoteEndDateTime(endDateTime, category) {
  const voteEndDateTime = new Date(endDateTime);
  const voteDurationHours = VOTE_DURATIONS[category.toLowerCase()] || 2; // Default to 2 hours
  voteEndDateTime.setHours(voteEndDateTime.getHours() + voteDurationHours);
  return voteEndDateTime;
}

async function validateChallengeIdNotExists(challengeId) {
  try {
    const existingChallenge = await database.getChallengeById(challengeId);
    return { exists: !!existingChallenge };
  } catch (error) {
    console.error('Error checking challenge ID:', error);
    return { exists: false };
  }
}

async function createChallengeHandler(req, res) {
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
      message: 'Method not allowed. Use POST to create a challenge.'
    });
  }
  
  await initializeDatabase();
  
  try {
    const {
      Id,
      farcasterUsername,
      title,
      category,
      description,
      winCondition,
      socialPlatform,
      startDate,
      startTime,
      endDate,
      endTime,
      stakeAmount
    } = req.body;
    
    // Check if challenge ID already exists
    const { exists } = await validateChallengeIdNotExists(Id);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: ['Challenge ID already exists']
      });
    }
    
    // Validate required fields
    const validationErrors = validateChallengeData(req.body);
    
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    const endDateTime = parseDateTimeString(endDate, endTime);
    const voteEndDateTime = calculateVoteEndDateTime(endDateTime, category);

    // Prepare challenge data for storage
    const challengeData = {
      id: Id.toString().trim(),
      farcasterUsername: farcasterUsername.trim(),
      title: title.trim(),
      category: category.toLowerCase().trim(),
      description: description.trim(),
      winCondition: winCondition.trim(),
      socialPlatform: socialPlatform.toLowerCase().trim(),
      startDateTime: parseDateTimeString(startDate, startTime).toISOString(),
      endDateTime: endDateTime.toISOString(),
      voteEndDateTime: voteEndDateTime.toISOString(),
      stakeAmount: parseFloat(stakeAmount),
      currentStake: 0,
      yesVotes: 0,
      noVotes: 0,
      status: 'pending', // pending, active, completed, cancelled
      createdAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    };
    
    // Add to database
    const result = await database.createChallenge(challengeData);
    
    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Challenge created successfully!',
        data: {
          id: challengeData.id,
          title: challengeData.title,
          category: challengeData.category,
          description: challengeData.description,
          winCondition: challengeData.winCondition,
          startDateTime: challengeData.startDateTime,
          endDateTime: challengeData.endDateTime,
          voteEndDateTime: challengeData.voteEndDateTime,
          stakeAmount: challengeData.stakeAmount,
          status: challengeData.status,
          createdAt: challengeData.createdAt
        }
      });
    } else {
      throw new Error('Failed to create challenge');
    }
    
  } catch (error) {
    console.error('Create challenge error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = createChallengeHandler;