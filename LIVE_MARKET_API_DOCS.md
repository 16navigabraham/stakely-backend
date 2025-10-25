# Live Market API Documentation

## 📊 `/api/live_market` Endpoint Guide

The `/api/live_market` endpoint is the **central hub** for challenge marketplace functionality, handling both data retrieval and user voting interactions.

---

## 🔍 Endpoint Overview

### **Dual-Purpose Endpoint:**
- **GET** `/api/live_market` - Retrieve challenges and voting data
- **POST** `/api/live_market` - Submit votes on challenges

### **Key Features:**
- ✅ **Filtering & Pagination** - Sort, filter, and paginate results
- ✅ **Personalization** - User-based recommendations
- ✅ **Real-time Stats** - Live voting statistics and market data
- ✅ **User Vote History** - Track individual voting patterns
- ✅ **Category-based Filtering** - Filter by challenge categories
- ✅ **Challenge Status Management** - Handle different challenge states

---

## 🔧 GET Request - Data Retrieval

### **Base URL:**
```
GET http://localhost:3000/api/live_market
```

### **Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `farcasterUsername` | string | - | Optional - enables personalization based on user interests |
| `category` | string | `"all"` | Filter by category: all, sports, crypto, entertainment, social network, tech, politics, weather |
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `20` | Items per page (max 100) |
| `sortBy` | string | `"createdAt"` | Sort field: createdAt, endDateTime, totalVotes, currentStake |
| `sortOrder` | string | `"desc"` | Sort order: asc, desc |
| `status` | string | `"active"` | Challenge status: **active** (currently running), **pending** (not yet started), **completed** (finished), **all** (any status) |
| `userVotes` | boolean | `false` | When true, returns user's votes instead of challenges |

> **⚠️ Important:** The default `status=active` only returns challenges that are currently active (between their start and end times). If no challenges are currently active, this will return an empty array. Use `status=pending` to see upcoming challenges or `status=all` to see all challenges regardless of status.

### **Request Examples:**

#### 1. Get All Active Challenges (Currently Running)
```bash
curl "http://localhost:3000/api/live_market"
# or explicitly:
curl "http://localhost:3000/api/live_market?status=active"
```

#### 2. Get All Pending Challenges (Not Yet Started)
```bash
curl "http://localhost:3000/api/live_market?status=pending"
```

#### 3. Get All Challenges (Regardless of Status)
```bash
curl "http://localhost:3000/api/live_market?status=all"
```

#### 4. Get Personalized Challenges for User
```bash
curl "http://localhost:3000/api/live_market?farcasterUsername=dwr&status=pending"
```

#### 5. Filter by Category with Pagination
```bash
curl "http://localhost:3000/api/live_market?category=crypto&page=1&limit=10&status=pending"
```

#### 6. Get User's Voting History
```bash
curl "http://localhost:3000/api/live_market?userVotes=true&farcasterUsername=dwr"
```

#### 7. Sort by Most Staked
```bash
curl "http://localhost:3000/api/live_market?sortBy=currentStake&sortOrder=desc&status=all"
```

### **Success Response Structure:**

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Crypto Price Prediction Challenge",
      "category": "crypto",
      "challengeDetails": "Predict if Bitcoin will reach $100k by end of year",
      "winCondition": "Bitcoin reaches $100,000 USD on any major exchange",
      "socialPlatform": "farcaster",
      "startDateTime": "2025-10-23T00:00:00.000Z",
      "endDateTime": "2025-12-31T23:59:59.000Z",
      "voteEndDateTime": "2026-01-01T01:59:59.000Z",
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
    "category": "crypto",
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

## 📝 POST Request - Vote Submission

### **Base URL:**
```
POST http://localhost:3000/api/live_market
```

### **Request Body:**
```json
{
  "farcasterUsername": "dwr",
  "challengeId": 1,
  "vote": "yes",
  "stakeAmount": 100
}
```

### **Required Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `farcasterUsername` | string | User casting the vote |
| `challengeId` | number | ID of the challenge being voted on |
| `vote` | string | Must be "yes" or "no" |
| `stakeAmount` | number | Optional - amount to stake on this vote |

