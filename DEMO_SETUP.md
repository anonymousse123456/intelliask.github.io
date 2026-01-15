# IntelliAsk Live Demo Setup Guide

This guide explains how to set up and run the IntelliAsk live demo with PDF upload, OCR processing, and question generation.

## Architecture

The demo consists of three components:

1. **Frontend (HTML/JS)**: User interface for PDF upload and displaying results
2. **Backend Server (Flask)**: Python server that handles PDF processing
3. **Modal Inference**: Your deployed IntelliAsk model on Modal

### Workflow

```
User uploads PDF → Backend trims to 8 pages → Gemini OCR → Modal IntelliAsk → Questions displayed
```

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Set your Gemini API key:

```bash
export GEMINI_API_KEY="your_gemini_api_key_here"
```

Or create a `.env` file:

```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### 3. Start the Backend Server

```bash
python server.py
```

The server will start on `http://localhost:5000`

### 4. Serve the Frontend

In a new terminal, serve the frontend files. You can use Python's built-in HTTP server:

```bash
# From the root directory (intelliask.github.io)
python -m http.server 8000
```

Or use any other static file server.

### 5. Access the Demo

Open your browser and navigate to:

```
http://localhost:8000
```

Scroll down to the "Try IntelliAsk" section and upload a PDF file.

## API Configuration

The backend is configured to use:

- **Gemini Model**: `gemini-2.0-flash-exp` for OCR
- **Modal Endpoint**: `https://mailto-karun-py--intelliask-qwen3-32b-inference-01uberco-a01a74.modal.run/v1`
- **IntelliAsk Model**: `intelliask` (your deployed model on Modal)

To change these settings, edit [backend/server.py](backend/server.py):

```python
# Line 34: Change Gemini model
model="gemini-2.0-flash-exp"

# Line 15-18: Change Modal endpoint
modal_client = OpenAI(
    base_url="your_modal_endpoint_here",
    api_key="dummy"
)

# Line 60: Change IntelliAsk model name
model="intelliask"
```

## CORS Configuration

For production deployment, you'll need to update the CORS settings in the backend:

```python
# In backend/server.py
CORS(app, origins=["https://yourdomain.com"])
```

And update the frontend API URL in [static/js/index.js](static/js/index.js):

```javascript
// Line 39
const API_BASE_URL = 'https://your-backend-domain.com/api';
```

## Testing

Test the backend health endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "message": "IntelliAsk backend is running"
}
```

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure the backend server is running and CORS is properly configured
2. **Gemini API errors**: Verify your API key is set correctly
3. **Modal connection issues**: Check that your Modal endpoint is accessible
4. **PDF processing fails**: Ensure PyPDF2 is installed and the PDF is valid

### Backend Logs

The Flask server runs in debug mode by default and will show detailed error messages in the terminal.

## Production Deployment

For production deployment:

1. **Backend**: Deploy to a cloud provider (AWS, GCP, Azure) or use a platform like Render or Railway
2. **Frontend**: Host on GitHub Pages, Netlify, or Vercel (already on GitHub Pages)
3. **Environment Variables**: Use secure environment variable management
4. **HTTPS**: Ensure both frontend and backend use HTTPS
5. **Rate Limiting**: Add rate limiting to the backend to prevent abuse

## File Structure

```
intelliask.github.io/
├── backend/
│   ├── server.py              # Flask server with PDF processing pipeline
│   ├── requirements.txt       # Python dependencies
│   ├── .env.example          # Environment variable template
│   └── README.md             # Backend documentation
├── static/
│   └── js/
│       └── index.js          # Frontend JavaScript with demo logic
├── index.html                # Main website with demo UI
└── DEMO_SETUP.md            # This file
```

## Dependencies

### Backend (Python)
- Flask: Web framework
- flask-cors: CORS handling
- google-genai: Gemini API client
- openai: OpenAI-compatible client for Modal
- PyPDF2: PDF manipulation

### Frontend (JavaScript)
- jQuery: DOM manipulation
- Fetch API: HTTP requests

## Support

For issues or questions:
- Backend issues: Check [backend/README.md](backend/README.md)
- Frontend issues: Check browser console for errors
- API issues: Verify your Gemini API key and Modal endpoint
