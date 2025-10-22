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
        this.client = new MongoClient(mongoUri);
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