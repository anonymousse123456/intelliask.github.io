"""
Vercel Serverless Function for IntelliAsk PDF Processing
This file handles PDF upload, OCR, and question generation
"""
from http.server import BaseHTTPRequestHandler
import pathlib
import tempfile
import os
import json
import cgi
from io import BytesIO
from google import genai
from openai import OpenAI
from PyPDF2 import PdfReader, PdfWriter

# Initialize clients
gemini_client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

modal_client = OpenAI(
    base_url="https://mailto-karun-py--intelliask-qwen3-32b-inference-01uberco-a01a74.modal.run/v1",
    api_key="dummy"
)

def trim_pdf_to_pages(input_pdf_bytes, max_pages=8):
    """Trim PDF to first max_pages pages"""
    reader = PdfReader(BytesIO(input_pdf_bytes))
    writer = PdfWriter()

    num_pages = min(len(reader.pages), max_pages)

    for i in range(num_pages):
        writer.add_page(reader.pages[i])

    output_bytes = BytesIO()
    writer.write(output_bytes)
    output_bytes.seek(0)

    return output_bytes.getvalue(), num_pages

def extract_text_with_gemini(pdf_bytes):
    """Extract text from PDF using Gemini OCR"""
    try:
        # Save to temp file for Gemini API
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp:
            tmp.write(pdf_bytes)
            tmp_path = tmp.name

        try:
            sample_file = gemini_client.files.upload(file=pathlib.Path(tmp_path))

            prompt = "Extract all text content from this research paper. Include all sections, paragraphs, figure captions, and table contents. Preserve the document structure as much as possible."

            response = gemini_client.models.generate_content(
                model="gemini-2.0-flash-exp",
                contents=[sample_file, prompt]
            )

            return response.text
        finally:
            os.unlink(tmp_path)

    except Exception as e:
        raise Exception(f"Gemini OCR failed: {str(e)}")

def generate_questions_with_modal(research_paper_text):
    """Generate questions using Modal-hosted IntelliAsk model"""
    try:
        response = modal_client.chat.completions.create(
            model="intelliask",
            messages=[{
                "role": "user",
                "content": f"Generate critical peer review questions after reading the below research paper:\n\n{research_paper_text}"
            }]
        )

        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"Modal inference failed: {str(e)}")

class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(204)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        """Handle PDF upload"""
        try:
            # Parse multipart form data
            content_type = self.headers.get('Content-Type')
            if not content_type or 'multipart/form-data' not in content_type:
                self._send_error(400, 'Content-Type must be multipart/form-data')
                return

            # Parse the form data
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    'REQUEST_METHOD': 'POST',
                    'CONTENT_TYPE': content_type,
                }
            )

            # Get the file
            if 'file' not in form:
                self._send_error(400, 'No file uploaded')
                return

            file_item = form['file']
            if not file_item.filename:
                self._send_error(400, 'No file selected')
                return

            if not file_item.filename.endswith('.pdf'):
                self._send_error(400, 'Only PDF files are accepted')
                return

            # Read file bytes
            pdf_bytes = file_item.file.read()

            # Step 1: Trim PDF to first 8 pages
            trimmed_pdf_bytes, num_pages = trim_pdf_to_pages(pdf_bytes, max_pages=8)

            # Step 2: Extract text using Gemini OCR
            extracted_text = extract_text_with_gemini(trimmed_pdf_bytes)

            # Step 3: Generate questions using Modal server
            generated_questions = generate_questions_with_modal(extracted_text)

            # Send success response
            self._send_json({
                'success': True,
                'num_pages_processed': num_pages,
                'questions': generated_questions,
                'extracted_text_length': len(extracted_text)
            })

        except Exception as e:
            self._send_error(500, str(e))

    def _send_json(self, data, status=200):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

    def _send_error(self, status, message):
        """Send error response"""
        self._send_json({
            'success': False,
            'error': message
        }, status)
