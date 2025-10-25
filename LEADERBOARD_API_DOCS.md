# Leaderboard API Documentation

## 📊 `/api/leaderboard` Endpoint Guide

The `/api/leaderboard` endpoint provides comprehensive leaderboard functionality for ranking users based on their participation and staking activity across all challenges.

---

## 🔍 Endpoint Overview

### **Purpose:**
- **GET** `/api/leaderboard` - Retrieve user leaderboards and statistics

### **Key Features:**
- ✅ **Votes Leaderboard** - Rank users by total challenge votes participated in
- ✅ **Stakes Leaderboard** - Rank users by total staked amount across all challenges
- ✅ **User Profile Integration** - Enriched with user profile data and interests
- ✅ **Pagination Support** - Handle large user bases efficiently
- ✅ **Flexible Filtering** - Get specific leaderboard types or all at once
- ✅ **Real-time Statistics** - Overall platform statistics and metrics

---

## 🔧 GET Request - Leaderboard Data

### **Base URL:**
```
GET http://localhost:3000/api/leaderboard
```

### **Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | `"all"` | Leaderboard type: **all** (both), **votes** (participation-based), **stakes** (stake-based) |
| `page` | number | `1` | Page number for pagination |
| `limit` | number | `50` | Items per page (max 100) |

### **Request Examples:**

#### 1. Get Both Leaderboards (Default)
```bash
curl "http://localhost:3000/api/leaderboard"
```

#### 2. Get Only Votes-Based Leaderboard
```bash
curl "http://localhost:3000/api/leaderboard?type=votes"
```

#### 3. Get Only Stakes-Based Leaderboard
```bash
curl "http://localhost:3000/api/leaderboard?type=stakes"
```

#### 4. Get Leaderboard with Pagination
```bash
curl "http://localhost:3000/api/leaderboard?type=all&page=1&limit=20"
```

### **Success Response Structure:**

```json
{
  "success": true,
  "data": {
    "votesLeaderboard": {
      "success": true,
      "data": [
        {
          "rank": 1,
          "farcasterUsername": "alice",
          "displayName": "Alice Smith",
          "interests": ["crypto", "tech", "sports"],
          "farcasterWalletAddress": "0x1234567890123456789012345678901234567890",
          "totalVotes": 45,
          "challengesParticipated": 12,
          "totalStakedInVotes": 2500,
          "joinedAt": "2025-10-20T08:00:00.000Z"
        },
        {
          "rank": 2,
          "farcasterUsername": "bob",
          "displayName": "Bob Johnson",
          "interests": ["sports", "entertainment"],
          "farcasterWalletAddress": "0x0987654321098765432109876543210987654321",
          "totalVotes": 38,
          "challengesParticipated": 10,
          "totalStakedInVotes": 1800,
          "joinedAt": "2025-10-21T10:30:00.000Z"
        }
      ],
      "total": 156
    },
    "stakesLeaderboard": {
      "success": true,
      "data": [
        {
          "rank": 1,
          "farcasterUsername": "charlie",
          "displayName": "Charlie Brown",
          "interests": ["crypto", "politics"],
          "farcasterWalletAddress": "0x1111222233334444555566667777888899990000",
          "totalStaked": 5000,
          "challengesStaked": 8,
          "totalVotesWithStakes": 15,
          "joinedAt": "2025-10-19T15:45:00.000Z"
        },
        {
          "rank": 2,
          "farcasterUsername": "alice",
          "displayName": "Alice Smith",
          "interests": ["crypto", "tech", "sports"],
          "farcasterWalletAddress": "0x1234567890123456789012345678901234567890",
          "totalStaked": 2500,
          "challengesStaked": 12,
          "totalVotesWithStakes": 25,
          "joinedAt": "2025-10-20T08:00:00.000Z"
        }
      ],
      "total": 89
    }
  },
  "stats": {
    "totalUsers": 234,
    "totalVotes": 1567,
    "totalStaked": 45000,
    "activeVotingUsers": 156,
    "activeStakingUsers": 89
  },
  "pagination": {
    "currentPage": 1,
    "itemsPerPage": 50,
    "type": "all"
  },
  "meta": {
    "timestamp": "2025-10-25T10:30:00.000Z",
    "availableTypes": ["all", "votes", "stakes"]
  }
}
```

---

## 📈 Leaderboard Sections Explained

### **1. Votes Leaderboard (`votesLeaderboard`)**

**Purpose:** Ranks users by their total participation in challenge voting.

