const database = require('../../lib/database');

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { farcasterUsername } = req.query;
  if (!farcasterUsername) {
    return res.status(400).json({ success: false, message: 'Missing farcasterUsername query parameter' });
  }

  try {
    console.log('Fetching profile for username:', farcasterUsername);
    console.log('Database storage mode:', database.useFileStorage ? 'File Storage' : 'MongoDB');
    await database.connect();
    const user = await database.getUserByFarcasterUsername(farcasterUsername);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Return a minimal profile
    const profile = {
      id: user.id,
      farcasterUsername: user.farcasterUsername,
      displayName: user.displayName || user.name || null,
      interests: user.interests || [],
      createdAt: user.createdAt || null
    };

    return res.status(200).json({ success: true, profile });
  } catch (error) {
    console.error('User profile error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
}

module.exports = handler;
