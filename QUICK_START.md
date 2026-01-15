# 🚀 IntelliAsk Demo - Quick Start Guide

Get your IntelliAsk demo live in **10 minutes**!

## Architecture

```
┌─────────────────────┐
│  GitHub Pages       │  Frontend (HTML/CSS/JS)
│  intelliask.github.io
└──────────┬──────────┘
           │
           │ API calls
           ↓
┌─────────────────────┐
│  Vercel             │  Backend (Python serverless)
│  your-project.vercel.app/api
└──────────┬──────────┘
           │
           ├─→ Gemini API (OCR)
           └─→ Modal (IntelliAsk inference)
```

## Prerequisites

- [x] GitHub account (you have this)
- [ ] Vercel account (free) - https://vercel.com/signup
- [ ] Gemini API key (free) - https://makersuite.google.com/app/apikey
- [ ] Node.js installed (for Vercel CLI)

## Step-by-Step Deployment

### 1️⃣ Deploy Backend to Vercel (5 minutes)

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to your project
cd /home/vidusheevats/Documents/intelliask.github.io

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

When prompted:
- **Set up and deploy?** `Y`
- **Which scope?** Select your account
- **Project name?** `intelliask-backend` (or any name you prefer)
- **In which directory?** `./ (just press Enter)`

Vercel will deploy and give you a URL like:
```
✅ Production: https://intelliask-backend-abc123.vercel.app
```

**📝 COPY THIS URL! You'll need it in the next step.**

### 2️⃣ Add Gemini API Key (1 minute)

```bash
vercel env add GEMINI_API_KEY
```

When prompted:
- Paste your Gemini API key
- Select: **Production**
- Confirm: `Y`

Redeploy to apply the environment variable:
```bash
vercel --prod
```

### 3️⃣ Update Frontend Configuration (2 minutes)

Open `static/js/index.js` and find line 44:

**Replace:**
```javascript
: 'https://YOUR_VERCEL_PROJECT.vercel.app/api';
```

**With your actual Vercel URL:**
```javascript
: 'https://intelliask-backend-abc123.vercel.app/api';
```

**Quick way using sed:**
```bash
# Replace YOUR_VERCEL_URL with your actual URL
sed -i 's|YOUR_VERCEL_PROJECT.vercel.app|intelliask-backend-abc123.vercel.app|g' static/js/index.js
```

### 4️⃣ Deploy to GitHub Pages (2 minutes)

```bash
# Commit changes
git add .
git commit -m "Add IntelliAsk demo with Vercel backend"

# Push to GitHub
git push origin main
```

GitHub Pages will automatically build and deploy your site!

If GitHub Pages is not enabled:
1. Go to GitHub repo → Settings → Pages
2. Source: Deploy from branch `main`, folder `/ (root)`
3. Save

Your site will be live at: `https://YOUR_USERNAME.github.io/YOUR_REPO`

### 5️⃣ Test Your Demo (30 seconds)

1. Visit your GitHub Pages URL
2. Scroll to "Try IntelliAsk" section
3. Upload a research paper PDF
4. Click "Generate Questions with IntelliAsk"
5. Wait 30-60 seconds for results

🎉 **Done!** Your demo is live!

## Verification Checklist

- [ ] Backend deployed to Vercel
- [ ] Gemini API key added to Vercel
- [ ] Frontend updated with Vercel URL
- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Demo tested with a PDF

## Testing Commands

### Test Vercel Backend
```bash
curl https://your-vercel-url.vercel.app/api/upload -X OPTIONS
```

Should return: `HTTP 204` with CORS headers

### Test Frontend Connection
1. Open browser DevTools (F12) → Console
2. Upload a PDF in the demo
3. Check console for API requests
4. Verify requests go to your Vercel URL

## Troubleshooting

### "Failed to fetch" Error
- ❌ Wrong Vercel URL in `static/js/index.js`
- ✅ Double-check line 44 has correct URL

### CORS Error
- ❌ Backend not deployed correctly
- ✅ Redeploy: `vercel --prod`

### "Gemini OCR failed" Error
- ❌ API key not set or invalid
- ✅ Check: `vercel env ls`
- ✅ Re-add: `vercel env add GEMINI_API_KEY`

### Timeout Error
- ❌ PDF too large
- ✅ Try a smaller PDF (< 5 pages)
- ✅ Vercel free tier has 10s timeout

## What's Next?

### Monitor Usage
- **Vercel Dashboard**: https://vercel.com/dashboard
  - View function logs
  - Check bandwidth usage
  - Monitor errors

### Update Backend
```bash
# Make changes to api/upload.py
vercel --prod
```

### Update Frontend
```bash
# Make changes to HTML/CSS/JS
git add .
git commit -m "Update frontend"
git push origin main
```

GitHub Pages auto-rebuilds in ~1 minute.

### Add Custom Domain (Optional)

**For Vercel Backend:**
1. Vercel Dashboard → Project → Settings → Domains
2. Add domain (e.g., `api.intelliask.com`)
3. Update DNS records

**For GitHub Pages:**
1. GitHub → Settings → Pages
2. Custom domain: `intelliask.com`
3. Update DNS records

## Cost

Both services are **FREE** for this use case:

| Service | Free Tier | Sufficient For |
|---------|-----------|----------------|
| **GitHub Pages** | 100 GB bandwidth/month | ✅ Yes, plenty |
| **Vercel** | 100 GB bandwidth/month<br>100 hours execution/month | ✅ ~1000-2000 demos/month |

## Local Development

To test before deploying:

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

## Support & Documentation

- **Complete Guide**: [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md)
- **Update URL**: [UPDATE_VERCEL_URL.md](UPDATE_VERCEL_URL.md)
- **Local Setup**: [DEMO_SETUP.md](DEMO_SETUP.md)
- **Troubleshooting**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

## Success!

You now have:
- ✅ Live demo on GitHub Pages
- ✅ Serverless backend on Vercel
- ✅ PDF processing with Gemini OCR
- ✅ Question generation with IntelliAsk
- ✅ Free hosting with auto-scaling

Share your demo: `https://YOUR_USERNAME.github.io/YOUR_REPO`