**Ranking Criteria:**
1. **Primary:** Total number of votes cast across all challenges
2. **Secondary:** Total amount staked in those votes (tiebreaker)

**User Data Includes:**
- `rank` - Position in the leaderboard (1-based)
- `farcasterUsername` - User's unique identifier
- `displayName` - User's display name from profile
- `interests` - User's selected interest categories
- `farcasterWalletAddress` - User's wallet address
- `totalVotes` - Total votes cast across all challenges
- `challengesParticipated` - Number of unique challenges voted on
- `totalStakedInVotes` - Total amount staked across all votes
- `joinedAt` - When the user joined the platform

### **2. Stakes Leaderboard (`stakesLeaderboard`)**

**Purpose:** Ranks users by their total staked amounts across all challenges.

**Ranking Criteria:**
1. **Primary:** Total amount staked across all challenges
2. **Secondary:** Total number of votes with stakes (tiebreaker)

**User Data Includes:**
- `rank` - Position in the leaderboard (1-based)
- `farcasterUsername` - User's unique identifier
- `displayName` - User's display name from profile
- `interests` - User's selected interest categories
- `farcasterWalletAddress` - User's wallet address
- `totalStaked` - Total amount staked across all challenges
- `challengesStaked` - Number of unique challenges staked on
- `totalVotesWithStakes` - Number of votes that included stakes
- `joinedAt` - When the user joined the platform

### **3. Overall Statistics (`stats`)**

**Global Platform Metrics:**
- `totalUsers` - Total registered users on the platform
- `totalVotes` - Total votes cast across all challenges
- `totalStaked` - Total amount staked across all challenges
- `activeVotingUsers` - Number of users who have cast at least one vote
- `activeStakingUsers` - Number of users who have staked at least once

---

## 🚀 Frontend Implementation Guide

### **1. Complete API Service Class**

```javascript
class LeaderboardAPI {
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
      console.error('Leaderboard API Error:', error);
      throw error;
    }
  }

  // Get both leaderboards
  async getAllLeaderboards(page = 1, limit = 50) {
    const params = new URLSearchParams({
      type: 'all',
      page: page.toString(),
      limit: limit.toString()
    });
    return this.apiCall(`/api/leaderboard?${params}`);
  }

  // Get votes-based leaderboard only
  async getVotesLeaderboard(page = 1, limit = 50) {
    const params = new URLSearchParams({
      type: 'votes',
      page: page.toString(),
      limit: limit.toString()
    });
    return this.apiCall(`/api/leaderboard?${params}`);
  }

  // Get stakes-based leaderboard only
  async getStakesLeaderboard(page = 1, limit = 50) {
    const params = new URLSearchParams({
      type: 'stakes',
      page: page.toString(),
      limit: limit.toString()
    });
    return this.apiCall(`/api/leaderboard?${params}`);
  }
}

// Initialize API
const leaderboardAPI = new LeaderboardAPI();
```

### **2. Leaderboard Display Component (Vanilla JS)**

