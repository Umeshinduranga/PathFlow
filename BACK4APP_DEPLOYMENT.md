# Back4app Deployment Guide

## Prerequisites
1. Sign up at [Back4app](https://www.back4app.com/)
2. Install Git if not already installed

## Deployment Steps

### 1. Create a New App on Back4app
1. Go to https://www.back4app.com/
2. Click "Build a new app"
3. Choose "Container App"
4. Name it (e.g., "personal-learning-path")

### 2. Set Environment Variables
In Back4app dashboard, go to your app → Settings → Environment Variables and add:

```
MONGO_URI=mongodb+srv://umesh:HnJuazCLU6K5wwuu@cluster1.y4hoxnq.mongodb.net/learning_path
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-2024
GEMINI_API_KEY=AIzaSyAkKBZmVv3nhB5atB0qT0Zw1b-oo7RmKko
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:3000
PORT=5000
NODE_ENV=production
```

### 3. Deploy via Git

#### Initialize Git (if not already done):
```bash
git init
git add .
git commit -m "Initial commit for Back4app deployment"
```

#### Add Back4app remote:
Back4app will provide you with a Git URL like:
```bash
git remote add back4app https://git.back4app.com/your-app-name.git
```

#### Push to deploy:
```bash
git push back4app main
```

### 4. Update Frontend to Use Back4app URL

After deployment, Back4app will give you a URL like:
`https://your-app-name.back4app.io`

Update your frontend:

**Option 1: For Local Development**
Create `client/.env`:
```
REACT_APP_API_URL=https://your-app-name.back4app.io
```

**Option 2: For Production Frontend**
Update the CLIENT_URL in Back4app environment variables to your frontend URL.

### 5. Test Your Deployment

Test endpoints:
- Health check: `https://your-app-name.back4app.io/health`
- Login: `https://your-app-name.back4app.io/api/auth/login`

### 6. Update CORS Settings

After getting your frontend URL, update the CLIENT_URL environment variable in Back4app to allow your frontend to access the API.

## Troubleshooting

### Check Logs
In Back4app dashboard: Your App → Logs

### Common Issues
1. **MongoDB Connection**: Make sure MONGO_URI is correct
2. **Environment Variables**: Double-check all env vars are set
3. **Port**: Back4app automatically assigns PORT, don't hardcode it

## Alternative: Deploy to Railway (Recommended)

If Back4app doesn't work, Railway is easier:

1. Go to https://railway.app/
2. Click "New Project" → "Deploy from GitHub repo"
3. Connect your GitHub repository
4. Railway will auto-detect Node.js
5. Add environment variables
6. Deploy!

Railway URL: `https://your-app.up.railway.app`
