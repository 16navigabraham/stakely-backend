# Stakely Backend - Waitlist API

A robust waitlist management system with MongoDB support and JSON file fallback.

## 🏗️ Project Structure

```
stakely-backend/
├── pages/api/
│   ├── waitlist.js           # Main waitlist endpoint
│   └── admin-waitlist.js     # Admin endpoint for viewing data
├── lib/
│   └── database.js           # Database connection & operations
├── data/
│   └── waitlist.json         # JSON file storage fallback
├── server.js                 # Express server setup
├── package.json
└── .env.example             # Environment variables template
```

## 🚀 Production Deployment

### Deploy to Render (Recommended)

1. **Push your code to GitHub**
2. **Connect to Render:**
   - Go to [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository

3. **Configure Render Settings:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
   - Node Version: `18` or `20`

4. **Set Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-connection-string
   ADMIN_TOKEN=your-secure-admin-token
   FRONTEND_URL=https://your-frontend-domain.com
   ALLOWED_DOMAINS=https://your-domain.com,https://www.your-domain.com
   ```

5. **Deploy:** Render will automatically build and deploy your app

### Frontend CORS Configuration

After deployment, update your frontend to use the Render URL:

```javascript
const API_BASE_URL = 'https://your-render-app-name.onrender.com';

// Example API call
const response = await fetch(`${API_BASE_URL}/api/waitlist`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(formData)
});
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist IP addresses (use `0.0.0.0/0` for Render)
5. Get connection string and update `MONGODB_URI`

For detailed deployment instructions, see `RENDER_DEPLOYMENT.md`.

## 🔧 Production Features

### Security
- ✅ CORS protection with configurable origins
- ✅ Helmet security headers
- ✅ Rate limiting (general, waitlist-specific, admin)
- ✅ Input validation and sanitization
- ✅ Environment-based error handling
- ✅ Trusted proxy configuration for accurate IPs

### Performance
- ✅ Gzip compression
- ✅ Request logging (Morgan)
- ✅ Graceful shutdown handling
- ✅ Health check endpoint
- ✅ Error monitoring ready

### Rate Limits (Production)
- **General API:** 100 requests per 15 minutes per IP
- **Waitlist submissions:** 5 per hour per IP/email
- **Admin endpoints:** 50 requests per 15 minutes per IP

## 🚀 Quick Start

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

4. **Server will run on:** `http://localhost:3000`

## 📡 API Endpoints

### 1. Waitlist Endpoint (`/api/waitlist`)

#### POST - Join Waitlist
```bash
curl -X POST http://localhost:3000/api/waitlist \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "company": "Acme Inc",
    "role": "Developer",
    "referralSource": "Twitter"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined the waitlist!",
  "id": "generated-id"
}
```

#### GET - Public Stats
```bash
curl http://localhost:3000/api/waitlist
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "todayCount": 12
  }
}
```

### 2. Admin Endpoint (`/api/admin-waitlist`)

#### GET - View All Waitlist Data (Requires Authentication)
```bash
curl http://localhost:3000/api/admin-waitlist \
  -H "Authorization: Bearer your-admin-token"
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `sortBy`: Sort field (default: 'timestamp')
- `sortOrder`: 'asc' or 'desc' (default: 'desc')
- `search`: Search term for email/name/company

**Example with parameters:**
```bash
curl "http://localhost:3000/api/admin-waitlist?page=1&limit=10&search=john" \
  -H "Authorization: Bearer your-admin-token"
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/stakely
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stakely

# Database name (optional)
DB_NAME=stakely

# Admin authentication token
ADMIN_TOKEN=your-secure-admin-token-here

# Server configuration
PORT=3000
NODE_ENV=development
```

### Database Options

The system supports two storage options:

1. **MongoDB** (Recommended for production)
   - Set `MONGODB_URI` in your `.env` file
   - Automatically handles indexing and performance optimization

2. **JSON File Storage** (Fallback)
   - Used when MongoDB is not available
   - Data stored in `data/waitlist.json`
   - Suitable for development or small deployments

## 🔒 Security Features

- **CORS Protection**: Configurable cross-origin requests
- **Helmet**: Security headers for Express
- **Input Validation**: Email format and required field validation
- **Admin Authentication**: Token-based authentication for admin endpoints
- **Rate Limiting Ready**: Easy to add rate limiting middleware

## 📊 Data Schema

### Waitlist Entry
```json
{
  "id": "unique-id",
  "email": "user@example.com",
  "name": "John Doe",
  "company": "Acme Inc",
  "role": "Developer",
  "referralSource": "Twitter",
  "timestamp": "2025-10-22T10:30:00.000Z",
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

## 🛠️ Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server

## 📈 Features

### Core Features
- ✅ Email validation and duplicate prevention
- ✅ Flexible data collection (name, email, company, role, referral source)
- ✅ Automatic timestamping and metadata collection
- ✅ Public stats endpoint
- ✅ Admin dashboard API with pagination and search
- ✅ Dual storage system (MongoDB + JSON fallback)

### Production Ready
- ✅ Error handling and logging
- ✅ CORS and security headers
- ✅ Input validation and sanitization
- ✅ Pagination and sorting
- ✅ Environment-based configuration

## 🔧 Customization

### Adding New Fields
To add new fields to the waitlist form, update:
1. The validation in `pages/api/waitlist.js`
2. The data structure in `lib/database.js`

### Adding Authentication
The current admin authentication is basic. For production, consider:
- JWT tokens
- OAuth integration
- Role-based access control

### Adding Rate Limiting
Install and configure express-rate-limit:
```bash
npm install express-rate-limit
```

## 📝 Example Usage

### Frontend Integration
```javascript
// Join waitlist
const joinWaitlist = async (formData) => {
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('Joined waitlist!', result.id);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// Get public stats
const getStats = async () => {
  try {
    const response = await fetch('/api/waitlist');
    const data = await response.json();
    return data.stats;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check your MONGODB_URI
   - Ensure MongoDB is running
   - System will fallback to JSON storage

2. **Admin Access Denied**
   - Check your ADMIN_TOKEN in .env
   - Ensure Authorization header is correct

3. **CORS Issues**
   - Update CORS configuration in server.js
   - Check allowed origins

## 📄 License

ISC License - See package.json for details.