```javascript
class LeaderboardManager {
  constructor(containerId = 'leaderboard-container') {
    this.container = document.getElementById(containerId);
    this.currentType = 'all';
    this.currentPage = 1;
    this.isLoading = false;
  }

  // Load and display leaderboards
  async loadLeaderboards(type = 'all', page = 1) {
    if (this.isLoading) return;
    
    try {
      this.isLoading = true;
      this.currentType = type;
      this.currentPage = page;
      
      this.showLoading();
      
      let response;
      switch (type) {
        case 'votes':
          response = await leaderboardAPI.getVotesLeaderboard(page, 20);
          break;
        case 'stakes':
          response = await leaderboardAPI.getStakesLeaderboard(page, 20);
          break;
        default:
          response = await leaderboardAPI.getAllLeaderboards(page, 20);
      }

      this.displayLeaderboards(response.data, response.stats);
      this.updateTypeSelector(type);
      
    } catch (error) {
      this.showError('Failed to load leaderboards: ' + error.message);
    } finally {
      this.isLoading = false;
    }
  }

  // Display leaderboards in UI
  displayLeaderboards(data, stats) {
    this.container.innerHTML = '';
    
    // Add overall stats
    const statsSection = this.createStatsSection(stats);
    this.container.appendChild(statsSection);

    // Add leaderboard sections
    if (data.votesLeaderboard) {
      const votesSection = this.createLeaderboardSection(
        'Participation Leaderboard',
        'Top users by total votes cast',
        data.votesLeaderboard.data,
        'votes'
      );
      this.container.appendChild(votesSection);
    }

    if (data.stakesLeaderboard) {
      const stakesSection = this.createLeaderboardSection(
        'Stakes Leaderboard',
        'Top users by total amount staked',
        data.stakesLeaderboard.data,
        'stakes'
      );
      this.container.appendChild(stakesSection);
    }
  }

  // Create overall stats section
  createStatsSection(stats) {
    const section = document.createElement('div');
    section.className = 'stats-section';
    
    section.innerHTML = `
      <h2>Platform Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Users</h3>
          <span class="stat-number">${stats.totalUsers.toLocaleString()}</span>
        </div>
        <div class="stat-card">
          <h3>Total Votes</h3>
          <span class="stat-number">${stats.totalVotes.toLocaleString()}</span>
        </div>
        <div class="stat-card">
          <h3>Total Staked</h3>
          <span class="stat-number">$${stats.totalStaked.toLocaleString()}</span>
        </div>
        <div class="stat-card">
          <h3>Active Voters</h3>
          <span class="stat-number">${stats.activeVotingUsers.toLocaleString()}</span>
        </div>
        <div class="stat-card">
          <h3>Active Stakers</h3>
          <span class="stat-number">${stats.activeStakingUsers.toLocaleString()}</span>
        </div>
      </div>
    `;
    
    return section;
  }

  // Create individual leaderboard section
  createLeaderboardSection(title, description, users, type) {
    const section = document.createElement('div');
    section.className = `leaderboard-section leaderboard-${type}`;
    
    const userRows = users.map(user => this.createUserRow(user, type)).join('');
    
    section.innerHTML = `
      <div class="leaderboard-header">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
      <div class="leaderboard-table">
        <div class="table-header">
          <span class="rank-col">Rank</span>
          <span class="user-col">User</span>
          <span class="stats-col">${type === 'votes' ? 'Votes' : 'Staked'}</span>
          <span class="challenges-col">Challenges</span>
          <span class="interests-col">Interests</span>
        </div>
        <div class="table-body">
          ${userRows}
        </div>
      </div>
    `;
    
    return section;
  }

  // Create individual user row
  createUserRow(user, type) {
    const primaryStat = type === 'votes' ? user.totalVotes : `$${user.totalStaked.toLocaleString()}`;
    const challengesStat = type === 'votes' ? user.challengesParticipated : user.challengesStaked;
    const interests = user.interests.slice(0, 3).join(', ');
    
    return `
      <div class="user-row ${user.rank <= 3 ? `rank-${user.rank}` : ''}">
        <span class="rank-col">
          <span class="rank-number">${user.rank}</span>
          ${user.rank <= 3 ? '<span class="rank-badge">🏆</span>' : ''}
        </span>
        <span class="user-col">
          <div class="user-info">
            <span class="username">@${user.farcasterUsername}</span>
            <span class="display-name">${user.displayName || user.farcasterUsername}</span>
          </div>
        </span>
        <span class="stats-col">
          <span class="primary-stat">${primaryStat}</span>
          ${type === 'votes' ? 
            `<span class="secondary-stat">$${user.totalStakedInVotes.toLocaleString()} staked</span>` :
            `<span class="secondary-stat">${user.totalVotesWithStakes} votes</span>`
          }
        </span>
        <span class="challenges-col">${challengesStat}</span>
        <span class="interests-col">${interests}</span>
      </div>
    `;
  }

  // Type selector for switching between leaderboards
  updateTypeSelector(currentType) {
    const existingSelector = document.getElementById('leaderboard-type-selector');
    if (existingSelector) existingSelector.remove();
    
    const selector = document.createElement('div');
    selector.id = 'leaderboard-type-selector';
    selector.className = 'type-selector';
    
    selector.innerHTML = `
      <button class="type-btn ${currentType === 'all' ? 'active' : ''}" 
              onclick="leaderboardManager.loadLeaderboards('all', 1)">
        Both Leaderboards
      </button>
      <button class="type-btn ${currentType === 'votes' ? 'active' : ''}" 
              onclick="leaderboardManager.loadLeaderboards('votes', 1)">
        Participation
      </button>
      <button class="type-btn ${currentType === 'stakes' ? 'active' : ''}" 
              onclick="leaderboardManager.loadLeaderboards('stakes', 1)">
        Stakes
      </button>
    `;
    
    this.container.insertBefore(selector, this.container.firstChild);
  }

  // Utility methods
  showLoading() {
    this.container.innerHTML = `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading leaderboards...</p>
      </div>
    `;
  }

  showError(message) {
    this.container.innerHTML = `
      <div class="error-container">
        <h3>Error</h3>
        <p>${message}</p>
        <button onclick="leaderboardManager.loadLeaderboards('all', 1)">Try Again</button>
      </div>
    `;
  }
}

// Initialize leaderboard manager
const leaderboardManager = new LeaderboardManager();

// Auto-load leaderboards when page loads
document.addEventListener('DOMContentLoaded', () => {
  leaderboardManager.loadLeaderboards('all', 1);
});
```

