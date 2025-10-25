const database = require('../../lib/database');

// Initialize database connection on first import
let dbInitialized = false;

async function initializeDatabase() {
  if (!dbInitialized) {
    await database.connect();
    dbInitialized = true;
  }
}

async function leaderboardHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET to fetch leaderboard data.'
    });
  }
  
  await initializeDatabase();
  
  try {
    const {
      type = 'all', // 'all', 'votes', 'stakes'
      limit = 50,
      page = 1
    } = req.query;
    
    // Validate type parameter
    const validTypes = ['all', 'votes', 'stakes'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid type. Must be one of: ' + validTypes.join(', ')
      });
    }
    
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Max 100 items
    const pageNum = parseInt(page) || 1;
    const skip = (pageNum - 1) * limitNum;
    
    let result = {};
    
    if (type === 'all' || type === 'votes') {
      const votesLeaderboard = await database.getUserLeaderboardByVotes({
        limit: limitNum,
        skip: skip
      });
      result.votesLeaderboard = votesLeaderboard;
    }
    
    if (type === 'all' || type === 'stakes') {
      const stakesLeaderboard = await database.getUserLeaderboardByStakes({
        limit: limitNum,
        skip: skip
      });
      result.stakesLeaderboard = stakesLeaderboard;
    }
    
    // Get overall stats
    const overallStats = await database.getLeaderboardStats();
    
    return res.status(200).json({
      success: true,
      data: result,
      stats: overallStats,
      pagination: {
        currentPage: pageNum,
        itemsPerPage: limitNum,
        type: type
      },
      meta: {
        timestamp: new Date().toISOString(),
        availableTypes: validTypes
      }
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve leaderboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = leaderboardHandler;