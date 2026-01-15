# IntelliAsk Demo Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         User's Browser                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │            intelliask.github.io                        │    │
│  │            (GitHub Pages - Static)                     │    │
│  │                                                        │    │
│  │  • HTML/CSS/JS                                        │    │
│  │  • PDF Upload Interface                               │    │
│  │  • Results Display                                    │    │
│  └────────────────┬───────────────────────────────────────┘    │
│                   │                                             │
│                   │ HTTP POST /api/upload                      │
│                   │ (PDF file in multipart/form-data)          │
└───────────────────┼─────────────────────────────────────────────┘
                    │
                    ↓
┌──────────────────────────────────────────────────────────────────┐
│              Vercel Serverless Function                         │
│              (your-project.vercel.app/api/upload)               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  api/upload.py (Python Serverless Function)             │  │
│  │                                                          │  │
│  │  Step 1: Receive PDF                                    │  │
│  │  Step 2: Trim to 8 pages (PyPDF2)                      │  │
│  │  Step 3: Extract text (Gemini API) ──────────┐         │  │
│  │  Step 4: Generate questions (Modal API) ──┐  │         │  │
│  │  Step 5: Return JSON response               │  │         │  │
│  └──────────────────────────────────────────┼──┼──────────┘  │
│                                              │  │             │
└──────────────────────────────────────────────┼──┼─────────────┘
                                               │  │
                    ┌──────────────────────────┘  │
                    │                             │
                    ↓                             ↓
        ┌───────────────────────┐   ┌───────────────────────┐
        │   Google Gemini API   │   │    Modal Platform     │
        │                       │   │                       │
        │  • gemini-2.0-flash   │   │  • IntelliAsk Model   │
        │  • OCR Processing     │   │  • Question Gen       │
        │  • Text Extraction    │   │  • vLLM Inference     │
        └───────────────────────┘   └───────────────────────┘
```

## Component Breakdown

### 1. Frontend (GitHub Pages)

**Location**: `https://intelliask.github.io`

**Technology**: Static HTML, CSS (Bulma), JavaScript (jQuery)

**Files**:
- `index.html` - Main webpage
- `static/css/` - Styling
- `static/js/index.js` - Demo logic and API calls
- `static/images/` - Assets

**Responsibilities**:
- Display website content
- Handle PDF file upload
- Show loading states
- Display generated questions
- Make API calls to Vercel backend

**Cost**: FREE (GitHub Pages free tier)

### 2. Backend API (Vercel)

**Location**: `https://your-project.vercel.app/api/upload`

**Technology**: Python, Flask, Serverless Functions

**Files**:
- `api/upload.py` - Main serverless function
- `vercel.json` - Configuration
- `requirements.txt` - Dependencies

**Responsibilities**:
1. Receive PDF upload from frontend
2. Validate file (PDF, size limits)
3. Trim PDF to first 8 pages using PyPDF2
4. Call Gemini API for OCR
5. Call Modal API for question generation
6. Return results as JSON
7. Handle CORS for cross-origin requests
8. Error handling and logging

**Cost**: FREE (Vercel free tier: 100 GB bandwidth, 100 hours execution/month)

### 3. Gemini API (Google)

**Service**: Google Gemini API

**Model**: `gemini-2.0-flash-exp`

**Responsibilities**:
- OCR (Optical Character Recognition)
- Extract text from PDF including:
  - Body text
  - Figure captions
  - Table contents
  - Equations

**Authentication**: API key (stored in Vercel environment variables)

**Cost**: FREE tier available, pay-as-you-go for heavy usage

### 4. Modal Platform

**Service**: Your deployed IntelliAsk model

**Endpoint**: `https://mailto-karun-py--intelliask-qwen3-32b-inference-01uberco-a01a74.modal.run/v1`

**Model**: IntelliAsk (Qwen3-32B fine-tuned)

**Responsibilities**:
- Generate critical peer review questions
- Based on extracted paper text
- Apply IntelliReward-trained preferences

**Authentication**: None required (dummy key)

**Cost**: Based on your Modal plan

## Data Flow

### Request Flow (User uploads PDF)

```
1. User selects PDF file
   └─> frontend/index.js

2. Frontend creates FormData with PDF
   └─> POST request to Vercel API

3. Vercel receives request
   └─> api/upload.py

4. Backend processes PDF
   ├─> PyPDF2 trims to 8 pages
   ├─> Saves to temporary file
   └─> Uploads to Gemini API

5. Gemini processes PDF
   ├─> OCR extraction
   ├─> Text recognition
   └─> Returns extracted text

6. Backend sends text to Modal
   └─> POST to IntelliAsk endpoint

7. Modal generates questions
   ├─> IntelliAsk inference
   ├─> Question generation
   └─> Returns questions

8. Backend returns JSON
   └─> { success: true, questions: "...", ... }

9. Frontend displays results
   └─> Show questions in UI
```

### Response Flow (Displaying results)

