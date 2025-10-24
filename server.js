require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

// Import API handlers
const waitlistHandler = require('./pages/api/waitlist');
const adminWaitlistHandler = require('./pages/api/admin-waitlist');
const createUserHandler = require('./pages/api/create_user');
const createChallengeHandler = require('./pages/api/create_challenge');
const liveMarketHandler = require('./pages/api/live_market');
const userProfileHandler = require('./pages/api/user_profile');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// CORS Configuration for Production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Development
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173', // Vite dev server
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      
      // Production - Add your frontend URLs here
      process.env.FRONTEND_URL,
      process.env.ADMIN_FRONTEND_URL,
      
      // Add your production domains
      'https://stakely-miniapp.vercel.app',
      'https://playstakely.vercel.app',
      'https://stakely.netlify.app',
      
      // Allow any subdomain in production if specified
      ...(process.env.ALLOWED_DOMAINS ? process.env.ALLOWED_DOMAINS.split(',') : [])
    ].filter(Boolean); // Remove undefined values
    
    // In development, be more permissive
    if (NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Forwarded-For'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400 // 24 hours
};

// Security middleware - Enhanced for production
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors(corsOptions));

// Compression middleware for better performance
app.use(compression());

// Logging middleware
if (NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 waitlist submissions per hour
  message: {
    success: false,
    message: 'Too many waitlist submissions from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
  // Removed custom keyGenerator to fix IPv6 issue
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit admin requests
  message: {
    success: false,
    message: 'Too many admin requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
app.use(generalLimiter);

// Trust proxy for accurate IP addresses (important for Render)
app.set('trust proxy', 1);

// Body parser middleware with size limits
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'Invalid JSON'
      });
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes with specific rate limiting
app.use('/api/waitlist', waitlistLimiter, waitlistHandler);
app.use('/api/admin-waitlist', adminLimiter, adminWaitlistHandler);
app.use('/api/create_user', waitlistLimiter, createUserHandler);
app.use('/api/create_challenge', waitlistLimiter, createChallengeHandler);
app.use('/api/live_market', generalLimiter, liveMarketHandler);
app.use('/api/user_profile', generalLimiter, userProfileHandler);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Stakely Backend API',
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV,
    uptime: process.uptime()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Stakely Backend API',
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      waitlist: '/api/waitlist',
      adminWaitlist: '/api/admin-waitlist',
      createUser: '/api/create_user',
      createChallenge: '/api/create_challenge',
      liveMarket: '/api/live_market',
      health: '/health'
    },
    documentation: 'https://github.com/stakely-backend/stakely-backend#readme'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  
  // Don't leak error details in production
  const isDevelopment = NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(isDevelopment && { 
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Stakely Backend API server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 Waitlist API: http://localhost:${PORT}/api/waitlist`);
  console.log(`🔐 Admin API: http://localhost:${PORT}/api/admin-waitlist`);
  
  if (NODE_ENV === 'development') {
    console.log(`📖 Documentation: See README.md for API usage`);
  }
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

module.exports = app;