# New API Endpoints Documentation

## 🔥 New Endpoints Overview

### 1. `/api/create_user` (POST)
### 2. `/api/create_challenge` (POST) 
### 3. `/api/live_market` (GET, POST)
### 4. `/api/user_profile` (GET)
### 5. `/api/voting_challenges` (GET)
### 6. `/api/challenge_stake` (POST)

---

## 🆕 1. Create User Endpoint

**URL:** `POST /api/create_user`

### Request Body:
```json
{
  "farcasterUsername": "dwr",
  "interests": ["crypto", "tech", "sports"],
  "farcasterWalletAddress": "0x1234567890123456789012345678901234567890"
}
```

## 👤 4. User Profile Endpoint## Required Fields:

**URL:** `GET /api/voting_challenges`

Fetches all challenges that have ended but are still in their voting period. The voting period is determined by the challenge category:
- Sports: 2 hours
- Crypto: 2 hours
- Entertainment: 3 hours
- Social Network: 3 hours
- Tech: 3 hours
- Politics: 2 hours
- Weather: 2 hours

### Example:
```bash
curl "http://localhost:3000/api/voting_challenges"
```

### Success Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "1729598400123_def789",
      "title": "Crypto Price Prediction Challenge",
      "category": "crypto",
      "description": "Predict if Bitcoin will reach $100k by end of year",
      "winCondition": "Bitcoin reaches $100,000 USD on any major exchange",
      "endDateTime": "2025-12-31T23:59:59.000Z",
      "voteEndDateTime": "2026-01-01T01:59:59.000Z",
      "votingTimeRemaining": {
        "expired": false,
        "days": 0,
        "hours": 1,
        "minutes": 59,
        "seconds": 59,
        "totalSeconds": 7199,
        "humanReadable": "0d 1h 59m 59s"
      },
      "stakePool": {
        "total": 2500,
        "yes": 1500,
        "no": 1000
      },
      "votes": {
        "total": 20,
        "yes": 12,
        "no": 8,
        "yesPercentage": 60
      }
    }
  ]
}
```

---

## 💰 6. Challenge Stake Endpoint

**URL:** `POST /api/challenge_stake`

Submit a stake and vote for a challenge that is in its voting period.

### Request Body:
```json
{
  "challengeId": 1,
  "farcasterUsername": "dwr",
  "vote": "yes",
  "stakeAmount": 100
}
```

### Required Fields:
- `challengeId` (number) - ID of the challenge to stake on
- `farcasterUsername` (string) - User making the stake
- `vote` (string) - Must be "yes" or "no"
- `stakeAmount` (number) - Positive number representing the stake amount

### Success Response (200):
```json
{
  "success": true,
  "message": "Stake recorded successfully",
  "data": {
    "challengeId": "1729598400123_def789",
    "stakePool": {
      "total": 2600,
      "yes": 1600,
      "no": 1000
    },
    "votes": {
      "total": 21,
      "yes": 13,
      "no": 8,
      "yesPercentage": 62
    },
    "votingTimeRemaining": {
      "expired": false,
      "days": 0,
      "hours": 1,
      "minutes": 30,
      "seconds": 0,
      "totalSeconds": 5400,
      "humanReadable": "0d 1h 30m 0s"
    }
  }
}
```

### Error Responses:
```json
{
  "success": false,
  "message": "Invalid request",
  "errors": [
    "Challenge ID is required",
    "Farcaster username is required",
    "Vote (yes/no) is required",
    "Stake amount is required"
  ]
}
```
or
```json
{
  "success": false,
  "message": "Challenge not found"
}
```
or
```json
{
  "success": false,
  "message": "Challenge has not ended yet. Voting will start after the challenge ends."
}
```
or
```json
{
  "success": false,
  "message": "Voting period has ended for this challenge"
}
```
or
```json
{
  "success": false,
  "message": "User has already voted on this challenge"
}
```

---

## 🚀 Production URLs

Replace `localhost:3000` with your deployed URL: ["crypto", "tech", "sports"],
  "farcasterWalletAddress": "0x1234567890123456789012345678901234567890"
}
```