### **3. React Implementation**

```jsx
import React, { useState, useEffect, useCallback } from 'react';

// Custom hook for leaderboard data
function useLeaderboard(type = 'all', page = 1) {
  const [data, setData] = useState({
    leaderboards: null,
    stats: null,
    loading: true,
    error: null
  });

  const fetchData = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      let response;
      switch (type) {
        case 'votes':
          response = await leaderboardAPI.getVotesLeaderboard(page, 20);
          break;
        case 'stakes':
          response = await leaderboardAPI.getStakesLeaderboard(page, 20);
          break;
        default:
          response = await leaderboardAPI.getAllLeaderboards(page, 20);
      }
      
      setData({
        leaderboards: response.data,
        stats: response.stats,
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
  }, [type, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { ...data, refetch: fetchData };
}

// Main leaderboard component
function Leaderboard() {
  const [currentType, setCurrentType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const { leaderboards, stats, loading, error, refetch } = useLeaderboard(currentType, currentPage);

  const handleTypeChange = (type) => {
    setCurrentType(type);
    setCurrentPage(1);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="leaderboard">
      <header className="leaderboard-header">
        <h1>Stakely Leaderboards</h1>
        <TypeSelector currentType={currentType} onTypeChange={handleTypeChange} />
      </header>

      <StatsSection stats={stats} />

      {leaderboards?.votesLeaderboard && (
        <LeaderboardSection 
          title="Participation Leaderboard"
          description="Top users by total votes cast"
          users={leaderboards.votesLeaderboard.data}
          type="votes"
        />
      )}

      {leaderboards?.stakesLeaderboard && (
        <LeaderboardSection 
          title="Stakes Leaderboard"
          description="Top users by total amount staked"
          users={leaderboards.stakesLeaderboard.data}
          type="stakes"
        />
      )}
    </div>
  );
}

// Supporting components
function TypeSelector({ currentType, onTypeChange }) {
  return (
    <div className="type-selector">
      <button 
        className={`type-btn ${currentType === 'all' ? 'active' : ''}`}
        onClick={() => onTypeChange('all')}
      >
        Both Leaderboards
      </button>
      <button 
        className={`type-btn ${currentType === 'votes' ? 'active' : ''}`}
        onClick={() => onTypeChange('votes')}
      >
        Participation
      </button>
      <button 
        className={`type-btn ${currentType === 'stakes' ? 'active' : ''}`}
        onClick={() => onTypeChange('stakes')}
      >
        Stakes
      </button>
    </div>
  );
}

function StatsSection({ stats }) {
  return (
    <div className="stats-section">
      <h2>Platform Statistics</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <span className="stat-number">{stats.totalUsers.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <h3>Total Votes</h3>
          <span className="stat-number">{stats.totalVotes.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <h3>Total Staked</h3>
          <span className="stat-number">${stats.totalStaked.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <h3>Active Voters</h3>
          <span className="stat-number">{stats.activeVotingUsers.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <h3>Active Stakers</h3>
          <span className="stat-number">{stats.activeStakingUsers.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

function LeaderboardSection({ title, description, users, type }) {
  return (
    <div className={`leaderboard-section leaderboard-${type}`}>
      <div className="leaderboard-header">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className="leaderboard-table">
        <div className="table-header">
          <span className="rank-col">Rank</span>
          <span className="user-col">User</span>
          <span className="stats-col">{type === 'votes' ? 'Votes' : 'Staked'}</span>
          <span className="challenges-col">Challenges</span>
          <span className="interests-col">Interests</span>
        </div>
        <div className="table-body">
          {users.map(user => (
            <UserRow key={user.farcasterUsername} user={user} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserRow({ user, type }) {
  const primaryStat = type === 'votes' ? user.totalVotes : `$${user.totalStaked.toLocaleString()}`;
  const challengesStat = type === 'votes' ? user.challengesParticipated : user.challengesStaked;
  const interests = user.interests.slice(0, 3).join(', ');
  
  return (
    <div className={`user-row ${user.rank <= 3 ? `rank-${user.rank}` : ''}`}>
      <span className="rank-col">
        <span className="rank-number">{user.rank}</span>
        {user.rank <= 3 && <span className="rank-badge">🏆</span>}
      </span>
      <span className="user-col">
        <div className="user-info">
          <span className="username">@{user.farcasterUsername}</span>
          <span className="display-name">{user.displayName || user.farcasterUsername}</span>
        </div>
      </span>
      <span className="stats-col">
        <span className="primary-stat">{primaryStat}</span>
        <span className="secondary-stat">
          {type === 'votes' ? 
            `$${user.totalStakedInVotes.toLocaleString()} staked` :
            `${user.totalVotesWithStakes} votes`
          }
        </span>
      </span>
      <span className="challenges-col">{challengesStat}</span>
      <span className="interests-col">{interests}</span>
    </div>
  );
}

export default Leaderboard;
```

