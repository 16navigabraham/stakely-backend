const database = require('../../lib/database');
const { validateChallengeIdExists, validateUserNotVoted } = require('../../lib/validators');

async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST', 'OPTIONS']);
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { challengeId, farcasterUsername, vote, stakeAmount } = req.body;

  // Validate required fields and types
  const errors = [];
  
  if (!challengeId) {
    errors.push('Challenge ID is required');
  } else if (typeof challengeId !== 'number' || isNaN(challengeId)) {
    errors.push('Challenge ID must be a number');
  }
  
  if (!farcasterUsername) {
    errors.push('Farcaster username is required');
  }
  
  if (!vote) {
    errors.push('Vote (yes/no) is required');
  }
  
  if (!stakeAmount) {
    errors.push('Stake amount is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  // Validate vote value
  if (!['yes', 'no'].includes(vote.toLowerCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid vote value. Must be "yes" or "no"'
    });
  }

  // Validate stake amount
  if (isNaN(parseFloat(stakeAmount)) || parseFloat(stakeAmount) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Stake amount must be a positive number'
    });
  }

  try {
    await database.connect();
    const now = new Date();

    // Get challenge details
    const challenge = await database.getChallengeById(challengeId);
    
    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Check if challenge is in voting period
    const endDateTime = new Date(challenge.endDateTime);
    const voteEndDateTime = new Date(challenge.voteEndDateTime);

    if (now < endDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Challenge has not ended yet. Voting will start after the challenge ends.'
      });
    }

    if (now > voteEndDateTime) {
      return res.status(400).json({
        success: false,
        message: 'Voting period has ended for this challenge'
      });
    }

    // Check if user has already voted
    const existingVote = await database.getUserVote(challengeId, farcasterUsername);
    if (existingVote) {
      return res.status(400).json({
        success: false,
        message: 'User has already voted on this challenge'
      });
    }

    // Record the vote and stake
    const stakeData = {
      challengeId,
      farcasterUsername,
      vote: vote.toLowerCase(),
      stakeAmount: parseFloat(stakeAmount),
      timestamp: now.toISOString()
    };

    const result = await database.recordStake(stakeData);
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to record stake');
    }

    // Get updated challenge details
    const updatedChallenge = await database.getChallengeById(challengeId);

    return res.status(200).json({
      success: true,
      message: 'Stake recorded successfully',
      data: {
        challengeId: updatedChallenge.id,
        stakePool: {
          total: updatedChallenge.totalStakeAmount,
          yes: updatedChallenge.yesStakeAmount,
          no: updatedChallenge.noStakeAmount
        },
        votes: {
          total: updatedChallenge.yesVotes + updatedChallenge.noVotes,
          yes: updatedChallenge.yesVotes,
          no: updatedChallenge.noVotes,
          yesPercentage: calculatePercentage(updatedChallenge.yesVotes, updatedChallenge.yesVotes + updatedChallenge.noVotes)
        },
        votingTimeRemaining: calculateTimeRemaining(updatedChallenge.voteEndDateTime)
      }
    });

  } catch (error) {
    console.error('Error recording stake:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record stake',
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