### **Request Example:**
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

### **Success Response:**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "data": {
    "challengeId": 1,
    "voteRecorded": {
      "vote": "yes",
      "stakeAmount": 100,
      "timestamp": "2025-10-25T10:30:00.000Z"
    },
    "updatedStats": {
      "totalVotes": 21,
      "yesVotes": 13,
      "noVotes": 8,
      "yesPercentage": 62,
      "currentStake": 1600
    }
  }
}
```

### **Error Responses:**

#### Validation Errors:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Challenge ID must be a number",
    "Farcaster username is required",
    "Vote must be 'yes' or 'no'",
    "Stake amount must be a positive number"
  ]
}
```

#### Challenge Not Found:
```json
{
  "success": false,
  "message": "Challenge not found"
}
```

#### Challenge Inactive:
```json
{
  "success": false,
  "message": "Challenge is not active for voting"
}
```

#### Duplicate Vote:
```json
{
  "success": false,
  "message": "User has already voted on this challenge"
}
```

---

## 🚀 Frontend Implementation Guide

### **1. Complete API Service Class**

```javascript
class LiveMarketAPI {
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

  // GET: Fetch all active challenges
  async getAllChallenges(filters = {}) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/live_market?${params}`);
  }

  // GET: Fetch personalized challenges for user
  async getPersonalizedChallenges(username, additionalFilters = {}) {
    const params = new URLSearchParams({
      farcasterUsername: username,
      ...additionalFilters
    });
    return this.apiCall(`/api/live_market?${params}`);
  }

  // GET: Fetch challenges by category
  async getChallengesByCategory(category, page = 1, limit = 10) {
    const params = new URLSearchParams({
      category,
      page: page.toString(),
      limit: limit.toString()
    });
    return this.apiCall(`/api/live_market?${params}`);
  }

  // GET: Fetch user's voting history
  async getUserVotes(username) {
    const params = new URLSearchParams({
      userVotes: 'true',
      farcasterUsername: username
    });
    return this.apiCall(`/api/live_market?${params}`);
  }

  // GET: Advanced filtering
  async getFilteredChallenges(filters) {
    const params = new URLSearchParams(filters);
    return this.apiCall(`/api/live_market?${params}`);
  }

  // POST: Submit a vote
  async submitVote(voteData) {
    return this.apiCall('/api/live_market', {
      method: 'POST',
      body: JSON.stringify(voteData)
    });
  }
}

// Initialize API
const liveMarketAPI = new LiveMarketAPI();
```

### **2. Challenge Display Component (Vanilla JS)**

```javascript
class ChallengeManager {
  constructor(containerId = 'challenges-container') {
    this.container = document.getElementById(containerId);
    this.currentFilters = {};
    this.currentPage = 1;
    this.isLoading = false;
  }

