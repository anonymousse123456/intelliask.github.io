# IntelliAsk: Preference Optimization for Review Question Generation

[![Website](https://img.shields.io/badge/Website-Live-blue)](https://intelliask.github.io)
[![Paper](https://img.shields.io/badge/Paper-ACL%202026-red)]()
[![Code](https://img.shields.io/badge/Code-Anonymous-green)](https://anonymous.4open.science/r/IntelliA-3E09/)

This repository contains the website and live demo for **IntelliAsk**, a system that generates critical peer review questions through reinforcement learning with human preferences.

## 🚀 Quick Deploy

**Architecture**: Frontend on GitHub Pages + Backend on Vercel

### Step 1: Deploy Backend to Vercel

```bash
npm install -g vercel
vercel --prod
vercel env add GEMINI_API_KEY
vercel --prod
```

### Step 2: Update Frontend with Vercel URL

Edit `static/js/index.js` line 44 and replace `YOUR_VERCEL_PROJECT.vercel.app` with your actual Vercel URL.

### Step 3: Push to GitHub Pages

```bash
git add .
git commit -m "Add IntelliAsk demo with Vercel backend"
git push origin main
```

See [GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md) for detailed instructions.

## 📖 About IntelliAsk

IntelliAsk learns to generate critical, evidence-based peer review questions through reinforcement learning with human preferences. Training on question quality improves both reasoning and writing abilities.

**Key Features:**
- Generates high-effort, evidence-based review questions
- Trained with DAPO (Decoupled Clip and Dynamic Sampling Policy Optimization)
- Uses IntelliReward model for evaluating question quality
- Achieves 0.55/3.0 on automatic evaluation, competitive with frontier models

## 🎯 Live Demo

The website includes an interactive demo where you can:
1. Upload a research paper (PDF)
2. Automatically trim to first 8 pages
3. Extract text using Gemini OCR
4. Generate critical review questions using IntelliAsk

**Try it:** [Live Demo](https://intelliask.github.io) (once deployed)

## 📁 Repository Structure

```
├── api/upload.py              # Backend serverless function (Vercel)
├── backend/                   # Alternative: Local Flask server
├── static/                    # Frontend assets (CSS, JS, images)
├── index.html                 # Main website
├── vercel.json                # Vercel configuration
├── DEPLOYMENT_QUICK_START.md  # ⭐ Deploy guide
└── DEMO_SETUP.md             # Local development guide
```

## 🛠️ Development

### Prerequisites

- Python 3.9+
- Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))
- Node.js (for Vercel CLI)

### Local Setup

```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Set environment variable
export GEMINI_API_KEY="your_api_key"

# Start backend server
python server.py

# In another terminal, serve frontend
python -m http.server 8000
```

Visit `http://localhost:8000`

See [DEMO_SETUP.md](DEMO_SETUP.md) for detailed instructions.

## 🌐 Deployment Architecture

- **Frontend**: GitHub Pages (free, static hosting)
- **Backend API**: Vercel (free, serverless functions)
- **Inference**: Modal (your deployed IntelliAsk model)

### Why This Setup?

✅ **Free Hosting**: Both GitHub Pages and Vercel free tiers
✅ **Separate Concerns**: Frontend and backend are decoupled
✅ **Auto-scaling**: Vercel scales automatically
✅ **Easy Updates**: Just push to GitHub or run `vercel --prod`

### Deployment Guides

- **[GITHUB_PAGES_SETUP.md](GITHUB_PAGES_SETUP.md)** - Complete setup guide ⭐
- **[UPDATE_VERCEL_URL.md](UPDATE_VERCEL_URL.md)** - How to connect frontend to backend
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Detailed Vercel configuration

## 📊 Pipeline

```
PDF Upload → Trim (8 pages) → Gemini OCR → IntelliAsk (Modal) → Questions
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for OCR | ✅ Yes |

### API Endpoints

Configure in `api/upload.py` or `backend/server.py`:

- **Gemini Model**: `gemini-2.0-flash-exp` (line 47)
- **Modal Endpoint**: Your IntelliAsk deployment (line 15)

## 📚 Documentation

- **[DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)** - Deploy in 5 minutes
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Detailed Vercel guide
- **[DEMO_SETUP.md](DEMO_SETUP.md)** - Local development
- **[README_DEPLOYMENT.md](README_DEPLOYMENT.md)** - Complete reference

## 🧪 Testing

```bash
# Test backend health
curl http://localhost:5000/api/health

# Test Vercel deployment
curl https://your-project.vercel.app/api/upload -X OPTIONS
```

## 📄 Citation

```bibtex
@inproceedings{intelliask2026,
  author    = {Anonymous Authors},
  title     = {Preference Optimization for Review Question Generation Improves Writing Quality},
  booktitle = {Proceedings of the 64th Annual Meeting of the Association for Computational Linguistics (ACL)},
  year      = {2026},
  url       = {https://anonymous.4open.science/r/IntelliA-3E09/}
}
```

## 🔗 Links

- **Website**: [intelliask.github.io](https://intelliask.github.io)
- **Code**: [Anonymous Repository](https://anonymous.4open.science/r/IntelliA-3E09/)
- **Paper**: Coming Soon (ACL 2026)

## 📜 License

<a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-sa/4.0/88x31.png" /></a>

This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.

---

Website template based on [Nerfies](https://github.com/nerfies/nerfies.github.io)
