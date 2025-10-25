const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
    this.useFileStorage = false;
    this.dataPath = path.join(__dirname, '..', 'data', 'waitlist.json');
  }

  async connect() {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL;
    
    if (mongoUri) {
      try {
        // Updated MongoDB Atlas connection options
        const options = {
          ssl: true,
          tls: true,
          tlsInsecure: false,  // Don't use this in production
          serverApi: {
            version: '1',
            strict: true,
            deprecationErrors: true
          },
          retryWrites: true,
          w: "majority"
        };
        
        console.log('Attempting MongoDB connection...');
        this.client = new MongoClient(mongoUri, options);
        await this.client.connect();
        this.db = this.client.db(process.env.DB_NAME || 'stakely');
        this.isConnected = true;
        console.log('Connected to MongoDB successfully');
        return true;
      } catch (error) {
        console.warn('Failed to connect to MongoDB:', error.message);
        console.log('Falling back to file storage');
        this.useFileStorage = true;
        await this.initFileStorage();
        return false;
      }
    } else {
      console.log('No MongoDB URI provided, using file storage');
      this.useFileStorage = true;
      await this.initFileStorage();
      return false;
    }
  }

  async initFileStorage() {
    try {
      await fs.access(this.dataPath);
      // Check if file has old structure and migrate
      const content = await fs.readFile(this.dataPath, 'utf8');
      const data = JSON.parse(content);
      
      // If it's an array (old structure), migrate to new structure
      if (Array.isArray(data)) {
        const newStructure = {
          entries: data.map((entry, index) => ({
            ...entry,
            position: index + 1,
            forecasterUsername: entry.farcasterUsername || null,
            twitterUsername: entry.twitterUsername || null
          })),
          stats: {
            total: data.length,
            twitterSignups: data.filter(entry => entry.twitterUsername).length,
            farcasterSignups: data.filter(entry => entry.farcasterUsername).length
          }
        };
        await fs.writeFile(this.dataPath, JSON.stringify(newStructure, null, 2));
      }
    } catch (error) {
      // File doesn't exist, create it with new structure
      const initialStructure = {
        entries: [],
        stats: {
          total: 0,
          twitterSignups: 0,
          farcasterSignups: 0
        }
      };
      await fs.writeFile(this.dataPath, JSON.stringify(initialStructure, null, 2));
    }
  }

  async addToWaitlist(data) {
    if (this.useFileStorage) {
      return await this.addToFileStorage(data);
    } else {
      return await this.addToMongoDB(data);
    }
  }

  async addToMongoDB(data) {
    try {
      const collection = this.db.collection('waitlist');
      
      // Get current position
      const count = await collection.countDocuments();
      const waitlistEntry = {
        ...data,
        timestamp: new Date(),
        id: this.generateId(),
        position: count + 1
      };
      
      const result = await collection.insertOne(waitlistEntry);
      return { success: true, id: result.insertedId, data: waitlistEntry };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async addToFileStorage(data) {
    try {
      const fileContent = await fs.readFile(this.dataPath, 'utf8');
      const fileData = JSON.parse(fileContent);
      
      const waitlistEntry = {
        ...data,
        timestamp: new Date(),
        id: this.generateId(),
        position: fileData.entries.length + 1
      };
      
      // Add to entries
      fileData.entries.push(waitlistEntry);
      
      // Update stats
      fileData.stats.total = fileData.entries.length;
      fileData.stats.twitterSignups = fileData.entries.filter(entry => entry.twitterUsername).length;
      fileData.stats.farcasterSignups = fileData.entries.filter(entry => entry.farcasterUsername).length;
      
      await fs.writeFile(this.dataPath, JSON.stringify(fileData, null, 2));
      return { success: true, id: waitlistEntry.id, data: waitlistEntry };
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  async getWaitlist(options = {}) {
    const { limit = 100, skip = 0, sortBy = 'timestamp', sortOrder = -1 } = options;

    if (this.useFileStorage) {
      return await this.getFromFileStorage(options);
    } else {
      return await this.getFromMongoDB(options);
    }
  }

  async getFromMongoDB(options) {
    try {
      const { limit, skip, sortBy, sortOrder } = options;
      const collection = this.db.collection('waitlist');
      
      const cursor = collection
        .find({})
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);
      
      const entries = await cursor.toArray();
      const total = await collection.countDocuments();
      
      return { 
        success: true, 
        data: entries, 
        total,
        count: entries.length 
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getFromFileStorage(options) {
    try {
      const { limit, skip, sortBy, sortOrder } = options;
      const fileContent = await fs.readFile(this.dataPath, 'utf8');
      const fileData = JSON.parse(fileContent);
      let entries = fileData.entries || [];
      
      // Sort the data
      entries.sort((a, b) => {
        if (sortOrder === 1) {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      });
      
      const total = entries.length;
      const paginatedData = entries.slice(skip, skip + limit);
      
      return { 
        success: true, 
        data: paginatedData, 
        total,
        count: paginatedData.length,
        stats: fileData.stats
      };
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  async getWaitlistStats() {
    if (this.useFileStorage) {
      return await this.getFileStorageStats();
    } else {
      return await this.getMongoDBStats();
    }
  }

  async getMongoDBStats() {
    try {
      const collection = this.db.collection('waitlist');
      const total = await collection.countDocuments();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCount = await collection.countDocuments({
        timestamp: { $gte: today }
      });
      
      const twitterSignups = await collection.countDocuments({
        twitterUsername: { $ne: null, $exists: true }
      });
      
      const farcasterSignups = await collection.countDocuments({
        farcasterUsername: { $ne: null, $exists: true }
      });
      
      return { success: true, total, todayCount, twitterSignups, farcasterSignups };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getFileStorageStats() {
    try {
      const fileContent = await fs.readFile(this.dataPath, 'utf8');
      const fileData = JSON.parse(fileContent);
      const entries = fileData.entries || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todayCount = entries.filter(entry => {
        const entryDate = new Date(entry.timestamp);
        return entryDate >= today;
      }).length;
      
      return { 
        success: true, 
        total: fileData.stats.total,
        todayCount,
        twitterSignups: fileData.stats.twitterSignups,
        farcasterSignups: fileData.stats.farcasterSignups
      };
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // User management methods
  async createUser(userData) {
    const userEntry = {
      ...userData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    if (this.useFileStorage) {
      return await this.createUserFileStorage(userEntry);
    } else {
      return await this.createUserMongoDB(userEntry);
    }
  }

  async createUserMongoDB(userData) {
    try {
      const collection = this.db.collection('users');
      
      // Check for duplicate farcaster username
      const existing = await collection.findOne({ 
        farcasterUsername: userData.farcasterUsername 
      });
      
      if (existing) {
        throw new Error('Farcaster username already exists');
      }
      
      const result = await collection.insertOne(userData);
      return { success: true, id: result.insertedId, data: userData };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async createUserFileStorage(userData) {
    try {
      const usersPath = path.join(__dirname, '..', 'data', 'users.json');
      
      // Ensure file exists
      try {
        await fs.access(usersPath);
      } catch (error) {
        await fs.writeFile(usersPath, JSON.stringify([], null, 2));
      }
      
      const fileContent = await fs.readFile(usersPath, 'utf8');
      const users = JSON.parse(fileContent);
      
      // Check for duplicate farcaster username
      const existing = users.find(user => 
        user.farcasterUsername === userData.farcasterUsername
      );
      
      if (existing) {
        throw new Error('Farcaster username already exists');
      }
      
      users.push(userData);
      await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
      return { success: true, id: userData.id, data: userData };
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  async getUserByFarcasterUsername(farcasterUsername) {
    if (this.useFileStorage) {
      return await this.getUserByFarcasterUsernameFileStorage(farcasterUsername);
    } else {
      return await this.getUserByFarcasterUsernameMongoDB(farcasterUsername);
    }
  }

  async getUserByFarcasterUsernameMongoDB(farcasterUsername) {
    try {
      const collection = this.db.collection('users');
      const user = await collection.findOne({ farcasterUsername });
      console.log(`User lookup result for ${farcasterUsername}: ${user ? 'Found' : 'Not found'}`);
      return user;
    } catch (error) {
      console.error('Error in user lookup:', error.message);
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getUserByFarcasterUsernameFileStorage(farcasterUsername) {
    try {
      const usersPath = path.join(__dirname, '..', 'data', 'users.json');
      const fileContent = await fs.readFile(usersPath, 'utf8');
      const users = JSON.parse(fileContent);
      return users.find(user => user.farcasterUsername === farcasterUsername);
    } catch (error) {
      return null;
    }
  }

  // Challenge management methods
  async createChallenge(challengeData) {
    const challengeEntry = {
      ...challengeData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };

    if (this.useFileStorage) {
      return await this.createChallengeFileStorage(challengeEntry);
    } else {
      return await this.createChallengeMongoDB(challengeEntry);
    }
  }

  async createChallengeMongoDB(challengeData) {
    try {
      const collection = this.db.collection('challenges');
      const result = await collection.insertOne(challengeData);
      return { success: true, id: result.insertedId, data: challengeData };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async createChallengeFileStorage(challengeData) {
    try {
      const challengesPath = path.join(__dirname, '..', 'data', 'challenges.json');
      
      // Ensure file exists
      try {
        await fs.access(challengesPath);
      } catch (error) {
        await fs.writeFile(challengesPath, JSON.stringify([], null, 2));
      }
      
      const fileContent = await fs.readFile(challengesPath, 'utf8');
      const challenges = JSON.parse(fileContent);
      
      challenges.push(challengeData);
      await fs.writeFile(challengesPath, JSON.stringify(challenges, null, 2));
      return { success: true, id: challengeData.id, data: challengeData };
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  async getChallenges(options = {}) {
    const { 
      filterCriteria = {}, 
      userInterests = [],
      limit = 20, 
      skip = 0, 
      sortBy = 'createdAt', 
      sortOrder = -1 
    } = options;

    if (this.useFileStorage) {
      return await this.getChallengesFileStorage(options);
    } else {
      return await this.getChallengesMongoDB(options);
    }
  }

  async getChallengeById(challengeId) {
    if (this.useFileStorage) {
      return await this.getChallengeByIdFileStorage(challengeId);
    } else {
      return await this.getChallengeByIdMongoDB(challengeId);
    }
  }

  async getChallengeByIdMongoDB(challengeId) {
    try {
      const collection = this.db.collection('challenges');
      return await collection.findOne({ id: challengeId });
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getChallengeByIdFileStorage(challengeId) {
    try {
      const challengesPath = path.join(__dirname, '..', 'data', 'challenges.json');
      const fileContent = await fs.readFile(challengesPath, 'utf8');
      const challenges = JSON.parse(fileContent || '[]');
      return challenges.find(c => c.id === challengeId);
    } catch (error) {
      return null;
    }
  }

  async getUserVote(challengeId, farcasterUsername) {
    if (this.useFileStorage) {
      return await this.getUserVoteFileStorage(challengeId, farcasterUsername);
    } else {
      return await this.getUserVoteMongoDB(challengeId, farcasterUsername);
    }
  }

  async getUserVoteMongoDB(challengeId, farcasterUsername) {
    try {
      const collection = this.db.collection('votes');
      return await collection.findOne({ challengeId, farcasterUsername });
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getUserVoteFileStorage(challengeId, farcasterUsername) {
    try {
      const votesPath = path.join(__dirname, '..', 'data', 'votes.json');
      const fileContent = await fs.readFile(votesPath, 'utf8');
      const votes = JSON.parse(fileContent || '[]');
      return votes.find(v => v.challengeId === challengeId && v.farcasterUsername === farcasterUsername);
    } catch (error) {
      return null;
    }
  }

  async getChallengesMongoDB(options) {
    try {
      const { filterCriteria, userInterests, limit, skip, sortBy, sortOrder } = options;
      const collection = this.db.collection('challenges');
      
      // Build query
      let query = {};
      
      if (filterCriteria.status) {
        query.status = filterCriteria.status;
      }
      
      if (filterCriteria.category && filterCriteria.category !== 'all') {
        query.category = filterCriteria.category;
      }
      
      // If user has interests and no specific category, prioritize user interests
      if (userInterests.length > 0 && (!filterCriteria.category || filterCriteria.category === 'all')) {
        query.category = { $in: userInterests };
      }
      
      const cursor = collection
        .find(query)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit);
      
      const challenges = await cursor.toArray();
      const total = await collection.countDocuments(query);
      
      return { 
        success: true, 
        data: challenges, 
        total,
        count: challenges.length 
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getChallengesFileStorage(options) {
    try {
      const { filterCriteria, userInterests, limit, skip, sortBy, sortOrder } = options;
      const challengesPath = path.join(__dirname, '..', 'data', 'challenges.json');
      
      let challenges = [];
      try {
        const fileContent = await fs.readFile(challengesPath, 'utf8');
        challenges = JSON.parse(fileContent);
      } catch (error) {
        return { success: true, data: [], total: 0, count: 0 };
      }
      
      // Apply filters
      let filteredChallenges = challenges;
      
      if (filterCriteria.status) {
        filteredChallenges = filteredChallenges.filter(c => c.status === filterCriteria.status);
      }
      
      if (filterCriteria.category && filterCriteria.category !== 'all') {
        filteredChallenges = filteredChallenges.filter(c => c.category === filterCriteria.category);
      }
      
      // If user has interests and no specific category, prioritize user interests
      if (userInterests.length > 0 && (!filterCriteria.category || filterCriteria.category === 'all')) {
        filteredChallenges = filteredChallenges.filter(c => userInterests.includes(c.category));
      }
      
      // Sort
      filteredChallenges.sort((a, b) => {
        if (sortOrder === 1) {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        } else {
          return a[sortBy] < b[sortBy] ? 1 : -1;
        }
      });
      
      const total = filteredChallenges.length;
      const paginatedData = filteredChallenges.slice(skip, skip + limit);
      
      return { 
        success: true, 
        data: paginatedData, 
        total,
        count: paginatedData.length 
      };
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  async getMarketStats() {
    if (this.useFileStorage) {
      return await this.getMarketStatsFileStorage();
    } else {
      return await this.getMarketStatsMongoDB();
    }
  }

  async getMarketStatsMongoDB() {
    try {
      const collection = this.db.collection('challenges');
      
      const totalChallenges = await collection.countDocuments();
      const activeChallenges = await collection.countDocuments({ status: 'active' });
      
      // Calculate total staked amount
      const stakeAggregation = await collection.aggregate([
        { $group: { _id: null, totalStaked: { $sum: '$currentStake' } } }
      ]).toArray();
      
      const totalStaked = stakeAggregation.length > 0 ? stakeAggregation[0].totalStaked : 0;
      
      // Get categories count
      const categoriesAggregation = await collection.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]).toArray();
      
      const categoriesCount = categoriesAggregation.reduce((acc, cat) => {
        acc[cat._id] = cat.count;
        return acc;
      }, {});
      
      return { 
        success: true, 
        totalChallenges,
        activeChallenges,
        totalStaked,
        categoriesCount
      };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getMarketStatsFileStorage() {
    try {
      const challengesPath = path.join(__dirname, '..', 'data', 'challenges.json');
      
      let challenges = [];
      try {
        const fileContent = await fs.readFile(challengesPath, 'utf8');
        challenges = JSON.parse(fileContent);
      } catch (error) {
        return { 
          success: true, 
          totalChallenges: 0,
          activeChallenges: 0,
          totalStaked: 0,
          categoriesCount: {}
        };
      }
      
      const totalChallenges = challenges.length;
      const activeChallenges = challenges.filter(c => c.status === 'active').length;
      const totalStaked = challenges.reduce((sum, c) => sum + (c.currentStake || 0), 0);
      
      const categoriesCount = challenges.reduce((acc, challenge) => {
        acc[challenge.category] = (acc[challenge.category] || 0) + 1;
        return acc;
      }, {});
      
      return { 
        success: true, 
        totalChallenges,
        activeChallenges,
        totalStaked,
        categoriesCount
      };
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  /* Votes management - supports both MongoDB and file storage */
  async recordVote(voteData) {
    if (this.useFileStorage) {
      return await this.recordVoteFileStorage(voteData);
    } else {
      return await this.recordVoteMongoDB(voteData);
    }
  }

  async recordVoteMongoDB(voteData) {
    try {
      const collection = this.db.collection('votes');
      const entry = {
        ...voteData,
        id: this.generateId(),
        timestamp: new Date().toISOString()
      };
      const result = await collection.insertOne(entry);
      return { success: true, id: result.insertedId, data: entry };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async recordVoteFileStorage(voteData) {
    try {
      const votesPath = path.join(__dirname, '..', 'data', 'votes.json');
      // ensure file exists
      try {
        await fs.access(votesPath);
      } catch (err) {
        await fs.writeFile(votesPath, JSON.stringify([], null, 2));
      }

      const fileContent = await fs.readFile(votesPath, 'utf8');
      const votes = JSON.parse(fileContent || '[]');

      const entry = {
        ...voteData,
        id: this.generateId(),
        timestamp: new Date().toISOString()
      };

      votes.push(entry);
      await fs.writeFile(votesPath, JSON.stringify(votes, null, 2));
      return { success: true, id: entry.id, data: entry };
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  async getVotesByUser(farcasterUsername) {
    if (this.useFileStorage) {
      return await this.getVotesByUserFileStorage(farcasterUsername);
    } else {
      return await this.getVotesByUserMongoDB(farcasterUsername);
    }
  }

  async getVotesByUserMongoDB(farcasterUsername) {
    try {
      const collection = this.db.collection('votes');
      const votes = await collection.find({ farcasterUsername }).sort({ timestamp: -1 }).toArray();
      return votes;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getVotesByUserFileStorage(farcasterUsername) {
    try {
      const votesPath = path.join(__dirname, '..', 'data', 'votes.json');
      const fileContent = await fs.readFile(votesPath, 'utf8');
      const votes = JSON.parse(fileContent || '[]');
      return votes.filter(v => v.farcasterUsername === farcasterUsername).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    } catch (error) {
      return [];
    }
  }

  async getVoteByUserAndChallenge(challengeId, farcasterUsername) {
    if (this.useFileStorage) {
      return await this.getVoteByUserAndChallengeFileStorage(challengeId, farcasterUsername);
    } else {
      return await this.getVoteByUserAndChallengeMongoDB(challengeId, farcasterUsername);
    }
  }

  async getVoteByUserAndChallengeMongoDB(challengeId, farcasterUsername) {
    try {
      const collection = this.db.collection('votes');
      return await collection.findOne({ 
        challengeId: challengeId, 
        farcasterUsername: farcasterUsername 
      });
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  async getVoteByUserAndChallengeFileStorage(challengeId, farcasterUsername) {
    try {
      const votesPath = path.join(__dirname, '..', 'data', 'votes.json');
      let votes = [];
      try {
        const fileContent = await fs.readFile(votesPath, 'utf8');
        votes = JSON.parse(fileContent || '[]');
      } catch (error) {
        return null;
      }
      
      return votes.find(vote => 
        vote.challengeId === challengeId && 
        vote.farcasterUsername === farcasterUsername
      );
    } catch (error) {
      throw new Error(`File storage error: ${error.message}`);
    }
  }

  async close() {
    if (this.client && this.isConnected) {
      await this.client.close();
      this.isConnected = false;
      console.log('Database connection closed');
    }
  }
}

// Singleton instance
const database = new Database();

module.exports = database;