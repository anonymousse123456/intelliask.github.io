# IntelliAsk Backend Server

This backend server handles PDF upload, processing, and question generation for the IntelliAsk live demo.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

3. Run the server:
```bash
export GEMINI_API_KEY="your_api_key_here"
python server.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /api/upload
Upload a PDF file for processing.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: file (PDF)

**Response:**
```json
{
  "success": true,
  "num_pages_processed": 8,
  "questions": "Generated questions...",
  "extracted_text_length": 15000
}
```

### GET /api/health
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "message": "IntelliAsk backend is running"
}
```

## Workflow

1. **PDF Upload**: User uploads a research paper PDF
2. **PDF Trimming**: Backend trims PDF to first 8 pages using PyPDF2
3. **OCR with Gemini**: Gemini API extracts text from the trimmed PDF
4. **Question Generation**: Extracted text is sent to Modal-hosted IntelliAsk model
5. **Response**: Generated questions are returned to the frontend
