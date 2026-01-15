# GitHub Pages + Vercel Backend Setup

This guide explains how to deploy IntelliAsk with:
- **Frontend**: Hosted on GitHub Pages (free, static)
- **Backend**: Hosted on Vercel (free, serverless)

## Architecture

```
GitHub Pages (Frontend)
    https://intelliask.github.io
         ↓
    [User uploads PDF]
         ↓
Vercel Backend (API)
    https://your-project.vercel.app/api/upload
         ↓
    [Trim PDF → Gemini OCR → Modal IntelliAsk]
         ↓
    [Return questions]
         ↓
GitHub Pages (Display results)
```

## Step 1: Deploy Backend to Vercel

### Install Vercel CLI

```bash
npm install -g vercel
```

### Login to Vercel

```bash
vercel login
```

### Deploy Backend Only

```bash
cd /home/vidusheevats/Documents/intelliask.github.io
vercel --prod
```

When prompted:
- **Project name**: `intelliask-backend` (or your preferred name)
- Accept other defaults

### Add Environment Variable

```bash
vercel env add GEMINI_API_KEY
```

When prompted:
- Paste your Gemini API key
- Select "Production" environment

### Redeploy with Environment Variable

```bash
vercel --prod
```

### Note Your Vercel URL

After deployment, Vercel will give you a URL like:
```
https://intelliask-backend-xyz123.vercel.app
```

**IMPORTANT**: Copy this URL, you'll need it in the next step!

## Step 2: Update Frontend Configuration

Edit `static/js/index.js` at line 42:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://YOUR_VERCEL_URL.vercel.app/api';  // Replace with your actual Vercel URL
```

Replace `YOUR_VERCEL_URL` with your actual Vercel project URL from Step 1.

**Example:**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://intelliask-backend-xyz123.vercel.app/api';
```

## Step 3: Deploy Frontend to GitHub Pages

### Commit and Push Changes

```bash
git add .
git commit -m "Add IntelliAsk live demo with Vercel backend"
git push origin main
```

### Enable GitHub Pages (if not already enabled)

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**

GitHub Pages will automatically build and deploy your site at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME
```

For example: `https://intelliask.github.io`

## Step 4: Test Your Deployment

### Test Backend

```bash
curl https://your-vercel-url.vercel.app/api/upload \
  -X OPTIONS \
  -H "Origin: https://intelliask.github.io"
```

Should return HTTP 204 with CORS headers.

### Test Frontend

1. Visit your GitHub Pages URL (e.g., `https://intelliask.github.io`)
2. Scroll to "Try IntelliAsk" section
3. Upload a research paper PDF (< 10 pages recommended)
4. Click "Generate Questions with IntelliAsk"
5. Wait for results (may take 30-60 seconds)

## Configuration Summary

### What's on GitHub Pages (Free Static Hosting)
- `index.html` - Main website
- `static/` - CSS, JS, images
- All static content

### What's on Vercel (Free Serverless Backend)
- `api/upload.py` - Serverless function
- PDF processing (PyPDF2)
- Gemini OCR integration
- Modal IntelliAsk integration

### Benefits of This Setup

✅ **Separate Concerns**: Frontend and backend are decoupled
✅ **Free Hosting**: Both GitHub Pages and Vercel free tiers
✅ **Auto-scaling**: Vercel scales automatically
✅ **HTTPS**: Both have HTTPS by default
✅ **Easy Updates**:
  - Frontend: Just push to GitHub
  - Backend: Run `vercel --prod`

## Local Development

To test locally before deploying:

### Terminal 1: Backend
```bash
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY="your_key"
python server.py
```

### Terminal 2: Frontend
```bash
python -m http.server 8000
```

Visit: `http://localhost:8000`

The JavaScript will automatically use `http://localhost:5000/api` when running locally.

## Updating Your Deployment

### Update Backend
```bash
# Make changes to api/upload.py or backend code
vercel --prod
```

### Update Frontend
```bash
# Make changes to HTML, CSS, or JS
git add .
git commit -m "Update frontend"
git push origin main
```

GitHub Pages will automatically rebuild and deploy.

