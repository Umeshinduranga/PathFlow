# Railway Deployment Checklist ✅

## Pre-Deployment Setup
- [x] Environment variables ready
- [x] Railway configuration created
- [x] GitHub repository ready

## Deployment Steps

### 1. Account Setup
- [ ] Go to [railway.app](https://railway.app)
- [ ] Click "Start a New Project"
- [ ] Login with GitHub (no credit card required!)
- [ ] Authorize Railway access

### 2. Project Deployment
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose "personal-learning-path" repository
- [ ] Wait for initial deployment to start

### 3. Configure Service
- [ ] Click on your service name
- [ ] Go to "Settings" tab
- [ ] Set Root Directory to: `/server`
- [ ] Click "Update"

### 4. Environment Variables
Add these in the "Variables" tab:

- [ ] `NODE_ENV` = `production`
- [ ] `MONGO_URI` = `mongodb+srv://umesh:HnJuazCLU6K5wwuu@cluster1.y4hoxnq.mongodb.net/learning_path`
- [ ] `JWT_SECRET` = `umesh123-pathflow-super-secret-key-2024`
- [ ] `JWT_ACCESS_SECRET` = `umesh123`
- [ ] `ACCESS_TOKEN_TTL` = `15m`
- [ ] `GEMINI_API_KEY` = `AIzaSyATvnriXxs4rWGGXjtmOx8KtztBTbYMQmE`
- [ ] `GEMINI_MODEL` = `gemini-2.5-flash`
- [ ] `CLIENT_URL` = `https://localhost:3000` (update later with frontend URL)

### 5. Test Deployment
- [ ] Get your Railway URL (format: `https://[name]-production.up.railway.app`)
- [ ] Test health endpoint: `https://[your-url]/health`
- [ ] Test API root: `https://[your-url]/`
- [ ] Check logs for any errors

### 6. Update Frontend
- [ ] Copy your Railway URL
- [ ] Update `client/.env` file with new URL
- [ ] Test frontend connection to backend

## Expected Results

✅ **Successful deployment shows:**
```json
{
  "message": "🚀 Learning Path Generator API",
  "version": "1.0.0",
  "status": "running",
  "endpoints": ["/generate-path", "/generate-roadmap-steps", "/api/auth/*"]
}
```

✅ **Health check shows:**
```json
{
  "uptime": 123.45,
  "message": "OK",
  "timestamp": 1728000000000,
  "database": "connected",
  "ai": "available"
}
```

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that Root Directory is set to `/server`
2. **Database not connected**: Verify MONGO_URI is correct
3. **AI not working**: Check GEMINI_API_KEY is valid
4. **CORS errors**: Update CLIENT_URL with your frontend domain

### Railway Logs:
- Go to "Deployments" tab to see build logs
- Check "Metrics" tab for runtime logs
- Look for error messages in red

## Free Tier Limits
- ✅ 500 execution hours/month
- ✅ $5 free credit (enough for months)
- ✅ No credit card required
- ✅ Automatic deployments on git push
- ✅ Custom domains available

## Next Steps After Backend Deployment
1. [ ] Deploy frontend (Vercel/Netlify recommended)
2. [ ] Update CLIENT_URL with frontend domain
3. [ ] Test full application flow
4. [ ] Set up custom domain (optional)