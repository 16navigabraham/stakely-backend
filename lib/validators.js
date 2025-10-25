const database = require('./database');

async function validateChallengeIdExists(challengeId) {
  try {
    const challenge = await database.getChallengeById(challengeId);
    return { exists: !!challenge, challenge };
  } catch (error) {
    console.error('Error validating challenge ID:', error);
    return { exists: false, error };
  }
}

async function validateChallengeIdNotExists(challengeId) {
  try {
    const challenge = await database.getChallengeById(challengeId);
    return { exists: !!challenge, challenge };
  } catch (error) {
    console.error('Error validating challenge ID:', error);
    return { exists: false, error };
  }
}

async function validateUserNotVoted(challengeId, farcasterUsername) {
  try {
    const existingVote = await database.getUserVote(challengeId, farcasterUsername);
    return { hasVoted: !!existingVote, vote: existingVote };
  } catch (error) {
    console.error('Error validating user vote:', error);
    return { hasVoted: false, error };
  }
}

module.exports = {
  validateChallengeIdExists,
  validateChallengeIdNotExists,
  validateUserNotVoted
};