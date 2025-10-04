# Render Deployment Checklist

## Pre-Deployment
- [x] Added `engines` field to package.json
- [x] Created render.yaml configuration
- [x] Prepared environment variables list

## Deployment Steps
- [ ] 1. Create Render account at render.com
- [ ] 2. Connect GitHub repository
- [ ] 3. Create new Web Service
- [ ] 4. Configure service settings:
  - Name: `personal-learning-path-api`
  - Root Directory: `server`
  - Runtime: `Node`
  - Build Command: `npm install`
  - Start Command: `npm start`
- [ ] 5. Add environment variables:
  - `NODE_ENV=production`
  - `MONGO_URI=your-mongodb-uri`
  - `JWT_SECRET=your-jwt-secret`
  - `GEMINI_API_KEY=your-gemini-key`
  - `CLIENT_URL=your-frontend-url` (add later)
- [ ] 6. Deploy service
- [ ] 7. Test deployment at provided URL
- [ ] 8. Update frontend .env file with new API URL
- [ ] 9. Redeploy frontend (if already deployed)

## Post-Deployment
- [ ] Test all API endpoints
- [ ] Verify database connection
- [ ] Test AI functionality
- [ ] Update CORS settings if needed

## Important URLs
- Backend URL: https://[your-service-name].onrender.com
- Health Check: https://[your-service-name].onrender.com/health
- API Docs: https://[your-service-name].onrender.com/

## Environment Variables Needed
```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-super-secret-jwt-key
GEMINI_API_KEY=your-gemini-api-key
CLIENT_URL=https://your-frontend-domain.com
GEMINI_MODEL=gemini-1.0-pro
```

## Troubleshooting
- Check Render logs for deployment errors
- Verify all environment variables are set
- Ensure MongoDB connection string is correct
- Check that Gemini API key is valid