# IntelliAsk Live Demo - Deployment Guide

This repository contains the IntelliAsk live demo with a fully functional PDF upload and question generation system.

## 📁 Project Structure

```
intelliask.github.io/
├── api/
│   └── upload.py              # Vercel serverless function (backend)
├── backend/                    # Alternative: Local Flask server
│   ├── server.py
│   ├── requirements.txt
│   └── README.md
├── static/
│   ├── css/
│   ├── js/
│   │   └── index.js           # Frontend logic with API integration
│   └── images/
├── index.html                  # Main website
├── vercel.json                 # Vercel deployment config
├── requirements.txt            # Python dependencies for Vercel
├── DEPLOYMENT_QUICK_START.md  # ⭐ Start here for deployment
├── VERCEL_DEPLOYMENT.md       # Detailed deployment guide
└── DEMO_SETUP.md              # Local development setup
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Production)

**Best for:** Production deployment, auto-scaling, free tier

```bash
vercel --prod
```

See [DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md) for step-by-step guide.

### Option 2: Local Development

**Best for:** Testing and development

```bash
# Terminal 1: Start backend
cd backend
pip install -r requirements.txt
export GEMINI_API_KEY="your_key"
python server.py

# Terminal 2: Start frontend
python -m http.server 8000
```

See [DEMO_SETUP.md](DEMO_SETUP.md) for detailed setup.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key for OCR | Yes |

Get your key: https://makersuite.google.com/app/apikey

### API Endpoints

The backend is configured to use:
- **Gemini**: `gemini-2.0-flash-exp` for OCR
- **Modal**: Your deployed IntelliAsk model endpoint

To change the Modal endpoint, edit:
- Vercel: `api/upload.py` (line 15)
- Local: `backend/server.py` (line 15)

## 🧪 Testing

### Test Vercel Deployment
```bash
curl https://your-project.vercel.app/api/upload -X OPTIONS
```

### Test Local Setup
```bash
curl http://localhost:5000/api/health
```

### Test End-to-End
1. Visit your deployed URL or `http://localhost:8000`
2. Scroll to "Try IntelliAsk"
3. Upload a research paper PDF
4. Click "Generate Questions with IntelliAsk"

## 📊 Pipeline Overview

```
User Upload (PDF)
    ↓
Trim to 8 pages (PyPDF2)
    ↓
Extract text (Gemini OCR)
    ↓
Generate questions (Modal/IntelliAsk)
    ↓
Display results (Frontend)
```

## 🛠️ Tech Stack

- **Frontend**: HTML, CSS (Bulma), JavaScript (jQuery)
- **Backend**: Python, Flask
- **Deployment**: Vercel Serverless Functions
- **OCR**: Google Gemini API
- **Inference**: Modal (IntelliAsk model)

## 📚 Documentation

- **[DEPLOYMENT_QUICK_START.md](DEPLOYMENT_QUICK_START.md)** - Quick Vercel deployment (5 minutes)
- **[VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)** - Detailed Vercel guide with troubleshooting
- **[DEMO_SETUP.md](DEMO_SETUP.md)** - Local development and testing
- **[backend/README.md](backend/README.md)** - Backend API documentation

## 🐛 Troubleshooting

### Common Issues

1. **CORS errors**: Check API URL in `static/js/index.js`
2. **Gemini API errors**: Verify API key is set correctly
3. **Modal timeout**: Try with smaller PDFs (< 8 pages)
4. **Function timeout (Vercel)**: Free tier has 10s limit, upgrade for 60s

### Getting Help

- Check function logs in Vercel Dashboard
- Review browser console for frontend errors
- Test each component separately (Gemini, Modal, frontend)

## 📄 License

Creative Commons Attribution-ShareAlike 4.0 International License

## 🎓 Citation

If you use IntelliAsk in your research, please cite:

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

- **Demo**: Your Vercel URL or GitHub Pages
- **Code**: https://anonymous.4open.science/r/IntelliA-3E09/
- **Paper**: Coming Soon (ACL 2026)