```
Frontend receives JSON response
   ↓
Parse response data
   ↓
Display questions in notification box
   ↓
Show metadata (pages processed, text length)
```

## API Specifications

### Frontend → Backend

**Endpoint**: `POST /api/upload`

**Request**:
```http
POST /api/upload HTTP/1.1
Host: your-project.vercel.app
Content-Type: multipart/form-data
Origin: https://intelliask.github.io

--boundary
Content-Disposition: form-data; name="file"; filename="paper.pdf"
Content-Type: application/pdf

[PDF binary data]
--boundary--
```

**Response** (Success):
```json
{
  "success": true,
  "num_pages_processed": 8,
  "questions": "Generated questions...",
  "extracted_text_length": 15000
}
```

**Response** (Error):
```json
{
  "success": false,
  "error": "Error message"
}
```

### Backend → Gemini API

**Endpoint**: Gemini File API

**Process**:
1. Upload file using `client.files.upload()`
2. Generate content with prompt
3. Extract text from response

**Prompt**:
```
Extract all text content from this research paper.
Include all sections, paragraphs, figure captions,
and table contents. Preserve the document structure
as much as possible.
```

### Backend → Modal API

**Endpoint**: `POST /v1/chat/completions` (OpenAI-compatible)

**Request**:
```json
{
  "model": "intelliask",
  "messages": [
    {
      "role": "user",
      "content": "Generate critical peer review questions after reading the below research paper:\n\n[extracted text]"
    }
  ]
}
```

**Response**:
```json
{
  "choices": [
    {
      "message": {
        "content": "Generated questions..."
      }
    }
  ]
}
```

## Security

### Frontend
- ✅ No API keys in client-side code
- ✅ File validation before upload
- ✅ HTTPS enforced by GitHub Pages

### Backend
- ✅ API keys stored in Vercel environment variables
- ✅ CORS configured for cross-origin requests
- ✅ File type validation (PDF only)
- ✅ Temporary files cleaned up after processing
- ✅ HTTPS enforced by Vercel

### Recommendations
- Add rate limiting to prevent abuse
- Restrict CORS to specific origin (intelliask.github.io)
- Add file size limits (< 10 MB)
- Implement request timeout (< 60s)

## Performance

### Expected Latency

| Step | Time | Notes |
|------|------|-------|
| Upload PDF | < 1s | Depends on file size |
| Trim PDF | < 1s | Local processing |
| Gemini OCR | 5-15s | API call + processing |
| Modal Inference | 10-30s | Model inference |
| **Total** | **15-45s** | Typical for 8-page paper |

### Optimization Opportunities

1. **Caching**: Cache Gemini OCR results by PDF hash
2. **Streaming**: Stream Modal responses for faster perceived performance
3. **Compression**: Compress PDFs before sending to Gemini
4. **Batch Processing**: Process multiple papers in parallel

## Scalability

### Current Limits (Free Tiers)

| Service | Limit | Estimated Capacity |
|---------|-------|-------------------|
| GitHub Pages | 100 GB/month | Unlimited page views |
| Vercel | 100 GB bandwidth/month | ~20,000 API calls |
| Vercel | 100 hours execution/month | ~10,000 demos (@ 30s each) |
| Gemini | Varies | Check your quota |
| Modal | Based on plan | Check your plan |

### Scaling Up

**If you exceed free tiers:**

1. **Vercel**: Upgrade to Pro ($20/month)
   - 1 TB bandwidth
   - 1000 hours execution
   - 60s timeout (vs 10s free)

2. **Add CDN**: Use Cloudflare for caching

3. **Database**: Cache results in Redis/PostgreSQL

4. **Queue**: Add job queue for async processing

## Monitoring

### Vercel Dashboard
- Function logs
- Execution time
- Error rates
- Bandwidth usage

### Recommended Additions
- Sentry for error tracking
- PostHog for analytics
- Uptime monitoring (UptimeRobot)

## Troubleshooting

### Common Issues

1. **CORS errors**
   - Check `vercel.json` CORS headers
   - Verify `api/upload.py` sets CORS in response

2. **Timeout errors**
   - Vercel free: 10s limit
   - Use smaller PDFs or upgrade to Pro

3. **Gemini API errors**
   - Check API key in Vercel env vars
   - Verify quota not exceeded

4. **Modal errors**
   - Check endpoint is accessible
   - Verify model is deployed

## Development Workflow

### Local Development
```bash
# Terminal 1: Backend
cd backend && python server.py

# Terminal 2: Frontend
python -m http.server 8000
```

### Deploy Backend
```bash
vercel --prod
```

### Deploy Frontend
```bash
git push origin main
```

## Future Enhancements

- [ ] Add authentication/rate limiting
- [ ] Support for multiple file formats (DOCX, TXT)
- [ ] Question history and saving
- [ ] Comparison with different models
- [ ] Export questions as PDF/DOCX
- [ ] Custom prompts for question generation
- [ ] Real-time streaming of questions
