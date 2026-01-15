from flask import Flask, request, jsonify
from flask_cors import CORS
import pathlib
import tempfile
import os
from google import genai
from google.genai import types
from openai import OpenAI
from PyPDF2 import PdfReader, PdfWriter

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Initialize Gemini client
gemini_client = genai.Client(api_key=os.environ.get('GEMINI_API_KEY'))

# Initialize OpenAI client for Modal endpoint
modal_client = OpenAI(
    base_url="https://mailto-karun-py--intelliask-qwen3-32b-inference-01uberco-a01a74.modal.run/v1",
    api_key="dummy"  # vLLM doesn't require auth by default
)

def trim_pdf_to_pages(input_pdf_path, output_pdf_path, max_pages=8):
    """Trim PDF to first max_pages pages"""
    reader = PdfReader(input_pdf_path)
    writer = PdfWriter()

    # Get the minimum of total pages and max_pages
    num_pages = min(len(reader.pages), max_pages)

    # Add pages to writer
    for i in range(num_pages):
        writer.add_page(reader.pages[i])

    # Write to output file
    with open(output_pdf_path, 'wb') as output_file:
        writer.write(output_file)

    return num_pages

def extract_text_with_gemini(pdf_path):
    """Extract text from PDF using Gemini OCR"""
    try:
        # Upload the PDF using the File API
        sample_file = gemini_client.files.upload(file=pathlib.Path(pdf_path))

        # Generate content with OCR prompt
        prompt = "Extract all text content from this research paper. Include all sections, paragraphs, figure captions, and table contents. Preserve the document structure as much as possible."

        response = gemini_client.models.generate_content(
            model="gemini-2.0-flash-exp",
            contents=[sample_file, prompt]
        )

        return response.text
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

@app.route('/api/upload', methods=['POST'])
def upload_pdf():
    """Handle PDF upload and process through the pipeline"""
    try:
        # Check if file is present in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']

        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not file.filename.endswith('.pdf'):
            return jsonify({'error': 'Only PDF files are accepted'}), 400

        # Create temporary directory for processing
        with tempfile.TemporaryDirectory() as temp_dir:
            # Save uploaded file
            input_path = os.path.join(temp_dir, 'input.pdf')
            file.save(input_path)

            # Step 1: Trim PDF to first 8 pages
            trimmed_path = os.path.join(temp_dir, 'trimmed.pdf')
            num_pages = trim_pdf_to_pages(input_path, trimmed_path, max_pages=8)

            # Step 2: Extract text using Gemini OCR
            extracted_text = extract_text_with_gemini(trimmed_path)

            # Step 3: Generate questions using Modal server
            generated_questions = generate_questions_with_modal(extracted_text)

            return jsonify({
                'success': True,
                'num_pages_processed': num_pages,
                'questions': generated_questions,
                'extracted_text_length': len(extracted_text)
            })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'message': 'IntelliAsk backend is running'})

if __name__ == '__main__':
    # Check for required environment variables
    if not os.environ.get('GEMINI_API_KEY'):
        print("Warning: GEMINI_API_KEY environment variable not set")

    app.run(host='0.0.0.0', port=5000, debug=True)
