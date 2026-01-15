"""
Vercel Serverless Function for IntelliAsk PDF Processing
This file handles PDF upload, OCR, and question generation
"""
from flask import Flask, request, jsonify
import pathlib
import tempfile
import os
from google import genai
from openai import OpenAI
from PyPDF2 import PdfReader, PdfWriter
import io

# Initialize clients
gemini_client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

modal_client = OpenAI(
    base_url="https://mailto-karun-py--intelliask-qwen3-32b-inference-01uberco-a01a74.modal.run/v1",
    api_key="dummy"
)

def trim_pdf_to_pages(input_pdf_bytes, max_pages=8):
    """Trim PDF to first max_pages pages"""
    reader = PdfReader(io.BytesIO(input_pdf_bytes))
    writer = PdfWriter()

    num_pages = min(len(reader.pages), max_pages)

    for i in range(num_pages):
        writer.add_page(reader.pages[i])

    output_bytes = io.BytesIO()
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

# Vercel serverless function handler
app = Flask(__name__)

@app.route('/api/upload', methods=['POST'])
def handler(request):
    """Main handler for Vercel serverless function"""
    # Handle CORS
    if request.method == 'OPTIONS':
        return '', 204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }

    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are accepted'}), 400

        # Read file bytes
        pdf_bytes = file.read()

        # Step 1: Trim PDF to first 8 pages
        trimmed_pdf_bytes, num_pages = trim_pdf_to_pages(pdf_bytes, max_pages=8)

        # Step 2: Extract text using Gemini OCR
        extracted_text = extract_text_with_gemini(trimmed_pdf_bytes)

        # Step 3: Generate questions using Modal server
        generated_questions = generate_questions_with_modal(extracted_text)

        response = jsonify({
            'success': True,
            'num_pages_processed': num_pages,
            'questions': generated_questions,
            'extracted_text_length': len(extracted_text)
        })

        # Add CORS headers
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    except Exception as e:
        response = jsonify({
            'success': False,
            'error': str(e)
        })
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response, 500
