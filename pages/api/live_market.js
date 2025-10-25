const database = require('../../lib/database');

// Initialize database connection on first import
let dbInitialized = false;

async function initializeDatabase() {
  if (!dbInitialized) {
    await database.connect();
    dbInitialized = true;
  }
}

// Valid categories for filtering
const VALID_CATEGORIES = [
  'all',
  'sports', 
  'crypto', 
  'entertainment', 
  'social network', 
  'tech', 
  'politics', 
  'weather'
];

function validateCategory(category) {
  return VALID_CATEGORIES.includes(category.toLowerCase().trim());
}

// Helper function to validate if challenge exists
async function validateChallengeIdExists(challengeId) {
  try {
    const challenge = await database.getChallengeById(challengeId);
    return { 
      exists: !!challenge, 
      challenge: challenge 
    };
  } catch (error) {
    console.error('Error validating challenge:', error);
    return { exists: false, challenge: null };
  }
}

// Helper function to check if user has already voted
async function validateUserNotVoted(challengeId, farcasterUsername) {
  try {
    // Check if user has already voted on this challenge
    const existingVote = await database.getVoteByUserAndChallenge(challengeId, farcasterUsername);
    return { 
      hasVoted: !!existingVote, 
      vote: existingVote 
    };
  } catch (error) {
    console.error('Error checking user vote:', error);
    return { hasVoted: false, vote: null };
  }
}