### Required Fields:
- `farcasterUsername` (string) - 1-50 characters
- `interests` (array) - Exactly 3 interests from: sports, crypto, entertainment, social network, tech, politics, weather
- `farcasterWalletAddress` (string) - Valid Ethereum address format (0x...)

### Curl Example:
```bash
curl -X POST http://localhost:3000/api/create_user \
  -H "Content-Type: application/json" \
  -d '{
    "farcasterUsername": "dwr",
    "interests": ["crypto", "tech", "sports"],
    "farcasterWalletAddress": "0x1234567890123456789012345678901234567890"
  }'
```

### Success Response (201):
```json
{
  "success": true,
  "message": "User created successfully!",
  "data": {
    "id": "1729598400123_abc456",
    "farcasterUsername": "dwr",
    "interests": ["crypto", "tech", "sports"],
    "farcasterWalletAddress": "0x1234567890123456789012345678901234567890",
    "createdAt": "2025-10-22T10:30:00.000Z"
  }
}
```

### Error Responses:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Valid Farcaster username is required (1-50 characters)",
    "Exactly 3 interests are required from: sports, crypto, entertainment, social network, tech, politics, weather",
    "Valid Farcaster wallet address is required (Ethereum format: 0x...)"
  ]
}
```

---

## 🎯 2. Create Challenge Endpoint

**URL:** `POST /api/create_challenge`
**Content-Type:** `application/json`

### Request Body Fields:
- `Id` (number) - Required//the contract emits id for each challenge
- `farcasterUsername` (string) - Required
- `title` (string) - Min 3 characters
- `category` (string) - One of: sports, crypto, entertainment, social network, tech, politics, weather
- `description` (string) - Min 10 characters
- `winCondition` (string) - Min 5 characters, compulsory
- `socialPlatform` (string) - One of: farcaster, twitter, discord, telegram, other
- `startDate` (string) - DD/MM/YYYY format
- `startTime` (string) - HH:MM:SS format
- `endDate` (string) - DD/MM/YYYY format
- `endTime` (string) - HH:MM:SS format
- `stakeAmount` (number) - Positive number

Note: Voting duration is automatically set based on category:
- sports: 2 hours
- crypto: 2 hours
- entertainment: 3 hours
- social network: 3 hours
- tech: 3 hours
- politics: 2 hours
- weather: 2 hours

### Request Example:
```bash
curl -X POST http://localhost:3000/api/create_challenge \
  -H "Content-Type: application/json" \
  -d '{
    "Id": 1,
    "farcasterUsername": "dwr",
    "title": "Crypto Price Prediction Challenge",
    "category": "crypto",
    "description": "Predict if Bitcoin will reach $100k by end of year",
    "winCondition": "Bitcoin reaches $100,000 USD on any major exchange",
    "socialPlatform": "farcaster",
    "startDate": "23/11/2025",
    "startTime": "00:00:00",
    "endDate": "31/12/2025",
    "endTime": "23:59:59",
    "stakeAmount": 100
  }'
```

### JavaScript Example:
```javascript
const createChallenge = async (challengeData) => {
  const response = await fetch('/api/create_challenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(challengeData)
  });
  
  return response.json();
};

// Usage
const challengeData = {
  Id: 1,
  farcasterUsername: 'dwr',
  title: 'Crypto Price Prediction Challenge',
  category: 'crypto',
  description: 'Predict if Bitcoin will reach $100k by end of year',
  winCondition: 'Bitcoin reaches $100,000 USD on any major exchange',
  socialPlatform: 'farcaster',
  startDate: '23/10/2025',
  startTime: '00:00:00',
  endDate: '31/12/2025',
  endTime: '23:59:59',
  stakeAmount: 100
};

// Convert image to base64 (no longer needed for challenges)
// const imageToBase64 = async (file) => { ... }

