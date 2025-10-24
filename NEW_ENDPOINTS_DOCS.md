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
  "challengeId": "1729598400123_def789",
  "farcasterUsername": "dwr",
  "vote": "yes",
  "stakeAmount": 100
}
```

### Required Fields:
- `challengeId` (string) - ID of the challenge to stake on
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
**Content-Type:** `multipart/form-data` (for file upload)

### Form Data Fields:
- `Id` (string) - Required//the contract emmits id for each challenge
- `farcasterUsername` (string) - Required
- `title` (string) - Min 3 characters
- `category` (string) - One of: sports, crypto, entertainment, social network, tech, politics, weather
- `banner` (file) - Image file (jpeg, jpg, png, gif, webp) - Max 5MB
- `description` (string) - Min 10 characters
- `winCondition` (string) - Min 5 characters, compulsory
- `socialPlatform` (string) - One of: farcaster, twitter, discord, telegram, other
- `startDate` (string) - DD/MM/YYYY format
- `startTime` (string) - HH:MM:SS format
- `endDate` (string) - DD/MM/YYYY format
- `endTime` (string) - HH:MM:SS format
- `stakeAmount` (number) - Positive number
- `voteDuration` (string) - Voting period after challenge end time {
  sports for 2 hrs
  crypto for 2hrs
  entertainment for 3hrs
  social network for 3 hrs
  tech for 3 hrs
  politics for 2 hrs
  weather for 2 hrs
}



### Curl Example:
```bash
curl -X POST http://localhost:3000/api/create_challenge \
  -F "farcasterUsername=dwr" \
  -F "title=Crypto Price Prediction Challenge" \
  -F "category=crypto" \
  -F "banner=@/path/to/banner.jpg" \
  -F "description=Predict if Bitcoin will reach $100k by end of year" \
  -F "winCondition=Bitcoin reaches $100,000 USD on any major exchange" \
  -F "socialPlatform=farcaster" \
  -F "startDate=23/10/2025" \
  -F "startTime=00:00:00" \
  -F "endDate=31/12/2025" \
  -F "endTime=23:59:59" \
  -F "stakeAmount=100"
```

### JavaScript Example (with FormData):
```javascript
const createChallenge = async (challengeData, bannerFile) => {
  const formData = new FormData();
  
  // Add all text fields
  Object.keys(challengeData).forEach(key => {
    formData.append(key, challengeData[key]);
  });
  
  // Add banner file
  formData.append('banner', bannerFile);
  
  const response = await fetch('/api/create_challenge', {
    method: 'POST',
    body: formData
  });
  
  return response.json();
};

// Usage
const challengeData = {
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
  stakeAmount: '100'
};

createChallenge(challengeData, bannerFile);
```

### Success Response (201):
```json
{
  "success": true,
  "message": "Challenge created successfully!",
  "data": {
    "id": "1729598400123_def789",
    "title": "Crypto Price Prediction Challenge",
    "category": "crypto",
    "bannerUrl": "/uploads/banners/banner-1729598400123-123456789.jpg",
    "startDateTime": "2025-10-23T00:00:00.000Z",
    "endDateTime": "2025-12-31T23:59:59.000Z",
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
    "challengeId": "1729598400123_def789",
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
      "bannerUrl": "/uploads/banners/banner-1729598400123-123456789.jpg",
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

- Banner images are stored in `/uploads/banners/`
- Accessible via: `http://localhost:3000/uploads/banners/filename.jpg`
- Supported formats: jpeg, jpg, png, gif, webp
- Max file size: 5MB

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