async function liveMarketHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Support POST for recording votes and GET for fetching data
  if (req.method === 'POST') {
    // Record a vote
    try {
      await initializeDatabase();
      const { farcasterUsername, challengeId, vote, stakeAmount } = req.body;
      const errors = [];

      if (!farcasterUsername) {
        errors.push('Farcaster username is required');
      }
      
      if (!challengeId) {
        errors.push('Challenge ID is required');
      } else if (typeof challengeId !== 'number' || isNaN(challengeId)) {
        errors.push('Challenge ID must be a number');
      }
      
      if (!vote) {
        errors.push('Vote is required');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors
        });
      }

      // Validate challenge exists
      const { exists, challenge } = await validateChallengeIdExists(challengeId);
      if (!exists) {
        return res.status(404).json({ success: false, message: 'Challenge not found' });
      }

      // Check if user has already voted
      const { hasVoted, vote: existingVote } = await validateUserNotVoted(challengeId, farcasterUsername);
      if (hasVoted) {
        return res.status(400).json({ 
          success: false, 
          message: 'User has already voted on this challenge',
          existingVote: existingVote
        });
      }

      if (!['yes', 'no'].includes(String(vote).toLowerCase())) {
        return res.status(400).json({ success: false, message: "Invalid vote value. Use 'yes' or 'no'" });
      }

      const voteEntry = {
        farcasterUsername,
        challengeId,
        vote: String(vote).toLowerCase(),
        stakeAmount: stakeAmount ? Number(stakeAmount) : 0
      };

      const result = await database.recordVote(voteEntry);
      return res.status(201).json({ success: true, data: result.data || result });
    } catch (error) {
      console.error('Record vote error:', error);
      return res.status(500).json({ success: false, message: 'Failed to record vote' });
    }
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET to fetch live market data or POST to record a vote.'
    });
  }
  
  await initializeDatabase();
  
  try {
    const {
      farcasterUsername,
      category = 'all',
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'active',
      // if userVotes=true, return votes for the provided farcasterUsername
      userVotes = 'false'
    } = req.query;
    
    // Debug logging for query parameters
    console.log('API Query Parameters:', {
      farcasterUsername,
      category,
      page,
      limit: limit,
      limitType: typeof limit,
      sortBy,
      sortOrder,
      status,
      userVotes
    });
    
    // Validate category
    if (!validateCategory(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category. Must be one of: ' + VALID_CATEGORIES.join(', ')
      });
    }
    
    // Build filter criteria 
    let dbStatus = status;
    if (status === 'all') {
      dbStatus = null; // Don't filter by status for 'all'
    } else if (status === 'active') {
      dbStatus = null; // Don't filter by status for 'active' - we'll filter by time later
    }
    
    const filterCriteria = {
      category: category.toLowerCase() === 'all' ? null : category.toLowerCase().trim(),
      status: dbStatus,
      farcasterUsername: farcasterUsername || null
    };
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);
    const sortOrderNum = sortOrder === 'desc' ? -1 : 1;
    
    // If user provided farcasterUsername, get their interests for personalized results
    let userInterests = [];
    if (farcasterUsername) {
      try {
        const user = await database.getUserByFarcasterUsername(farcasterUsername);
        if (user && user.interests) {
          userInterests = user.interests;
        }
      } catch (error) {
        console.warn('Could not fetch user interests:', error.message);
      }
    }

    // If caller requested user votes, return them
    if (String(userVotes).toLowerCase() === 'true') {
      if (!farcasterUsername) {
        return res.status(400).json({ success: false, message: 'Provide farcasterUsername to fetch user votes' });
      }
      const votes = await database.getVotesByUser(farcasterUsername);
      return res.status(200).json({ success: true, data: votes });
    }
    
    // Get challenges from database
    const result = await database.getChallenges({
      filterCriteria,
      userInterests,
      skip,
      limit: limitNum,
      sortBy,
      sortOrder: sortOrderNum
    });
    
    // Debug logging
    console.log('Database query result:', {
      filterCriteria,
      userInterests,
      resultDataLength: result.data ? result.data.length : 0,
      resultTotal: result.total,
      useFileStorage: database.useFileStorage,
      isConnected: database.isConnected,
      hasDB: !!database.db
    });
    
    // Get market statistics
    const marketStats = await database.getMarketStats();
    
    // Additional debug for market stats
    console.log('Market stats result:', {
      totalChallenges: marketStats.totalChallenges,
      activeChallenges: marketStats.activeChallenges,
      useFileStorage: database.useFileStorage
    });
    
    // Format response data
    const allFormattedChallenges = (result.data || []).map(challenge => {
      const now = new Date();
      const startDateTime = new Date(challenge.startDateTime);
      const endDateTime = new Date(challenge.endDateTime);
      
      // Determine actual status based on time
      let actualStatus = challenge.status;
      if (now >= startDateTime && now <= endDateTime) {
        actualStatus = 'active';
      } else if (now > endDateTime) {
        actualStatus = 'completed';
      } else {
        actualStatus = 'pending';
      }
      
      return {
        id: challenge.id,
        title: challenge.title,
        category: challenge.category,
        bannerUrl: challenge.bannerUrl,
        challengeDetails: challenge.challengeDetails,
        winCondition: challenge.winCondition,
        socialPlatform: challenge.socialPlatform,
        startDateTime: challenge.startDateTime,
        endDateTime: challenge.endDateTime,
        voteEndDateTime: challenge.voteEndDateTime,
        stakeAmount: challenge.stakeAmount,
        currentStake: challenge.currentStake || 0,
        yesVotes: challenge.yesVotes || 0,
        noVotes: challenge.noVotes || 0,
        totalVotes: (challenge.yesVotes || 0) + (challenge.noVotes || 0),
        yesPercentage: (challenge.yesVotes || 0) > 0 || (challenge.noVotes || 0) > 0
          ? Math.round(((challenge.yesVotes || 0) / ((challenge.yesVotes || 0) + (challenge.noVotes || 0))) * 100)
          : 0,
        status: actualStatus,
        createdAt: challenge.createdAt,
        farcasterUsername: challenge.farcasterUsername,
        timeRemaining: calculateTimeRemaining(challenge.endDateTime),
        isActive: now >= startDateTime && now <= endDateTime
      };
    });
    
    // Filter by requested status after calculating actual status
    const filteredChallenges = allFormattedChallenges.filter(challenge => {
      if (status === 'all') return true;
      
      // For 'active' status, use time-based calculation
      if (status === 'active') {
        return challenge.isActive;
      }
      
      // For other statuses, use the stored status
      return challenge.status === status;
    });
    
    // Debug logging for filtering
    console.log('Filtering debug:', {
      allChallengesCount: allFormattedChallenges.length,
      requestedStatus: status,
      filteredCount: filteredChallenges.length,
      filterCriteria: filterCriteria,
      allStatuses: allFormattedChallenges.map(c => ({ id: c.id, status: c.status, isActive: c.isActive }))
    });
    
    // Apply pagination to filtered results
    const paginatedChallenges = filteredChallenges.slice(skip, skip + limitNum);
    
    return res.status(200).json({
      success: true,
      data: paginatedChallenges,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredChallenges.length / limitNum),
        totalItems: filteredChallenges.length,
        itemsPerPage: limitNum,
        hasNext: skip + limitNum < filteredChallenges.length,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        category: category,
        status: status,
        userInterests: userInterests,
        isPersonalized: userInterests.length > 0
      },
      marketStats: {
        totalChallenges: marketStats.totalChallenges,
        activeChallenges: marketStats.activeChallenges,
        totalStaked: marketStats.totalStaked,
        categoriesCount: marketStats.categoriesCount
      },
      meta: {
        sortBy,
        sortOrder,
        availableCategories: VALID_CATEGORIES,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Live market error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve live market data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

function calculateTimeRemaining(endDateTime) {
  const now = new Date();
  const end = new Date(endDateTime);
  const diff = end - now;
  
  if (diff <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0
    };
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(diff / 1000),
    humanReadable: `${days}d ${hours}h ${minutes}m ${seconds}s`
  };
}

module.exports = liveMarketHandler;