// Example with form submission
document.querySelector('#challenge-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const challengeData = {
    Id: parseInt(formData.get('id')),
    farcasterUsername: formData.get('username'),
    title: formData.get('title'),
    category: formData.get('category'),
    description: formData.get('description'),
    winCondition: formData.get('winCondition'),
    socialPlatform: formData.get('socialPlatform'),
    startDate: formData.get('startDate'),
    startTime: formData.get('startTime'),
    endDate: formData.get('endDate'),
    endTime: formData.get('endTime'),
    stakeAmount: parseFloat(formData.get('stakeAmount'))
  };
  const result = await createChallenge(challengeData);
  console.log(result);
});
```

### Success Response (201):
```json
{
  "success": true,
  "message": "Challenge created successfully!",
  "data": {
    "id": "1",
    "title": "Crypto Price Prediction Challenge",
    "category": "crypto",
    "description": "Predict if Bitcoin will reach $100k by end of year",
    "winCondition": "Bitcoin reaches $100,000 USD on any major exchange",
    "startDateTime": "2025-10-23T00:00:00.000Z",
    "endDateTime": "2025-12-31T23:59:59.000Z",
    "voteEndDateTime": "2026-01-01T01:59:59.000Z",
    "stakeAmount": 100,
    "status": "pending",
    "createdAt": "2025-10-22T10:30:00.000Z"
  }
}
```

---

## 📊 3. Live Market Endpoint

**URLs:** 
- `GET /api/live_market` - Get challenges or user votes
- `POST /api/live_market` - Record a vote on a challenge

### GET Query Parameters:
- `farcasterUsername` (optional) - For personalized results based on user interests
- `category` (optional) - Filter by: all, sports, crypto, entertainment, social network, tech, politics, weather
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page
- `sortBy` (optional, default: createdAt) - Sort field
- `sortOrder` (optional, default: desc) - asc or desc
- `status` (optional, default: active) - Challenge status
- `userVotes` (optional, default: false) - When true, returns user's votes instead of challenges (requires farcasterUsername)

### POST Request Body:
```json
{
  "farcasterUsername": "dwr",
  "challengeId": "1729598400123_def789",
  "vote": "yes",
  "stakeAmount": 100
}
```

### POST Required Fields:
- `farcasterUsername` (string) - User casting the vote
- `challengeId` (string) - ID of the challenge being voted on
- `vote` (string) - Must be "yes" or "no"
- `stakeAmount` (number, optional) - Amount to stake on this vote

### Examples:

**Get all active challenges:**
```bash
curl "http://localhost:3000/api/live_market"
```

**Get personalized challenges for user:**
```bash
curl "http://localhost:3000/api/live_market?farcasterUsername=dwr"
```

**Filter by category:**
```bash
curl "http://localhost:3000/api/live_market?category=crypto&page=1&limit=10"
```

**Get user's interest-based challenges:**
```bash
curl "http://localhost:3000/api/live_market?farcasterUsername=dwr&category=all"
```

**Get a user's votes:**
```bash
curl "http://localhost:3000/api/live_market?userVotes=true&farcasterUsername=dwr"
```

**Record a vote:**
```bash
curl -X POST "http://localhost:3000/api/live_market" \
  -H "Content-Type: application/json" \
  -d '{
    "farcasterUsername": "dwr",
    "challengeId": 1,
    "vote": "yes",
    "stakeAmount": 100
  }'
```

### JavaScript Example:
```javascript
const getLiveMarket = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/live_market?${params}`);
  return response.json();
};

const getUserVotes = async (farcasterUsername) => {
  const params = new URLSearchParams({
    userVotes: true,
    farcasterUsername
  });
  const response = await fetch(`/api/live_market?${params}`);
  return response.json();
};

const recordVote = async (voteData) => {
  const response = await fetch('/api/live_market', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(voteData)
  });
  return response.json();
};

// Usage examples:
getLiveMarket(); // All active challenges
getLiveMarket({ farcasterUsername: 'dwr' }); // Personalized
getLiveMarket({ category: 'crypto', page: 1, limit: 10 }); // Filtered

// Get user's votes
getUserVotes('dwr');

// Record a vote
recordVote({
  farcasterUsername: 'dwr',
  challengeId: '1729598400123_def789',
  vote: 'yes',
  stakeAmount: 100
});
```

