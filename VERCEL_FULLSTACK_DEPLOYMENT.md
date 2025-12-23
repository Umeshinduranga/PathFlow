# Vercel Deployment Guide - Full Stack on Vercel

This guide explains how to deploy both your React frontend and Express backend on Vercel.

## 🎯 Overview

Your application is now configured to run entirely on Vercel:
- **Frontend**: React app served as static files
- **Backend**: Express API running as Vercel serverless functions

## 📁 Project Structure

```
personal-learning-path/
├── api/
│   └── index.js          # Serverless API entry point
├── client/
│   └── src/              # React frontend
├── server/
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   └── middleware/       # Auth middleware
└── vercel.json           # Vercel configuration
```

## 🚀 Deployment Steps

### 1. Prerequisites

Make sure you have:
- A Vercel account (sign up at https://vercel.com)
- Git repository pushed to GitHub/GitLab/Bitbucket
- All environment variables ready

### 2. Environment Variables

You'll need to set these in Vercel Dashboard:

**Required:**
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-app.vercel.app
```

**Optional (for AI features):**
```
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro
OPENAI_API_KEY=your_openai_api_key
```

**System:**
```
NODE_ENV=production
```

### 3. Deploy via Vercel CLI

#### Install Vercel CLI:
```bash
npm install -g vercel
```

#### Login to Vercel:
```bash
vercel login
```

#### Deploy:
```bash
# From project root
vercel

# Or for production
vercel --prod
```

### 4. Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty, handled by vercel.json)
   - **Output Directory**: (leave empty, handled by vercel.json)
4. Add environment variables in the "Environment Variables" section
5. Click "Deploy"

## 🔧 Configuration Details

### vercel.json Explained

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",        // Backend serverless function
      "use": "@vercel/node"
    },
    {
      "src": "client/package.json",  // Frontend static build
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },     // API routes
    { "src": "/health", "dest": "/api/index.js" },       // Health check
    { "src": "/test", "dest": "/api/index.js" },         // Test endpoint
    { "src": "/static/(.*)", "dest": "/client/build/static/$1" },  // Static files
    { "src": "/(.*)", "dest": "/client/build/index.html" }  // SPA routing
  ]
}
```

### API Routes Structure

The `/api` folder contains a single serverless function that handles all backend routes:
- `/api/auth/*` - Authentication endpoints
- `/api/dashboard/*` - Dashboard data
- `/api/profile/*` - User profile
- `/api/paths/*` - Learning paths
- `/api/generate` - AI path generation
- `/api/market-insights` - Market data
- `/health` - Health check
- `/test` - Test endpoint

## 🌐 How It Works

### Request Flow

```
User Request → Vercel Edge Network
    ↓
    ├─ /api/* → Serverless Function (api/index.js)
    │           ↓
    │           Express App → MongoDB/AI Services
    │
    └─ /* → Static Files (client/build/*)
            ↓
            React SPA
```

### Serverless vs Traditional

**Traditional (Railway):**
- Server always running
- Uses PORT environment variable
- Single long-running process

**Serverless (Vercel):**
- Functions spin up on demand
- No PORT needed (handled by Vercel)
- Cold starts (first request may be slower)
- Auto-scaling
- Pay per invocation

## 📝 Important Notes

### Cold Starts
- First request after inactivity may take 3-5 seconds
- MongoDB connection is established per request
- Subsequent requests are faster

### MongoDB Connection
The API automatically handles MongoDB connection pooling:
```javascript
if (mongoose.connection.readyState === 1) {
  return; // Already connected
}
```

### CORS Configuration
The API is configured to accept requests from your Vercel domain:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
```

### API Limits
Vercel Free Tier:
- 100 GB bandwidth/month
- 100 hours serverless function execution/month
- 10 second function timeout

## 🧪 Testing Your Deployment

### 1. Test Health Check
```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "gemini": "initialized",
  "timestamp": "2025-12-24T..."
}
```

### 2. Test API
```bash
curl https://your-app.vercel.app/test
```

### 3. Test Frontend
Open `https://your-app.vercel.app` in browser

## 🐛 Troubleshooting

### Build Failures

**Issue**: Client build fails
```bash
# Solution: Check client/package.json has vercel-build script
"scripts": {
  "vercel-build": "react-scripts build"
}
```

**Issue**: API build fails
```bash
# Solution: Check that api/index.js imports are correct
# All imports should use relative paths to server/
import authRoutes from "../server/routes/auth.js";
```

### Runtime Issues

**Issue**: 500 errors on API calls
- Check Vercel function logs in dashboard
- Verify environment variables are set
- Check MongoDB connection string

**Issue**: CORS errors
- Verify CLIENT_URL environment variable
- Check browser console for exact error
- Make sure credentials: true is set

**Issue**: AI features not working
- Verify GEMINI_API_KEY is set
- Check function logs for API errors
- Test with `/health` endpoint

## 🔍 Monitoring

### View Logs
```bash
# Real-time logs
vercel logs --follow

# Or in Vercel Dashboard:
# Project → Deployments → [Your Deployment] → Function Logs
```

### Check Function Performance
- Go to Vercel Dashboard
- Select your project
- Click "Analytics" tab
- View response times and errors

## 🚦 Migration from Railway

### What Changed
1. **No more Railway** - Both frontend and backend on Vercel
2. **No PORT variable** - Vercel handles this automatically
3. **API prefix** - All backend routes use `/api`
4. **Serverless** - Functions instead of always-on server

### Update Your .env
Remove:
```
PORT=5000  # Not needed on Vercel
RAILWAY_STATIC_URL  # Not needed
```

Keep/Update:
```
CLIENT_URL=https://your-app.vercel.app
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_key
```

## 📊 Cost Comparison

### Railway (Previous)
- $5/month minimum
- Always-on server

### Vercel (New)
- Free tier: Generous limits for personal projects
- Pro: $20/month if you exceed free tier
- Only pay for actual usage

## 🎉 Success!

Once deployed, your app will be available at:
```
https://your-app.vercel.app
```

Your API endpoints will be:
```
https://your-app.vercel.app/api/auth/register
https://your-app.vercel.app/api/auth/login
https://your-app.vercel.app/api/generate
https://your-app.vercel.app/api/market-insights
etc...
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Build Configuration](https://vercel.com/docs/build-step)

---

Need help? Check the Vercel Dashboard logs or run `vercel logs --follow` to debug issues.
