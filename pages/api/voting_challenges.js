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

  try {
    await database.connect();
    const now = new Date();

    // Get challenges that have ended but are still in voting period
    const votingChallenges = await database.getChallenges({
      filter: {
        $and: [
          { endDateTime: { $lte: now.toISOString() } },
          { voteEndDateTime: { $gt: now.toISOString() } }
        ]
      }
    });

    return res.status(200).json({
      success: true,
      data: votingChallenges.map(challenge => ({
        id: challenge.id,
        title: challenge.title,
        category: challenge.category,
        description: challenge.description,
        winCondition: challenge.winCondition,
        endDateTime: challenge.endDateTime,
        voteEndDateTime: challenge.voteEndDateTime,
        votingTimeRemaining: calculateTimeRemaining(challenge.voteEndDateTime),
        stakePool: {
          total: challenge.totalStakeAmount || 0,
          yes: challenge.yesStakeAmount || 0,
          no: challenge.noStakeAmount || 0
        },
        votes: {
          total: (challenge.yesVotes || 0) + (challenge.noVotes || 0),
          yes: challenge.yesVotes || 0,
          no: challenge.noVotes || 0,
          yesPercentage: calculatePercentage(challenge.yesVotes, challenge.yesVotes + challenge.noVotes)
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching voting challenges:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch voting challenges',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

function calculateTimeRemaining(endDateTimeStr) {
  const now = new Date();
  const endDateTime = new Date(endDateTimeStr);
  const diffMs = endDateTime - now;

  if (diffMs <= 0) {
    return {
      expired: true,
      humanReadable: "Voting ended"
    };
  }

  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diffMs % (60 * 1000)) / 1000);

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds: Math.floor(diffMs / 1000),
    humanReadable: `${days}d ${hours}h ${minutes}m ${seconds}s`
  };
}

function calculatePercentage(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

module.exports = handler;