### Success Response (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "1729598400123_def789",
      "title": "Crypto Price Prediction Challenge",
      "category": "crypto",
      "challengeDetails": "Predict if Bitcoin will reach $100k by end of year",
      "winCondition": "Bitcoin reaches $100,000 USD on any major exchange",
      "socialPlatform": "farcaster",
      "startDateTime": "2025-10-23T00:00:00.000Z",
      "endDateTime": "2025-12-31T23:59:59.000Z",
      "stakeAmount": 100,
      "currentStake": 1500,
      "yesVotes": 12,
      "noVotes": 8,
      "totalVotes": 20,
      "yesPercentage": 60,
      "status": "active",
      "createdAt": "2025-10-22T10:30:00.000Z",
      "farcasterUsername": "dwr",
      "timeRemaining": {
        "expired": false,
        "days": 70,
        "hours": 13,
        "minutes": 29,
        "seconds": 59,
        "totalSeconds": 6089399,
        "humanReadable": "70d 13h 29m 59s"
      },
      "isActive": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 89,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "category": "all",
    "status": "active",
    "userInterests": ["crypto", "tech", "sports"],
    "isPersonalized": true
  },
  "marketStats": {
    "totalChallenges": 156,
    "activeChallenges": 89,
    "totalStaked": 25000,
    "categoriesCount": {
      "crypto": 45,
      "sports": 23,
      "tech": 18,
      "politics": 15,
      "entertainment": 12,
      "social network": 8,
      "weather": 5
    }
  },
  "meta": {
    "sortBy": "createdAt",
    "sortOrder": "desc",
    "availableCategories": ["all", "sports", "crypto", "entertainment", "social network", "tech", "politics", "weather"],
    "timestamp": "2025-10-22T10:30:00.000Z"
  }
}
```

---

## 🔒 Rate Limiting

- **create_user**: 5 requests per hour per IP
- **create_challenge**: 5 requests per hour per IP  
- **live_market**: 100 requests per 15 minutes per IP

---

## 📁 File Storage

~~Banner images are stored in `/uploads/banners/`~~ (Removed - banners no longer supported)
~~Accessible via: `http://localhost:3000/uploads/banners/filename.jpg`~~
~~Supported formats: jpeg, jpg, png, gif, webp~~
~~Max file size: 5MB~~

---

## 🎯 Categories Available

All endpoints use these standardized categories:
- `sports`
- `crypto` 
- `entertainment`
- `social network`
- `tech`
- `politics`
- `weather`

---

## � 4. User Profile Endpoint

**URL:** `GET /api/user_profile`

### Query Parameters:
- `farcasterUsername` (required) - Username to fetch profile for

### Example:
```bash
curl "http://localhost:3000/api/user_profile?farcasterUsername=dwr"
```

### Success Response (200):
```json
{
  "success": true,
  "profile": {
    "id": "1729598400123_abc456",
    "farcasterUsername": "dwr",
    "displayName": "Daniel",
    "interests": ["crypto", "tech", "sports"],
    "createdAt": "2025-10-22T10:30:00.000Z"
  }
}
```

### Error Responses:
```json
{
  "success": false,
  "message": "User not found"
}
```
or
```json
{
  "success": false,
  "message": "Missing farcasterUsername query parameter"
}
```

---

## 🔗 Frontend Integration Guide

### Complete API Endpoints List

This Express.js backend provides 6 main endpoints for your frontend integration:

