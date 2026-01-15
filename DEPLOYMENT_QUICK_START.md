# Quick Start: Deploy IntelliAsk Demo to Vercel

## 🚀 5-Minute Deployment

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
cd /home/vidusheevats/Documents/intelliask.github.io
vercel --prod
```

### 4. Add Your Gemini API Key
```bash
vercel env add GEMINI_API_KEY
# Paste your Gemini API key when prompted
# Select "Production" environment
```

### 5. Redeploy with Environment Variable
```bash
vercel --prod
```

### 6. Done! 🎉
Your API will be live at: `https://your-project.vercel.app/api/upload`

## Testing Your Deployment

Visit your Vercel URL and try uploading a PDF in the "Try IntelliAsk" section.

## What Was Deployed?

- ✅ Backend API as serverless function (`/api/upload`)
- ✅ Frontend (HTML, CSS, JS)
- ✅ Auto-scaling infrastructure
- ✅ HTTPS enabled
- ✅ Global CDN

## Files Created for Vercel

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel configuration |
| `api/upload.py` | Serverless function for PDF processing |
| `requirements.txt` | Python dependencies |
| `.vercelignore` | Files to exclude from deployment |

## Local Development (Optional)

To test locally before deploying:

```bash
# Install dependencies
pip install -r requirements.txt

# Start local dev server
vercel dev
```

Then visit `http://localhost:3000`

## Environment Variables

Required in Vercel:

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `GEMINI_API_KEY` | Your API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |

## Next Steps

1. **Custom Domain** (Optional): Add your domain in Vercel Dashboard → Settings → Domains
2. **Monitor Usage**: Check Vercel Dashboard for function logs and analytics
3. **Update Code**: Push to GitHub and run `vercel --prod` to redeploy

## Troubleshooting

### "GEMINI_API_KEY not found"
```bash
vercel env add GEMINI_API_KEY
vercel --prod
```

### "Function timed out"
- Vercel free tier has 10s timeout
- Try with smaller PDFs (< 5 pages)
- Or upgrade to Pro for 60s timeout

### "CORS error"
- Should work automatically with the configuration
- If issues persist, check browser console for details

## Cost

**Vercel Free Tier:**
- 100 GB bandwidth/month
- 100 hours serverless execution/month
- Perfect for demos and research projects

## Support

- Full guide: See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- Vercel docs: https://vercel.com/docs
- Issues: Check function logs in Vercel Dashboard
