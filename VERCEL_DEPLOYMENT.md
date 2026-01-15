# Deploying IntelliAsk to Vercel (with GitHub Pages Frontend)

This guide explains how to deploy the IntelliAsk demo with the backend on Vercel and frontend on GitHub Pages.

## Architecture

- **Frontend**: Hosted on GitHub Pages (https://intelliask.github.io)
- **Backend API**: Hosted on Vercel as serverless functions
- **Modal**: Your IntelliAsk model inference endpoint

## Prerequisites

1. GitHub account (you already have this)
2. Vercel account (free tier is sufficient)
3. Gemini API key

## Deployment Steps

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Set Environment Variables in Vercel

Before deploying, you need to add your Gemini API key to Vercel:

**Option A: Using Vercel CLI**
```bash
vercel env add GEMINI_API_KEY
# When prompted, paste your Gemini API key
# Select "Production" environment
```

**Option B: Using Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project (after first deployment)
3. Go to Settings → Environment Variables
4. Add `GEMINI_API_KEY` with your API key value
5. Select "Production" environment

### Step 4: Deploy to Vercel

From your project root directory:

```bash
vercel --prod
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Select your account
- **Link to existing project?** No (first time) / Yes (subsequent deploys)
- **What's your project's name?** intelliask-demo (or your preferred name)
- **In which directory is your code located?** ./ (press Enter)

Vercel will:
1. Build your project
2. Deploy the serverless functions
3. Give you a production URL like `https://intelliask-demo.vercel.app`

### Step 5: Update Frontend Configuration

The frontend is already configured to auto-detect the environment:
- **Local development**: Uses `http://localhost:5000/api`
- **Production**: Uses `/api` (proxied through Vercel)

However, if you want to use Vercel backend with GitHub Pages frontend, update the API URL:

Edit `static/js/index.js` line 39-42:

```javascript
const API_BASE_URL = window.location.hostname === 'intelliask.github.io'
    ? 'https://intelliask-demo.vercel.app/api'  // Your Vercel URL
    : window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api';
```

### Step 6: Push to GitHub

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

GitHub Pages will automatically update your frontend.

## Configuration Files Explained

### `vercel.json`
Configures Vercel deployment:
- Routes API requests to Python serverless function
- Serves static files (HTML, CSS, JS)
- Sets environment variables

### `api/upload.py`
Serverless function that handles:
- PDF upload
- PDF trimming (first 8 pages)
- Gemini OCR
- Modal inference
- CORS handling

### `requirements.txt`
Python dependencies for Vercel to install

### `.vercelignore`
Files to exclude from Vercel deployment

## Testing Your Deployment

### 1. Test the Vercel Backend

```bash
curl https://your-vercel-url.vercel.app/api/upload \
  -X OPTIONS \
  -H "Origin: https://intelliask.github.io"
```

### 2. Test End-to-End

1. Visit your GitHub Pages URL: `https://intelliask.github.io`
2. Scroll to "Try IntelliAsk" section
3. Upload a PDF
4. Click "Generate Questions"

## Deployment Options

### Option 1: Full Vercel Deployment (Recommended)

Deploy both frontend and backend to Vercel:

```bash
vercel --prod
```

Access at: `https://your-project.vercel.app`

**Advantages:**
- Single domain (no CORS issues)
- Faster (same edge network)
- Easier to manage

### Option 2: Hybrid (GitHub Pages + Vercel)

Keep frontend on GitHub Pages, backend on Vercel:

1. Deploy backend to Vercel
2. Update frontend to use Vercel API URL
3. Keep GitHub Pages for frontend

**Advantages:**
- Use free GitHub Pages hosting
- Backend on serverless (scales automatically)

### Option 3: Local Development

Use the original Flask setup:

```bash
cd backend
python server.py
```

```bash
python -m http.server 8000
```

## Environment Variables

Set these in Vercel:

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

The Modal endpoint is hardcoded in the code. To change it, edit `api/upload.py` line 15.

## Monitoring and Logs

View logs in Vercel Dashboard:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Click on a deployment
4. View "Functions" tab for logs

## Updating Your Deployment

After making changes:

```bash
git add .
git commit -m "Update deployment"
git push origin main
vercel --prod
```

## Cost Considerations

**Vercel Free Tier:**
- 100 GB bandwidth/month
- 100 hours serverless function execution/month
- Unlimited deployments

This is sufficient for a demo/research project.

## Troubleshooting

### CORS Errors
- Check that CORS headers are set in `api/upload.py`
- Verify the API URL in `static/js/index.js`

### Function Timeout
- Vercel free tier: 10s timeout
- If processing takes longer, consider:
  - Upgrading to Pro plan (60s timeout)
  - Optimizing PDF processing
  - Using smaller PDFs

### Environment Variables Not Working
- Redeploy after setting env vars: `vercel --prod`
- Check spelling of variable names
- Verify in Vercel Dashboard → Settings → Environment Variables

### Gemini API Errors
- Check your API key is valid
- Verify you have Gemini API access
- Check API quotas in Google Cloud Console

## Alternative: Deploy to Other Platforms

If you prefer other platforms:

### Railway.app
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Render.com
1. Create a new Web Service
2. Connect your GitHub repo
3. Set environment variables
4. Deploy

### Google Cloud Run
```bash
gcloud run deploy intelliask-backend \
  --source backend/ \
  --region us-central1 \
  --allow-unauthenticated
```

## Support

For deployment issues:
- Vercel: https://vercel.com/docs
- Check function logs in Vercel Dashboard
- Test locally first: `vercel dev`
