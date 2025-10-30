# Netlify Deployment Guide

## Prerequisites
- A Netlify account (free tier works)
- Your backend API deployed and accessible (e.g., on Render, Heroku, etc.)

## Deployment Steps

### 1. Prepare Your Backend
Make sure your backend is deployed and you have the URL. For example:
- `https://your-backend-url.onrender.com`

### 2. Deploy to Netlify

#### Option A: Deploy via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from the frontend directory
cd frontend
netlify deploy --prod
```

#### Option B: Deploy via Netlify UI
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect your Git repository
4. Configure build settings:
   - **Build command**: `CI=false npm run build`
   - **Publish directory**: `build`
   - **Base directory**: `frontend`

### 3. Configure Environment Variables

In Netlify dashboard:
1. Go to Site settings → Environment variables
2. Add the following variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your backend URL (e.g., `https://your-backend-url.onrender.com`)

### 4. Redeploy
After adding environment variables, trigger a new deployment:
- Go to Deploys → Trigger deploy → Deploy site

## Important Notes

### Authentication Removed
This version has JWT authentication removed for simplified deployment. The app now:
- No login required
- Direct access to dashboard
- No token-based API calls

### CI=false Flag
The build command includes `CI=false` to prevent treating warnings as errors during build, which is common in CI/CD environments.

### API Configuration
The app uses environment variables for API endpoints:
- Development: `http://localhost:5004` (default)
- Production: Set via `REACT_APP_API_URL` environment variable

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Ensure Node version is 18 or higher
- Review build logs in Netlify dashboard

### API Calls Fail
- Verify `REACT_APP_API_URL` is set correctly
- Check CORS settings on your backend
- Ensure backend is running and accessible

### Blank Page After Deploy
- Check browser console for errors
- Verify build completed successfully
- Check that `netlify.toml` redirects are configured

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5004" > .env

# Start development server
npm start
```

## Backend CORS Configuration

Make sure your backend allows requests from your Netlify domain. Update CORS settings to include:
```javascript
cors({
  origin: ['https://your-netlify-app.netlify.app', 'http://localhost:3000'],
  credentials: true
})
```
