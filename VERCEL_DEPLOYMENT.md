# Vercel Deployment Guide for PathFlow Frontend

## Step-by-Step Vercel Deployment

### 1. Go to Vercel
- Visit [vercel.com](https://vercel.com)
- Sign up/Login with GitHub (same account you used for Railway)

### 2. Import Your Project
- Click "New Project" or "Add New..."
- Select "Import Git Repository"
- Choose your "personal-learning-path" repository (or "PathFlow")

### 3. Configure Project Settings
- **Framework Preset**: React
- **Root Directory**: `client` (IMPORTANT!)
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 4. Environment Variables
Add this environment variable in Vercel:
- **Name**: `REACT_APP_API_URL`
- **Value**: `https://pathflow-production.up.railway.app`

### 5. Deploy
- Click "Deploy"
- Vercel will build and deploy your React app
- You'll get a URL like: `https://pathflow-[random].vercel.app`

### 6. Update Railway Backend
After getting your Vercel URL, update Railway:
- Go to Railway → Your project → Variables
- Update `CLIENT_URL` to your Vercel URL
- Example: `https://pathflow-abc123.vercel.app`

## Expected Results

✅ **Frontend URL**: `https://your-app.vercel.app`
✅ **Backend URL**: `https://pathflow-production.up.railway.app`
✅ **Full app working**: Frontend can call backend APIs

## Troubleshooting

### Common Issues:
1. **Build fails**: Make sure Root Directory is set to `client`
2. **API calls fail**: Check REACT_APP_API_URL matches Railway URL exactly
3. **CORS errors**: Update CLIENT_URL in Railway with Vercel URL

### Check These:
- ✅ Root Directory = `client`
- ✅ REACT_APP_API_URL includes `https://`
- ✅ Railway CLIENT_URL updated with Vercel URL
- ✅ No trailing slashes in URLs

## Final Architecture
```
User → Vercel (Frontend) → Railway (Backend) → MongoDB + Gemini AI
```