1. **POST** `/api/create_user` - Create new user
2. **POST** `/api/create_challenge` - Create new challenge
3. **GET** `/api/live_market` - Get challenges/votes
4. **POST** `/api/live_market` - Record vote
5. **GET** `/api/user_profile` - Get user profile
6. **GET** `/api/voting_challenges` - Get voting-ready challenges
7. **POST** `/api/challenge_stake` - Submit stake/vote

### Frontend Integration Examples

#### 1. API Service Class (JavaScript/TypeScript)

```javascript
class StakelyAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Helper method for API calls
  async apiCall(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // 1. Create User
  async createUser(userData) {
    return this.apiCall('/api/create_user', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // 2. Create Challenge
  async createChallenge(challengeData) {
    return this.apiCall('/api/create_challenge', {
      method: 'POST',
      body: JSON.stringify(challengeData)
    });
  }

  // 3. Get Live Market Data
  async getLiveMarket(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/live_market?${params}`);
  }

  // 4. Record Vote
  async recordVote(voteData) {
    return this.apiCall('/api/live_market', {
      method: 'POST',
      body: JSON.stringify(voteData)
    });
  }

  // 5. Get User Profile
  async getUserProfile(farcasterUsername) {
    return this.apiCall(`/api/user_profile?farcasterUsername=${farcasterUsername}`);
  }

  // 6. Get Voting Challenges
  async getVotingChallenges(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/voting_challenges?${params}`);
  }

  // 7. Submit Challenge Stake
  async submitStake(stakeData) {
    return this.apiCall('/api/challenge_stake', {
      method: 'POST',
      body: JSON.stringify(stakeData)
    });
  }

  // Helper: Convert file to base64 (removed - no longer needed)
  // async fileToBase64(file) { ... }
}

// Initialize API service
const api = new StakelyAPI();
```

#### 2. Frontend Usage Examples

##### A. User Registration Form
```javascript
// User Registration
async function handleUserRegistration(formData) {
  try {
    const userData = {
      farcasterUsername: formData.username,
      interests: formData.selectedInterests, // Array of 3 interests
      farcasterWalletAddress: formData.walletAddress
    };

    const response = await api.createUser(userData);
    console.log('User created:', response.data);
    
    // Handle success
    showSuccessMessage('Account created successfully!');
    redirectToProfile(response.data.id);
    
  } catch (error) {
    console.error('Registration failed:', error);
    showErrorMessage(error.message);
  }
}

// Example form data
const exampleUserData = {
  username: "johndoe",
  selectedInterests: ["crypto", "tech", "sports"],
  walletAddress: "0x1234567890123456789012345678901234567890"
};
```

##### B. Challenge Creation
```javascript
// Challenge Creation
async function handleChallengeCreation(formData) {
  try {
    const challengeData = {
      Id: formData.contractId, // Number from smart contract
      farcasterUsername: formData.username,
      title: formData.title,
      category: formData.category,
      description: formData.description,
      winCondition: formData.winCondition,
      socialPlatform: formData.platform,
      startDate: formData.startDate, // DD/MM/YYYY
      startTime: formData.startTime, // HH:MM:SS
      endDate: formData.endDate,
      endTime: formData.endTime,
      stakeAmount: parseFloat(formData.stakeAmount)
    };

    const response = await api.createChallenge(challengeData);
    console.log('Challenge created:', response.data);
    
    showSuccessMessage('Challenge created successfully!');
    redirectToChallengeView(response.data.id);
    
  } catch (error) {
    console.error('Challenge creation failed:', error);
    showErrorMessage(error.message);
  }
}
```

##### C. Live Market Display
```javascript
// Get and Display Challenges
async function loadLiveMarket(page = 1, category = 'all') {
  try {
    const filters = {
      page: page,
      limit: 10,
      category: category,
      status: 'active',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    const response = await api.getLiveMarket(filters);
    
    // Display challenges in UI
    displayChallenges(response.data);
    updatePagination(response.pagination);
    updateMarketStats(response.marketStats);
    
  } catch (error) {
    console.error('Failed to load market:', error);
    showErrorMessage('Failed to load challenges');
  }
}

// Display function example
function displayChallenges(challenges) {
  const container = document.getElementById('challenges-container');
  container.innerHTML = '';
  
  challenges.forEach(challenge => {
    const challengeCard = createChallengeCard(challenge);
    container.appendChild(challengeCard);
  });
}

function createChallengeCard(challenge) {
  return `
    <div class="challenge-card" data-id="${challenge.id}">
      <h3>${challenge.title}</h3>
      <p>${challenge.challengeDetails}</p>
      <div class="stats">
        <span>Yes: ${challenge.yesPercentage}%</span>
        <span>Total Votes: ${challenge.totalVotes}</span>
        <span>Stake: $${challenge.currentStake}</span>
      </div>
      <div class="time-remaining">${challenge.timeRemaining.humanReadable}</div>
      <button onclick="voteOnChallenge('${challenge.id}')">Vote</button>
    </div>
  `;
}
```

##### D. Voting System
```javascript
// Vote on Challenge
async function voteOnChallenge(challengeId, vote, stakeAmount) {
  try {
    const voteData = {
      farcasterUsername: getCurrentUser().username,
      challengeId: parseInt(challengeId), // Ensure it's a number
      vote: vote, // "yes" or "no"
      stakeAmount: parseFloat(stakeAmount)
    };

    const response = await api.recordVote(voteData);
    console.log('Vote recorded:', response);
    
    // Update UI with new vote data
    updateChallengeStats(challengeId, response.data);
    showSuccessMessage('Vote recorded successfully!');
    
  } catch (error) {
    console.error('Voting failed:', error);
    showErrorMessage(error.message);
  }
}

// Stake on Voting Challenge
async function stakeOnChallenge(challengeId, vote, stakeAmount) {
  try {
    const stakeData = {
      challengeId: parseInt(challengeId),
      farcasterUsername: getCurrentUser().username,
      vote: vote,
      stakeAmount: parseFloat(stakeAmount)
    };

    const response = await api.submitStake(stakeData);
    console.log('Stake submitted:', response);
    
    updateStakePool(challengeId, response.data.stakePool);
    showSuccessMessage('Stake submitted successfully!');
    
  } catch (error) {
    console.error('Staking failed:', error);
    showErrorMessage(error.message);
  }
}
```

##### E. User Profile Management
```javascript
// Load User Profile
async function loadUserProfile(username) {
  try {
    const response = await api.getUserProfile(username);
    
    // Display profile data
    displayUserProfile(response.profile);
    
  } catch (error) {
    console.error('Failed to load profile:', error);
    showErrorMessage('Profile not found');
  }
}

function displayUserProfile(profile) {
  document.getElementById('username').textContent = profile.farcasterUsername;
  document.getElementById('wallet').textContent = profile.farcasterWalletAddress;
  document.getElementById('interests').innerHTML = profile.interests
    .map(interest => `<span class="interest-tag">${interest}</span>`)
    .join('');
  document.getElementById('member-since').textContent = 
    new Date(profile.createdAt).toLocaleDateString();
}
```

#### 3. React Integration Example

```jsx
// React Hook for API Integration
import { useState, useEffect } from 'react';

// Custom hook for live market data
function useLiveMarket(filters = {}) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchChallenges() {
      try {
        setLoading(true);
        const response = await api.getLiveMarket(filters);
        setChallenges(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchChallenges();
  }, [JSON.stringify(filters)]);

  return { challenges, loading, error };
}

// React Component Example
function ChallengeList({ category = 'all' }) {
  const { challenges, loading, error } = useLiveMarket({ category });

  if (loading) return <div>Loading challenges...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="challenge-list">
      {challenges.map(challenge => (
        <ChallengeCard key={challenge.id} challenge={challenge} />
      ))}
    </div>
  );
}

function ChallengeCard({ challenge }) {
  const [voting, setVoting] = useState(false);

  const handleVote = async (vote, stakeAmount) => {
    setVoting(true);
    try {
      await api.recordVote({
        farcasterUsername: 'current-user',
        challengeId: challenge.id,
        vote,
        stakeAmount
      });
      // Refresh data or update state
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className="challenge-card">
      <h3>{challenge.title}</h3>
      <p>{challenge.challengeDetails}</p>
      <div className="voting-section">
        <button 
          onClick={() => handleVote('yes', 100)}
          disabled={voting}
        >
          Vote Yes ({challenge.yesPercentage}%)
        </button>
        <button 
          onClick={() => handleVote('no', 100)}
          disabled={voting}
        >
          Vote No ({100 - challenge.yesPercentage}%)
        </button>
      </div>
    </div>
  );
}
```

#### 4. Error Handling & Validation

```javascript
// Error handling utilities
function handleAPIError(error) {
  if (error.errors && Array.isArray(error.errors)) {
    // Multiple validation errors
    error.errors.forEach(err => showErrorMessage(err));
  } else {
    // Single error message
    showErrorMessage(error.message || 'An unexpected error occurred');
  }
}

// Form validation helpers
function validateUserData(userData) {
  const errors = [];
  
  if (!userData.farcasterUsername || userData.farcasterUsername.length < 1 || userData.farcasterUsername.length > 50) {
    errors.push('Username must be 1-50 characters');
  }
  
  if (!userData.interests || userData.interests.length !== 3) {
    errors.push('Exactly 3 interests must be selected');
  }
  
  if (!userData.farcasterWalletAddress || !userData.farcasterWalletAddress.startsWith('0x')) {
    errors.push('Valid Ethereum wallet address required');
  }
  
  return errors;
}

function validateChallengeData(challengeData) {
  const errors = [];
  
  if (typeof challengeData.Id !== 'number') {
    errors.push('Challenge ID must be a number');
  }
  
  if (!challengeData.title || challengeData.title.length < 3) {
    errors.push('Title must be at least 3 characters');
  }
  
  // Add more validations as needed
  
  return errors;
}
```

#### 5. Real-time Updates (Optional)

```javascript
// Polling for live updates
class LiveUpdater {
  constructor(api, updateInterval = 30000) {
    this.api = api;
    this.updateInterval = updateInterval;
    this.intervals = new Map();
  }

  startPolling(challengeId, callback) {
    const interval = setInterval(async () => {
      try {
        const response = await this.api.getLiveMarket({
          challengeId: challengeId
        });
        callback(response.data[0]);
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, this.updateInterval);

    this.intervals.set(challengeId, interval);
  }

  stopPolling(challengeId) {
    const interval = this.intervals.get(challengeId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(challengeId);
    }
  }

  stopAllPolling() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}

// Usage
const liveUpdater = new LiveUpdater(api);
liveUpdater.startPolling('challenge-123', (updatedChallenge) => {
  updateChallengeCard(updatedChallenge);
});
```

---

## � Recent Updates

### Banner Field Removal (Latest Update)
- **Removed** `banner` field requirement from `/api/create_challenge` endpoint
- **Simplified** challenge creation - no longer requires image uploads
- **Updated** all documentation examples to remove banner references
- **Removed** multer dependency and file upload handling
- **Streamlined** validation process for better performance

### Key Changes:
1. Challenge creation now accepts standard JSON payload (no multipart/form-data)
2. Removed banner validation and file storage logic
3. Simplified frontend integration - no base64 encoding needed
4. Faster challenge creation process
5. Reduced server storage requirements

---

## �🚀 Production URLs

Replace `localhost:3000` with your deployed URL:
```
https://your-app-name.onrender.com/api/create_user
https://your-app-name.onrender.com/api/create_challenge  
https://your-app-name.onrender.com/api/live_market
https://your-app-name.onrender.com/api/user_profile
https://your-app-name.onrender.com/api/voting_challenges
https://your-app-name.onrender.com/api/challenge_stake
```