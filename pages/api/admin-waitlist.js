const database = require('../../lib/database');

// Initialize database connection on first import
let dbInitialized = false;

async function initializeDatabase() {
  if (!dbInitialized) {
    await database.connect();
    dbInitialized = true;
  }
}

// Helper function to check if date is today
function isToday(dateString) {
  const today = new Date();
  const date = new Date(dateString);
  return date.toDateString() === today.toDateString();
}

// Export function for CSV
async function exportCSV() {
  const result = await database.getWaitlist({ limit: 10000, skip: 0 });
  const entries = result.data;
  
  const csv = entries.map(e => 
    `"${e.email}","${e.farcasterUsername || ''}","${e.twitterUsername || ''}","${e.timestamp}","${e.position || ''}"`
  ).join('\n');
  
  return `Email,Farcaster,Twitter,Date,Position\n${csv}`;
}

// Enhanced stats function
async function getEnhancedStats() {
  const result = await database.getWaitlist({ limit: 10000, skip: 0 });
  const entries = result.data;
  
  return {
    total: entries.length,
    today: entries.filter(e => isToday(e.timestamp)).length,
    twitterSignups: entries.filter(e => e.twitterUsername).length,
    farcasterSignups: entries.filter(e => e.farcasterUsername).length,
    latest: entries.slice(-5).reverse() // Last 5 signups, most recent first
  };
}

// Simple password authentication via query parameter
function isAuthenticated(req) {
  const password = req.query.password;
  const adminPassword = process.env.ADMIN_PASSWORD || 'your_simple_password';
  
  return password === adminPassword;
}

async function adminWaitlistHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Check authentication
  if (!isAuthenticated(req)) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Please add ?password=your_simple_password to the URL.'
    });
  }
  
  await initializeDatabase();
  
  if (req.method === 'GET') {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc',
        search = '',
        export: exportFormat
      } = req.query;
      
      // Handle CSV export
      if (exportFormat === 'csv') {
        const csvData = await exportCSV();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="waitlist-${new Date().toISOString().split('T')[0]}.csv"`);
        return res.status(200).send(csvData);
      }
      
      // Convert page to skip value
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const limitNum = parseInt(limit);
      const sortOrderNum = sortOrder === 'desc' ? -1 : 1;
      
      // Get waitlist data
      const result = await database.getWaitlist({
        skip,
        limit: limitNum,
        sortBy,
        sortOrder: sortOrderNum
      });
      
      // Get stats
      const enhancedStats = await getEnhancedStats();
      
      // Filter by search if provided
      let filteredData = result.data;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = result.data.filter(entry =>
          entry.email?.toLowerCase().includes(searchLower) ||
          entry.farcasterUsername?.toLowerCase().includes(searchLower) ||
          entry.twitterUsername?.toLowerCase().includes(searchLower)
        );
      }
      
      return res.status(200).json({
        success: true,
        data: filteredData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.total / limitNum),
          totalItems: result.total,
          itemsPerPage: limitNum,
          hasNext: skip + limitNum < result.total,
          hasPrev: parseInt(page) > 1
        },
        stats: enhancedStats,
        meta: {
          sortBy,
          sortOrder,
          search: search || null,
          exportUrl: `/api/admin-waitlist?password=${req.query.password}&export=csv`,
          accessUrl: `Visit: http://localhost:3000/api/admin-waitlist?password=${process.env.ADMIN_PASSWORD || 'your_simple_password'}`
        }
      });
      
    } catch (error) {
      console.error('Admin waitlist error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve waitlist data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  else {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }
}

module.exports = adminWaitlistHandler;