---

## 🎨 CSS Styling Examples

```css
/* Leaderboard Container */
.leaderboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.leaderboard-header {
  text-align: center;
  margin-bottom: 30px;
}

.leaderboard-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 10px;
}

/* Type Selector */
.type-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 30px;
}

.type-btn {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.type-btn.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

/* Stats Section */
.stats-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 40px;
  color: white;
}

.stats-section h2 {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.stat-card h3 {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.8;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  display: block;
}

/* Leaderboard Sections */
.leaderboard-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
  overflow: hidden;
}

.leaderboard-header {
  padding: 20px 30px;
  border-bottom: 1px solid #f3f4f6;
}

.leaderboard-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 5px;
}

.leaderboard-header p {
  color: #6b7280;
  margin: 0;
}

/* Leaderboard Table */
.leaderboard-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 120px 100px 150px;
  gap: 20px;
  padding: 15px 30px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  font-size: 14px;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.user-row {
  display: grid;
  grid-template-columns: 80px 1fr 120px 100px 150px;
  gap: 20px;
  padding: 20px 30px;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.2s ease;
  align-items: center;
}

.user-row:hover {
  background: #f9fafb;
}

/* Rank Column */
.rank-col {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rank-number {
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
}

.rank-badge {
  font-size: 16px;
}

.rank-1 .rank-number { color: #fbbf24; }
.rank-2 .rank-number { color: #9ca3af; }
.rank-3 .rank-number { color: #f59e0b; }

/* User Column */
.user-info {
  display: flex;
  flex-direction: column;
}

.username {
  font-weight: 600;
  color: #1f2937;
  font-size: 16px;
}

.display-name {
  color: #6b7280;
  font-size: 14px;
}

/* Stats Column */
.stats-col {
  display: flex;
  flex-direction: column;
  text-align: right;
}

.primary-stat {
  font-weight: 700;
  font-size: 16px;
  color: #1f2937;
}

.secondary-stat {
  color: #6b7280;
  font-size: 12px;
}

/* Challenges Column */
.challenges-col {
  text-align: center;
  font-weight: 600;
  color: #1f2937;
}

/* Interests Column */
.interests-col {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}

/* Loading and Error States */
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

.error-container {
  text-align: center;
  padding: 60px 20px;
  color: #ef4444;
}

.error-container button {
  margin-top: 20px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

/* Responsive Design */
@media (max-width: 768px) {
  .table-header,
  .user-row {
    grid-template-columns: 60px 1fr 80px 60px;
    gap: 10px;
    padding: 15px 20px;
  }
  
  .interests-col,
  .table-header .interests-col {
    display: none;
  }
  
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .type-selector {
    flex-direction: column;
    align-items: center;
  }
}
```

---

## 🔧 Error Handling

### **Common Error Responses:**

```json
{
  "success": false,
  "message": "Invalid type. Must be one of: all, votes, stakes"
}
```

```json
{
  "success": false,
  "message": "Failed to retrieve leaderboard data"
}
```

---

## 🚀 Production URLs

Replace `localhost:3000` with your deployed URL:
```
https://your-app-name.onrender.com/api/leaderboard
https://your-app-name.onrender.com/api/leaderboard?type=votes
https://your-app-name.onrender.com/api/leaderboard?type=stakes
```

---

This comprehensive leaderboard system provides rich insights into user engagement and creates competitive incentives for platform participation!