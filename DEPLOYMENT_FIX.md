# Fix "Failed to Fetch" Error

## The Problem

Your frontend is deployed on Netlify but can't connect to the backend because:
1. Backend is not deployed yet, OR
2. Backend URL is not configured in Netlify, OR
3. Backend CORS is not allowing Netlify domain

## Quick Solution: Deploy Backend First

### Step 1: Deploy Backend to Render

1. Go to [Render.com](https://render.com/)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: portfolio-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `PORT`: 5004
7. Click "Create Web Service"
8. Wait for deployment (5-10 minutes)
9. **Copy the backend URL** (e.g., `https://portfolio-backend-xxx.onrender.com`)

### Step 2: Update Netlify Environment Variable

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Add/Update:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: Your Render backend URL (from Step 1)
5. Click "Save"
6. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy**

### Step 3: Update Backend CORS

The backend needs to allow your Netlify domain. I'll update the code now.

