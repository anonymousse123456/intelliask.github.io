# 🔧 Update Vercel URL in Frontend

After deploying your backend to Vercel, you need to update the frontend to point to your Vercel API endpoint.

## Quick Steps

### 1. Deploy Backend to Vercel

```bash
vercel --prod
```

Copy the URL that Vercel gives you. It will look like:
```
https://intelliask-backend-abc123.vercel.app
```

### 2. Update Frontend

Open `static/js/index.js` and find line 42:

**Before:**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://YOUR_VERCEL_PROJECT.vercel.app/api';  // TODO: Replace with your Vercel URL
```

**After (replace with your actual URL):**
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://intelliask-backend-abc123.vercel.app/api';  // Your actual Vercel URL
```

### 3. Commit and Push to GitHub

```bash
git add static/js/index.js
git commit -m "Update Vercel API URL"
git push origin main
```

### 4. Done!

GitHub Pages will automatically rebuild and your demo will be live!

## Complete Example

If your Vercel deployment URL is:
```
https://intelliask-backend-xyz789.vercel.app
```

Your configuration should be:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://intelliask-backend-xyz789.vercel.app/api';
```

## Verification

### Test Your API Endpoint

```bash
# Test OPTIONS (CORS preflight)
curl https://your-vercel-url.vercel.app/api/upload -X OPTIONS

# Should return HTTP 204 with CORS headers
```

### Test End-to-End

1. Visit your GitHub Pages site: `https://YOUR_USERNAME.github.io/YOUR_REPO`
2. Open browser DevTools (F12) → Console
3. Upload a PDF in the "Try IntelliAsk" section
4. Watch the console for API requests
5. Verify the request goes to your Vercel URL

## Troubleshooting

### "Failed to fetch" Error

**Problem**: Frontend can't reach backend

**Solution**:
1. Check the Vercel URL is correct (no typos)
2. Ensure CORS headers are set in `api/upload.py`
3. Test backend directly with curl

### CORS Error

**Problem**: "No 'Access-Control-Allow-Origin' header"

**Solution**:
1. Verify `vercel.json` has CORS headers configured
2. Check `api/upload.py` sets CORS headers in response
3. Redeploy Vercel: `vercel --prod`

### Still Shows "TODO: Replace"

**Problem**: Forgot to update the URL

**Solution**:
1. Edit `static/js/index.js` line 42
2. Replace `YOUR_VERCEL_PROJECT.vercel.app` with actual URL
3. Commit and push to GitHub

## One-Line Update Script

```bash
# Replace YOUR_VERCEL_URL with your actual URL
VERCEL_URL="intelliask-backend-abc123.vercel.app"
sed -i "s|YOUR_VERCEL_PROJECT.vercel.app|$VERCEL_URL|g" static/js/index.js
git add static/js/index.js
git commit -m "Update Vercel API URL"
git push origin main
```

## Alternative: Use Environment Variable (Advanced)

If you want to avoid hardcoding the URL, you can use a build-time environment variable:

### Create `config.js`:

```javascript
// static/js/config.js
window.CONFIG = {
    API_BASE_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : 'https://intelliask-backend-abc123.vercel.app/api'
};
```

### Update `index.html`:

```html
<script src="./static/js/config.js"></script>
<script src="./static/js/index.js"></script>
```

### Update `index.js`:

```javascript
const API_BASE_URL = window.CONFIG.API_BASE_URL;
```

This way, you only need to update one file (`config.js`) when changing the API URL.