  // Load and display challenges
  async loadChallenges(filters = {}) {
    if (this.isLoading) return;
    
    try {
      this.isLoading = true;
      this.showLoading();
      
      const response = await liveMarketAPI.getAllChallenges({
        ...this.currentFilters,
        ...filters,
        page: this.currentPage
      });

      this.displayChallenges(response.data);
      this.updatePagination(response.pagination);
      this.updateMarketStats(response.marketStats);
      this.updateFiltersUI(response.filters);
      
    } catch (error) {
      this.showError('Failed to load challenges: ' + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  // Display challenges in UI
  displayChallenges(challenges) {
    this.container.innerHTML = '';
    
    if (challenges.length === 0) {
      this.container.innerHTML = `
        <div class="no-challenges">
          <h3>No challenges found</h3>
          <p>Try adjusting your filters or check back later.</p>
        </div>
      `;
      return;
    }

    challenges.forEach(challenge => {
      const challengeCard = this.createChallengeCard(challenge);
      this.container.appendChild(challengeCard);
    });
  }

  // Create individual challenge card
  createChallengeCard(challenge) {
    const card = document.createElement('div');
    card.className = 'challenge-card';
    card.dataset.challengeId = challenge.id;

    const timeRemainingClass = challenge.timeRemaining.expired ? 'expired' : 'active';
    const statusClass = challenge.status.toLowerCase();

    card.innerHTML = `
      <div class="challenge-header">
        <h3 class="challenge-title">${challenge.title}</h3>
        <div class="challenge-meta">
          <span class="challenge-category category-${challenge.category}">${challenge.category}</span>
          <span class="challenge-status status-${statusClass}">${challenge.status}</span>
        </div>
      </div>
      
      <div class="challenge-content">
        <p class="challenge-description">${challenge.challengeDetails}</p>
        <div class="win-condition">
          <strong>Win Condition:</strong> ${challenge.winCondition}
        </div>
      </div>
      
      <div class="challenge-stats">
        <div class="vote-distribution">
          <div class="vote-bar">
            <div class="yes-bar" style="width: ${challenge.yesPercentage}%"></div>
            <div class="no-bar" style="width: ${100 - challenge.yesPercentage}%"></div>
          </div>
          <div class="vote-numbers">
            <span class="yes-votes">YES: ${challenge.yesPercentage}% (${challenge.yesVotes})</span>
            <span class="no-votes">NO: ${100 - challenge.yesPercentage}% (${challenge.noVotes})</span>
          </div>
        </div>
        
        <div class="challenge-meta-stats">
          <div class="stat">
            <span class="label">Total Stake:</span>
            <span class="value">$${challenge.currentStake.toLocaleString()}</span>
          </div>
          <div class="stat">
            <span class="label">Total Votes:</span>
            <span class="value">${challenge.totalVotes}</span>
          </div>
          <div class="stat">
            <span class="label">Time Remaining:</span>
            <span class="value ${timeRemainingClass}">${challenge.timeRemaining.humanReadable}</span>
          </div>
        </div>
      </div>
      
      <div class="voting-section">
        <div class="stake-input-group">
          <label for="stake-${challenge.id}">Stake Amount:</label>
          <input type="number" 
                 id="stake-${challenge.id}"
                 class="stake-amount" 
                 placeholder="Enter amount"
                 min="1"
                 value="100">
        </div>
        
        <div class="vote-buttons">
          <button class="vote-btn vote-yes" 
                  onclick="challengeManager.handleVote('${challenge.id}', 'yes')"
                  ${challenge.timeRemaining.expired ? 'disabled' : ''}>
            ${challenge.timeRemaining.expired ? 'Voting Ended' : 'Vote YES'}
          </button>
          <button class="vote-btn vote-no" 
                  onclick="challengeManager.handleVote('${challenge.id}', 'no')"
                  ${challenge.timeRemaining.expired ? 'disabled' : ''}>
            ${challenge.timeRemaining.expired ? 'Voting Ended' : 'Vote NO'}
          </button>
        </div>
      </div>
      
      <div class="challenge-footer">
        <span class="creator">Created by @${challenge.farcasterUsername}</span>
        <span class="created-date">${new Date(challenge.createdAt).toLocaleDateString()}</span>
      </div>
    `;

    return card;
  }

  // Handle voting
  async handleVote(challengeId, vote) {
    const card = document.querySelector(`[data-challenge-id="${challengeId}"]`);
    const stakeInput = card.querySelector('.stake-amount');
    const stakeAmount = parseFloat(stakeInput.value) || 100;

    // Validate stake amount
    if (stakeAmount < 1) {
      this.showErrorMessage('Stake amount must be at least 1');
      return;
    }

    try {
      // Disable voting buttons
      this.setVotingState(challengeId, true);

      const voteData = {
        farcasterUsername: this.getCurrentUser().username,
        challengeId: parseInt(challengeId),
        vote: vote,
        stakeAmount: stakeAmount
      };

      const response = await liveMarketAPI.submitVote(voteData);
      
      // Update UI with new data
      this.updateChallengeStats(challengeId, response.data.updatedStats);
      this.showSuccessMessage(`Vote "${vote.toUpperCase()}" recorded successfully!`);
      
      // Refresh the challenge list to get latest data
      setTimeout(() => this.loadChallenges(), 1000);
      
    } catch (error) {
      this.showErrorMessage('Voting failed: ' + error.message);
    } finally {
      // Re-enable voting buttons
      this.setVotingState(challengeId, false);
    }
  }

  // Set voting button states
  setVotingState(challengeId, isVoting) {
    const card = document.querySelector(`[data-challenge-id="${challengeId}"]`);
    const buttons = card.querySelectorAll('.vote-btn');
    const stakeInput = card.querySelector('.stake-amount');
    
    buttons.forEach(btn => {
      btn.disabled = isVoting;
      if (isVoting) {
        btn.classList.add('voting');
        btn.textContent = btn.classList.contains('vote-yes') ? 'Voting...' : 'Voting...';
      } else {
        btn.classList.remove('voting');
        btn.textContent = btn.classList.contains('vote-yes') ? 'Vote YES' : 'Vote NO';
      }
    });

    stakeInput.disabled = isVoting;
  }

  // Update challenge statistics in real-time
  updateChallengeStats(challengeId, newStats) {
    const card = document.querySelector(`[data-challenge-id="${challengeId}"]`);
    if (!card) return;

    // Update vote bar
    const yesBar = card.querySelector('.yes-bar');
    const noBar = card.querySelector('.no-bar');
    yesBar.style.width = `${newStats.yesPercentage}%`;
    noBar.style.width = `${100 - newStats.yesPercentage}%`;

    // Update vote numbers
    const yesVotes = card.querySelector('.yes-votes');
    const noVotes = card.querySelector('.no-votes');
    yesVotes.textContent = `YES: ${newStats.yesPercentage}% (${newStats.yesVotes})`;
    noVotes.textContent = `NO: ${100 - newStats.yesPercentage}% (${newStats.noVotes})`;

    // Update stake amount
    const stakeValue = card.querySelector('.challenge-meta-stats .value');
    if (stakeValue) {
      stakeValue.textContent = `$${newStats.currentStake.toLocaleString()}`;
    }
  }

  // Filter challenges by category
  async filterByCategory(category) {
    this.currentFilters.category = category;
    this.currentPage = 1;
    await this.loadChallenges();
    this.updateCategoryFilterUI(category);
  }

  // Sort challenges
  async sortChallenges(sortBy, sortOrder = 'desc') {
    this.currentFilters.sortBy = sortBy;
    this.currentFilters.sortOrder = sortOrder;
    this.currentPage = 1;
    await this.loadChallenges();
  }

  // Pagination
  async goToPage(page) {
    this.currentPage = page;
    await this.loadChallenges();
  }

  // Update pagination UI
  updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination-container');
    if (!paginationContainer || !pagination) return;

    paginationContainer.innerHTML = `
      <div class="pagination">
        <button onclick="challengeManager.goToPage(${pagination.currentPage - 1})" 
                ${!pagination.hasPrev ? 'disabled' : ''}>
          Previous
        </button>
        
        <span class="page-info">
          Page ${pagination.currentPage} of ${pagination.totalPages}
          (${pagination.totalItems} total challenges)
        </span>
        
        <button onclick="challengeManager.goToPage(${pagination.currentPage + 1})" 
                ${!pagination.hasNext ? 'disabled' : ''}>
          Next
        </button>
      </div>
    `;
  }

  // Update market statistics
  updateMarketStats(marketStats) {
    const statsContainer = document.getElementById('market-stats');
    if (!statsContainer || !marketStats) return;

    statsContainer.innerHTML = `
      <div class="market-overview">
        <div class="stat-card">
          <h4>Total Challenges</h4>
          <span class="stat-number">${marketStats.totalChallenges}</span>
        </div>
        <div class="stat-card">
          <h4>Active Challenges</h4>
          <span class="stat-number">${marketStats.activeChallenges}</span>
        </div>
        <div class="stat-card">
          <h4>Total Staked</h4>
          <span class="stat-number">$${marketStats.totalStaked.toLocaleString()}</span>
        </div>
      </div>
      
      <div class="category-breakdown">
        <h4>Categories</h4>
        <div class="category-stats">
          ${Object.entries(marketStats.categoriesCount)
            .map(([category, count]) => 
              `<div class="category-stat">
                <span class="category-name">${category}</span>
                <span class="category-count">${count}</span>
              </div>`
            ).join('')}
        </div>
      </div>
    `;
  }

  // Get current user (implement based on your auth system)
  getCurrentUser() {
    // Replace with your actual user authentication logic
    return {
      username: localStorage.getItem('farcasterUsername') || 'anonymous'
    };
  }

  // Utility methods
  showLoading() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading challenges...</p>
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="challengeManager.loadChallenges()">Try Again</button>
      </div>
    `;
  }

  showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showErrorMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Initialize challenge manager
const challengeManager = new ChallengeManager();

// Auto-load challenges when page loads
document.addEventListener('DOMContentLoaded', () => {
  challengeManager.loadChallenges();
});
```

### **3. React Implementation**

```jsx
import React, { useState, useEffect, useCallback } from 'react';

// Custom hook for live market data
function useLiveMarket(filters = {}) {
  const [data, setData] = useState({
    challenges: [],
    pagination: null,
    marketStats: null,
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await liveMarketAPI.getAllChallenges(filters);
      
      setData({
        challenges: response.data,
        pagination: response.pagination,
        marketStats: response.marketStats,
        loading: false,
        error: null
      });
    } catch (error) {
      setData(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message 
      }));
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}

// Main component
function LiveMarket() {
  const [filters, setFilters] = useState({
    category: 'all',
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [currentUser] = useState({
    username: localStorage.getItem('farcasterUsername') || 'anonymous'
  });

  const { challenges, pagination, marketStats, loading, error, refetch } = useLiveMarket(filters);

  const handleCategoryFilter = (category) => {
    setFilters(prev => ({ ...prev, category, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSort = (sortBy, sortOrder = 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="live-market">
      <header className="market-header">
        <h1>Live Market</h1>
        <MarketStats stats={marketStats} />
      </header>

      <div className="market-controls">
        <CategoryFilter 
          onCategoryChange={handleCategoryFilter}
          currentCategory={filters.category}
        />
        
        <SortOptions
          onSortChange={handleSort}
          currentSort={{ sortBy: filters.sortBy, sortOrder: filters.sortOrder }}
        />
      </div>

      <ChallengeGrid 
        challenges={challenges} 
        currentUser={currentUser}
        onVoteSuccess={refetch}
      />

      <Pagination 
        pagination={pagination}
        onPageChange={handlePageChange}
      />
    </div>
  );
}

// Challenge Card Component
function ChallengeCard({ challenge, currentUser, onVoteSuccess }) {
  const [voting, setVoting] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(100);

  const handleVote = async (vote) => {
    if (stakeAmount < 1) {
      alert('Stake amount must be at least 1');
      return;
    }

    setVoting(true);
    try {
      await liveMarketAPI.submitVote({
        farcasterUsername: currentUser.username,
        challengeId: challenge.id,
        vote,
        stakeAmount
      });
      
      // Show success message
      alert(`Vote "${vote.toUpperCase()}" recorded successfully!`);
      
      // Trigger refresh
      onVoteSuccess();
      
    } catch (error) {
      alert('Voting failed: ' + error.message);
    } finally {
      setVoting(false);
    }
  };

  const isExpired = challenge.timeRemaining.expired;

  return (
    <div className={`challenge-card status-${challenge.status.toLowerCase()}`}>
      <div className="challenge-header">
        <h3>{challenge.title}</h3>
        <div className="meta">
          <span className={`category category-${challenge.category}`}>
            {challenge.category}
          </span>
          <span className={`status status-${challenge.status.toLowerCase()}`}>
            {challenge.status}
          </span>
        </div>
      </div>

      <div className="challenge-content">
        <p>{challenge.challengeDetails}</p>
        <div className="win-condition">
          <strong>Win Condition:</strong> {challenge.winCondition}
        </div>
      </div>

      <div className="vote-stats">
        <div className="vote-bar">
          <div 
            className="yes-bar"
            style={{ width: `${challenge.yesPercentage}%` }}
          />
          <div 
            className="no-bar"
            style={{ width: `${100 - challenge.yesPercentage}%` }}
          />
        </div>
        <div className="vote-numbers">
          <span className="yes-votes">
            YES: {challenge.yesPercentage}% ({challenge.yesVotes})
          </span>
          <span className="no-votes">
            NO: {100 - challenge.yesPercentage}% ({challenge.noVotes})
          </span>
        </div>
      </div>

      <div className="challenge-stats">
        <div className="stat">
          <span className="label">Total Stake:</span>
          <span className="value">${challenge.currentStake.toLocaleString()}</span>
        </div>
        <div className="stat">
          <span className="label">Total Votes:</span>
          <span className="value">{challenge.totalVotes}</span>
        </div>
        <div className="stat">
          <span className="label">Time Remaining:</span>
          <span className={`value ${isExpired ? 'expired' : 'active'}`}>
            {challenge.timeRemaining.humanReadable}
          </span>
        </div>
      </div>

      <div className="voting-section">
        <div className="stake-input">
          <label>Stake Amount:</label>
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(Number(e.target.value))}
            placeholder="Enter amount"
            min="1"
            disabled={voting || isExpired}
          />
        </div>
        
        <div className="vote-buttons">
          <button
            onClick={() => handleVote('yes')}
            disabled={voting || isExpired}
            className="vote-yes"
          >
            {voting ? 'Voting...' : isExpired ? 'Voting Ended' : 'Vote YES'}
          </button>
          <button
            onClick={() => handleVote('no')}
            disabled={voting || isExpired}
            className="vote-no"
          >
            {voting ? 'Voting...' : isExpired ? 'Voting Ended' : 'Vote NO'}
          </button>
        </div>
      </div>

      <div className="challenge-footer">
        <span className="creator">Created by @{challenge.farcasterUsername}</span>
        <span className="created-date">
          {new Date(challenge.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

// Supporting Components
function LoadingSpinner() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading challenges...</p>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <h3>Error</h3>
      <p>{message}</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  );
}

function MarketStats({ stats }) {
  if (!stats) return null;
  
  return (
    <div className="market-stats">
      <div className="stat-cards">
        <div className="stat-card">
          <h4>Total Challenges</h4>
          <span className="number">{stats.totalChallenges}</span>
        </div>
        <div className="stat-card">
          <h4>Active Challenges</h4>
          <span className="number">{stats.activeChallenges}</span>
        </div>
        <div className="stat-card">
          <h4>Total Staked</h4>
          <span className="number">${stats.totalStaked.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function CategoryFilter({ onCategoryChange, currentCategory }) {
  const categories = [
    'all', 'sports', 'crypto', 'entertainment', 
    'social network', 'tech', 'politics', 'weather'
  ];

  return (
    <div className="category-filter">
      <label>Filter by Category:</label>
      <select 
        value={currentCategory} 
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        {categories.map(category => (
          <option key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

function SortOptions({ onSortChange, currentSort }) {
  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'currentStake-desc', label: 'Highest Stake' },
    { value: 'totalVotes-desc', label: 'Most Voted' },
    { value: 'endDateTime-asc', label: 'Ending Soon' }
  ];

  const currentValue = `${currentSort.sortBy}-${currentSort.sortOrder}`;

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-');
    onSortChange(sortBy, sortOrder);
  };

  return (
    <div className="sort-options">
      <label>Sort by:</label>
      <select 
        value={currentValue} 
        onChange={(e) => handleSortChange(e.target.value)}
      >
        {sortOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChallengeGrid({ challenges, currentUser, onVoteSuccess }) {
  if (challenges.length === 0) {
    return (
      <div className="no-challenges">
        <h3>No challenges found</h3>
        <p>Try adjusting your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="challenge-grid">
      {challenges.map(challenge => (
        <ChallengeCard 
          key={challenge.id} 
          challenge={challenge} 
          currentUser={currentUser}
          onVoteSuccess={onVoteSuccess}
        />
      ))}
    </div>
  );
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination) return null;

  return (
    <div className="pagination">
      <button 
        onClick={() => onPageChange(pagination.currentPage - 1)}
        disabled={!pagination.hasPrev}
      >
        Previous
      </button>
      
      <span className="page-info">
        Page {pagination.currentPage} of {pagination.totalPages}
        ({pagination.totalItems} total challenges)
      </span>
      
      <button 
        onClick={() => onPageChange(pagination.currentPage + 1)}
        disabled={!pagination.hasNext}
      >
        Next
      </button>
    </div>
  );
}

export default LiveMarket;
```

### **4. Advanced Features**

#### **Real-time Updates with Polling**
```javascript
class LiveMarketUpdater {
  constructor(challengeManager, updateInterval = 30000) {
    this.challengeManager = challengeManager;
    this.updateInterval = updateInterval;
    this.intervalId = null;
    this.isUpdating = false;
  }

  startRealTimeUpdates() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(async () => {
      if (this.isUpdating) return;
      
      this.isUpdating = true;
      try {
        await this.challengeManager.loadChallenges();
      } catch (error) {
        console.error('Failed to update challenges:', error);
      } finally {
        this.isUpdating = false;
      }
    }, this.updateInterval);
  }

  stopRealTimeUpdates() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Update interval for urgent changes
  setUpdateInterval(interval) {
    this.updateInterval = interval;
    if (this.intervalId) {
      this.stopRealTimeUpdates();
      this.startRealTimeUpdates();
    }
  }
}

// Usage
const liveUpdater = new LiveMarketUpdater(challengeManager);
liveUpdater.startRealTimeUpdates();
```

#### **Search and Advanced Filtering**
```javascript
class ChallengeSearch {
  constructor(challengeManager) {
    this.challengeManager = challengeManager;
    this.searchTimeout = null;
    this.setupSearchUI();
  }

  setupSearchUI() {
    const searchInput = document.getElementById('challenge-search');
    const advancedFilters = document.getElementById('advanced-filters');

    // Debounced search
    searchInput?.addEventListener('input', (e) => {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.handleSearch(e.target.value);
      }, 300);
    });

    // Advanced filter form
    advancedFilters?.addEventListener('change', () => {
      this.handleAdvancedFilter();
    });
  }

  async handleSearch(query) {
    if (query.length < 3 && query.length > 0) return;
    
    await this.challengeManager.loadChallenges({
      search: query,
      page: 1
    });
  }

  async handleAdvancedFilter() {
    const filters = {
      minStake: document.getElementById('min-stake')?.value || 0,
      maxStake: document.getElementById('max-stake')?.value || 999999,
      dateRange: document.getElementById('date-range')?.value || 'all',
      creator: document.getElementById('creator-filter')?.value || '',
      hasVoted: document.getElementById('has-voted')?.checked || false
    };

    await this.challengeManager.loadChallenges(filters);
  }

  // Save search preferences
  saveSearchPreferences(filters) {
    localStorage.setItem('liveMarketFilters', JSON.stringify(filters));
  }

  // Load search preferences
  loadSearchPreferences() {
    const saved = localStorage.getItem('liveMarketFilters');
    return saved ? JSON.parse(saved) : {};
  }
}
```

#### **User Voting Analytics**
```javascript
class VotingAnalytics {
  constructor(api) {
    this.api = api;
  }

  async getUserVotingStats(username) {
    try {
      const userVotes = await this.api.getUserVotes(username);
      
      const stats = {
        totalVotes: userVotes.data.length,
        totalStaked: userVotes.data.reduce((sum, vote) => sum + vote.stakeAmount, 0),
        winRate: this.calculateWinRate(userVotes.data),
        categoryBreakdown: this.getCategoryBreakdown(userVotes.data),
        recentActivity: this.getRecentActivity(userVotes.data)
      };

      return stats;
    } catch (error) {
      console.error('Failed to get voting stats:', error);
      return null;
    }
  }

  calculateWinRate(votes) {
    const completedVotes = votes.filter(vote => vote.challengeStatus === 'completed');
    if (completedVotes.length === 0) return 0;
    
    const wins = completedVotes.filter(vote => vote.wasCorrect);
    return Math.round((wins.length / completedVotes.length) * 100);
  }

  getCategoryBreakdown(votes) {
    const breakdown = {};
    votes.forEach(vote => {
      if (!breakdown[vote.category]) {
        breakdown[vote.category] = { count: 0, staked: 0 };
      }
      breakdown[vote.category].count++;
      breakdown[vote.category].staked += vote.stakeAmount;
    });
    return breakdown;
  }

  getRecentActivity(votes) {
    return votes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }
}
```

---

## 🎨 CSS Styling Examples

### **Challenge Card Styling**
```css
.challenge-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.challenge-card:hover {
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.challenge-header {
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.challenge-title {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
}

.challenge-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.challenge-category {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.category-crypto { background: #fef3c7; color: #92400e; }
.category-sports { background: #dbeafe; color: #1e40af; }
.category-tech { background: #f3e8ff; color: #7c3aed; }
.category-entertainment { background: #fce7f3; color: #be185d; }

.challenge-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-active { background: #d1fae5; color: #065f46; }
.status-pending { background: #fef3c7; color: #92400e; }
.status-completed { background: #e5e7eb; color: #374151; }

.vote-bar {
  height: 12px;
  background: #fee2e2;
  border-radius: 6px;
  overflow: hidden;
  margin: 12px 0;
  display: flex;
}

.yes-bar {
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.5s ease;
}

.no-bar {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.vote-numbers {
  display: flex;
  justify-content: between;
  font-size: 14px;
  color: #6b7280;
}

.voting-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f3f4f6;
}

.stake-input-group {
  margin-bottom: 16px;
}

.stake-input-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.stake-amount {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.stake-amount:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.vote-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.vote-btn {
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.vote-yes {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.vote-yes:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

.vote-no {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.vote-no:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
}

.vote-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.vote-btn.voting {
  background: #9ca3af;
}

.challenge-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: between;
  font-size: 14px;
  color: #6b7280;
}

.creator {
  font-weight: 500;
}

/* Loading States */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Notifications */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 24px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

.notification.success {
  background: #10b981;
}

.notification.error {
  background: #ef4444;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .challenge-card {
    padding: 16px;
  }
  
  .challenge-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .vote-buttons {
    grid-template-columns: 1fr;
  }
  
  .vote-numbers {
    flex-direction: column;
    gap: 4px;
  }
}
```

---

## 🔧 Configuration & Best Practices

### **Rate Limiting**
- **GET** requests: 100 requests per 15 minutes per IP
- **POST** requests: 50 requests per 15 minutes per IP

### **Error Handling Best Practices**
1. Always validate user inputs
2. Handle network timeouts gracefully
3. Provide meaningful error messages
4. Implement retry mechanisms for failed requests
5. Log errors for debugging

### **Performance Optimization**
1. Implement request debouncing for search
2. Use pagination to limit data load
3. Cache frequently accessed data
4. Implement optimistic UI updates
5. Use loading states for better UX

### **Security Considerations**
1. Validate all user inputs on both client and server
2. Implement CSRF protection
3. Use HTTPS in production
4. Sanitize user-generated content
5. Implement proper authentication

---

## 🚀 Production Deployment

### **Environment Variables**
```env
NODE_ENV=production
API_BASE_URL=https://your-domain.com
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### **Production URLs**
Replace `localhost:3000` with your deployed URL:
```
https://your-app-name.onrender.com/api/live_market
```

---

This comprehensive documentation provides everything needed to implement and integrate the `/api/live_market` endpoint effectively in your frontend application!