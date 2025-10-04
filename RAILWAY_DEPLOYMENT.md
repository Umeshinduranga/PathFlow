# Railway Deployment Guide (No Credit Card Required!)

## Why Railway?
- ✅ **No credit card required** for free tier
- ✅ 500 execution hours/month (enough for continuous deployment)
- ✅ $5 free credit to start
- ✅ Easy GitHub integration
- ✅ Automatic deployments on git push
- ✅ Built-in environment variables management

## Step-by-Step Deployment

### 1. Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (no card required!)

### 2. Deploy Your Backend
1. In Railway dashboard, click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your `personal-learning-path` repository
4. Railway will automatically detect it's a Node.js project

### 3. Configure the Service
1. Railway will automatically detect your `package.json`
2. It will use `npm start` as the start command
3. Your app will be deployed to a subdirectory, so we need to configure the root

### 4. Set Root Directory
1. In your project dashboard, click on your service
2. Go to "Settings" tab
3. In "Source" section, set:
   - **Root Directory**: `/server`
4. Click "Update"

### 5. Add Environment Variables
In the "Variables" tab, add these:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://umesh:HnJuazCLU6K5wwuu@cluster1.y4hoxnq.mongodb.net/learning_path
JWT_SECRET=umesh123-pathflow-super-secret-key-2024
JWT_ACCESS_SECRET=umesh123
ACCESS_TOKEN_TTL=15m
GEMINI_API_KEY=AIzaSyATvnriXxs4rWGGXjtmOx8KtztBTbYMQmE
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=https://your-frontend-url.vercel.app
```

### 6. Deploy
1. Railway will automatically redeploy after you save the variables
2. You'll get a URL like: `https://your-app-name.up.railway.app`

### 7. Test Your Deployment
- Health check: `https://your-app-name.up.railway.app/health`
- API root: `https://your-app-name.up.railway.app/`

## Alternative: Cyclic Deployment

If you prefer Cyclic:

1. Go to [cyclic.sh](https://cyclic.sh)
2. Sign in with GitHub
3. Click "Deploy"
4. Select your repository
5. It will automatically deploy!

## Alternative: Glitch Deployment

1. Go to [glitch.com](https://glitch.com)
2. Click "New Project" → "Import from GitHub"
3. Enter your repo URL
4. Glitch will import and deploy automatically

## Update Your Frontend

After deployment, update your client/.env file:

```
REACT_APP_API_URL=https://your-railway-app.up.railway.app
```

## Free Tier Limits Comparison

| Platform | Credit Card | Hours/Month | Automatic Deploy | Database |
|----------|-------------|-------------|------------------|----------|
| Railway  | ❌ No       | 500         | ✅ Yes           | ✅ Yes   |
| Cyclic   | ❌ No       | Unlimited   | ✅ Yes           | ✅ Yes   |
| Glitch   | ❌ No       | Always On*  | ✅ Yes           | ❌ No    |
| Render   | ⚠️ Required | 750         | ✅ Yes           | ✅ Yes   |

*Glitch apps sleep after 5 minutes of inactivity but wake up instantly