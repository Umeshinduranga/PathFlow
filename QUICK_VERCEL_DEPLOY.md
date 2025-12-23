# Quick Vercel Deployment Steps

## 🚀 Deploy in 5 Minutes

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login
```bash
vercel login
```

### 3. Deploy from Project Root
```bash
vercel --prod
```

### 4. Set Environment Variables in Vercel Dashboard

Go to: **Project Settings → Environment Variables**

Add these:
```
MONGO_URI = your_mongodb_connection_string
JWT_SECRET = your_jwt_secret_key
GEMINI_API_KEY = your_gemini_api_key
CLIENT_URL = https://your-app.vercel.app
NODE_ENV = production
```

### 5. Redeploy
```bash
vercel --prod
```

## ✅ Verify Deployment

Test health check:
```bash
curl https://your-app.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "gemini": "initialized"
}
```

## 📱 Your URLs

- **Frontend**: `https://your-app.vercel.app`
- **API**: `https://your-app.vercel.app/api/*`
- **Health**: `https://your-app.vercel.app/health`

That's it! Your full-stack app is now live on Vercel! 🎉