## CORS Configuration

The backend is already configured with CORS headers to allow requests from any origin:

```python
# In api/upload.py
response.headers['Access-Control-Allow-Origin'] = '*'
```

For production, you might want to restrict this to only your GitHub Pages domain:

```python
response.headers['Access-Control-Allow-Origin'] = 'https://intelliask.github.io'
```

## Troubleshooting

### CORS Errors

**Symptom**: "No 'Access-Control-Allow-Origin' header" in browser console

**Solution**:
1. Check that Vercel backend is deployed correctly
2. Verify CORS headers in `api/upload.py`
3. Check browser network tab for actual response headers

### Wrong API URL

**Symptom**: "Failed to fetch" or "Network error"

**Solution**:
1. Verify you updated `static/js/index.js` with correct Vercel URL
2. Test backend directly: `curl https://your-vercel-url.vercel.app/api/upload -X OPTIONS`
3. Check browser console for the actual URL being called

### Backend Timeout

**Symptom**: Request takes too long or times out

**Solution**:
1. Vercel free tier has 10-second timeout
2. Try with smaller PDFs (< 5 pages)
3. Check Vercel function logs for errors
4. Consider upgrading to Vercel Pro for 60-second timeout

### Gemini API Errors

**Symptom**: "Gemini OCR failed" error message

**Solution**:
1. Verify GEMINI_API_KEY is set in Vercel: `vercel env ls`
2. Check your Gemini API quota: https://console.cloud.google.com/
3. Ensure PDF is not corrupted or password-protected

### Modal Connection Errors

**Symptom**: "Modal inference failed" error message

**Solution**:
1. Verify your Modal endpoint is accessible
2. Test Modal endpoint directly with curl
3. Check Modal logs for errors

## Monitoring

### Vercel Logs

View function logs in real-time:

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click on the latest deployment
4. Click "Functions" tab
5. Click on `/api/upload` to see logs

### GitHub Pages Status

Check build status:

1. Go to your GitHub repository
2. Click "Actions" tab
3. View "pages build and deployment" workflows

## Cost Considerations

### GitHub Pages (FREE)
- 100 GB bandwidth/month
- 100 GB storage
- Perfect for static sites

### Vercel Free Tier (FREE)
- 100 GB bandwidth/month
- 100 hours serverless execution/month
- 10-second function timeout
- Unlimited deployments

**Estimate**: With these limits, you can handle ~1000-2000 demo requests per month for free.

## Production Optimization

For higher usage, consider:

1. **Cache Responses**: Cache Gemini OCR results
2. **Rate Limiting**: Add rate limiting to prevent abuse
3. **Compression**: Compress PDF before uploading
4. **Pagination**: Split large PDFs into multiple requests
5. **Analytics**: Add analytics to track usage

## Alternative: Custom Domain

### Add Custom Domain to Vercel

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain (e.g., `api.intelliask.com`)
3. Update DNS records as instructed
4. Update `static/js/index.js` to use custom domain

### Add Custom Domain to GitHub Pages

1. Go to GitHub → Settings → Pages
2. Add custom domain (e.g., `intelliask.com`)
3. Update DNS records
4. Enable "Enforce HTTPS"

## Security Considerations

### API Key Protection

✅ **Correct**: API key stored in Vercel environment variables
❌ **Wrong**: Never put API key in frontend JavaScript

### CORS

For production, restrict CORS to your domain:

```python
# In api/upload.py
allowed_origins = ['https://intelliask.github.io']
origin = request.headers.get('Origin')
if origin in allowed_origins:
    response.headers['Access-Control-Allow-Origin'] = origin
```

### Rate Limiting

Consider adding rate limiting to prevent abuse:

```python
from flask_limiter import Limiter

limiter = Limiter(app, key_func=lambda: request.remote_addr)

@limiter.limit("10 per hour")
@app.route('/api/upload', methods=['POST'])
def handler(request):
    # ... your code
```

## Support

- **Backend Issues**: Check Vercel function logs
- **Frontend Issues**: Check browser console
- **API Issues**: Test with curl
- **Deployment Issues**: See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
