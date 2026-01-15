# Deploy IntelliAsk Backend to Railway

Railway is a modern platform that makes deploying Flask apps easy. Follow these steps:

## Step 1: Sign Up / Login to Railway

1. Go to https://railway.app
2. Click "Login" and sign in with GitHub
3. Authorize Railway to access your GitHub account

## Step 2: Create New Project

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `anonymousse123456/intelliask.github.io`
4. Railway will automatically detect the Python app

## Step 3: Configure Environment Variables

1. In your Railway project, click on your service
2. Go to the "Variables" tab
3. Click "New Variable"
4. Add:
   - **Variable**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
5. Click "Add"

## Step 4: Configure Port (Important!)

Railway expects your app to listen on a dynamic port. Let's update the Flask server:

Edit `backend/server.py` to use Railway's PORT:

```python
if __name__ == '__main__':
    # Check for required environment variables
    if not os.environ.get('GEMINI_API_KEY'):
        print("Warning: GEMINI_API_KEY environment variable not set")

    # Use PORT from environment for Railway, default to 5000 for local
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

## Step 5: Get Your Railway URL

1. After deployment completes, Railway will show your URL
2. It will look like: `https://your-app-production-xxxx.up.railway.app`
3. Copy this URL

## Step 6: Update Frontend

Edit `static/js/index.js` line 44:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://your-app-production-xxxx.up.railway.app/api';
```

## Step 7: Test

Test your backend:

```bash
curl https://your-railway-url.railway.app/api/health
```

Should return:
```json
{"status": "healthy", "message": "IntelliAsk backend is running"}
```

## Step 8: Push to GitHub

```bash
git add .
git commit -m "Configure for Railway deployment"
git push origin main
```

Railway will automatically redeploy on each push!

## Troubleshooting

### Check Logs

In Railway dashboard:
1. Click on your service
2. Go to "Deployments" tab
3. Click on the latest deployment
4. View logs

### Port Issues

Make sure `backend/server.py` uses:
```python
port = int(os.environ.get('PORT', 5000))
app.run(host='0.0.0.0', port=port)
```

### CORS Issues

If you get CORS errors, the headers are already configured in `backend/server.py`.

### Environment Variables

Double-check in Railway dashboard → Variables tab that `GEMINI_API_KEY` is set.

## Railway Free Tier

- $5 free credit per month
- No credit card required
- Enough for ~500 hours of runtime
- Perfect for demos and testing

## Auto-Deploy on Push

Railway automatically redeploys when you push to main branch:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway detects the push and redeploys automatically!

## Custom Domain (Optional)

1. Go to Railway project → Settings
2. Click "Generate Domain" for a `*.railway.app` domain
3. Or add your own custom domain

## Monitoring

Railway dashboard shows:
- CPU usage
- Memory usage
- Request logs
- Build logs
- Deployment history

## Cost

With typical usage for a demo:
- ~10-20 hours/month active time
- Well within $5 free tier
- No credit card needed

## Summary

Railway is perfect for this use case because:
- ✅ Better Flask support than Vercel
- ✅ Easy GitHub integration
- ✅ Auto-redeploy on push
- ✅ Simple environment variable management
- ✅ Good free tier
- ✅ Clear logs and monitoring
