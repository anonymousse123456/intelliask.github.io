$(document).ready(function() {
    $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    var options = {
        slidesToScroll: 1,
        slidesToShow: 3,
        loop: true,
        infinite: true,
        autoplay: false,
        autoplaySpeed: 3000,
    }

    var carousels = bulmaCarousel.attach('.carousel', options);

    for(var i = 0; i < carousels.length; i++) {
        carousels[i].on('before:show', state => {
            console.log(state);
        });
    }

    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
        element.bulmaCarousel.on('before-show', function(state) {
            console.log(state);
        });
    }

    initIntelliAskDemo();
});

function initIntelliAskDemo() {
    const API_ENDPOINT = 'https://api.bbnschool.in/api/generate-question';
    const demoSection = document.querySelector('.demo-container');
    if (!demoSection) return;

    const fileInput = document.getElementById('paper-upload');
    const generateBtn = document.getElementById('generate-btn');
    const progressContainer = document.getElementById('progress-container');
    const resultContainer = document.getElementById('result-container');
    const uploadArea = document.getElementById('upload-area');

    let selectedFile = null;

    if (!fileInput || !generateBtn) return;

    // Drag and drop
    if (uploadArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, preventDefaults, false);
        });

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('drag-over'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('drag-over'), false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
        });
    }

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) handleFileSelect(file);
    });

    function handleFileSelect(file) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            showError('Please select a PDF file.');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            showError('File size must be less than 20MB.');
            return;
        }
        selectedFile = file;
        updateUploadUI(file);
        generateBtn.disabled = false;
        generateBtn.classList.remove('is-light');
    }

    generateBtn.addEventListener('click', async function() {
        if (!selectedFile) {
            showError('Please upload a PDF file first.');
            return;
        }
        await generateQuestion();
    });

    function updateUploadUI(file) {
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const uploadIcon = uploadArea.querySelector('.upload-icon');
        const uploadText = uploadArea.querySelector('.upload-text');

        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';

        uploadArea.classList.add('file-selected');
        if (uploadIcon) uploadIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        if (uploadText) uploadText.innerHTML = `<span id="file-name">${escapeHtml(file.name)}</span><span id="file-size" class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>`;
    }

    function showError(message) {
        resultContainer.innerHTML = `
            <div class="result-error">
                <div class="error-icon"><i class="fas fa-exclamation-circle"></i></div>
                <p class="error-message">${escapeHtml(message)}</p>
            </div>
        `;
        resultContainer.style.display = 'block';
        progressContainer.style.display = 'none';
        resetButton();
    }

    function showProgress(steps) {
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';

        const stepsHtml = steps.map((step, i) => `
            <div class="progress-step ${step.status}" id="step-${i}">
                <div class="step-indicator">
                    ${step.status === 'active' ? '<i class="fas fa-spinner fa-spin"></i>' :
                      step.status === 'complete' ? '<i class="fas fa-check"></i>' :
                      '<span class="step-number">' + (i + 1) + '</span>'}
                </div>
                <div class="step-content">
                    <span class="step-title">${step.title}</span>
                    <span class="step-desc">${step.desc}</span>
                </div>
            </div>
        `).join('');

        progressContainer.innerHTML = `<div class="progress-steps">${stepsHtml}</div>`;
    }

    function updateStep(index, status, desc) {
        const step = document.getElementById(`step-${index}`);
        if (!step) return;

        step.className = `progress-step ${status}`;
        const indicator = step.querySelector('.step-indicator');
        const descEl = step.querySelector('.step-desc');

        if (status === 'active') {
            indicator.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else if (status === 'complete') {
            indicator.innerHTML = '<i class="fas fa-check"></i>';
        }

        if (desc) descEl.textContent = desc;
    }

    function showResult(question, metadata) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        let metaHtml = '';
        if (metadata) {
            metaHtml = `
                <div class="result-meta">
                    <span><i class="fas fa-file-alt"></i> ${metadata.processed_pages} pages analyzed</span>
                    ${metadata.was_trimmed ? `<span class="trimmed-badge"><i class="fas fa-cut"></i> Trimmed from ${metadata.original_pages}</span>` : ''}
                </div>
            `;
        }

        resultContainer.innerHTML = `
            <div class="result-success">
                <div class="result-header">
                    <span class="result-badge"><i class="fas fa-lightbulb"></i> Generated Question</span>
                </div>
                <div class="result-question">${escapeHtml(question)}</div>
                ${metaHtml}
            </div>
        `;

        resetButton();
        generateBtn.innerHTML = '<span>Generate Another</span><i class="fas fa-arrow-right"></i>';
    }

    function resetButton() {
        generateBtn.disabled = false;
        generateBtn.classList.remove('is-loading');
        if (!generateBtn.innerHTML.includes('Another')) {
            generateBtn.innerHTML = '<span>Generate Question</span><i class="fas fa-arrow-right"></i>';
        }
    }

    async function generateQuestion() {
        generateBtn.disabled = true;
        generateBtn.classList.add('is-loading');
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';

        const steps = [
            { title: 'Preparing', desc: 'Validating document...', status: 'active' },
            { title: 'Extracting', desc: 'OCR with Gemini', status: 'pending' },
            { title: 'Generating', desc: 'IntelliAsk-32B', status: 'pending' }
        ];
        showProgress(steps);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to generate question');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            handleSSEEvent(data);
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('Rate limit')) {
                showError('Rate limit reached. Please wait a moment.');
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                showError('Connection failed. Please try again.');
            } else {
                showError(error.message || 'Something went wrong.');
            }
        }
    }

    function handleSSEEvent(data) {
        switch (data.step) {
            case 'trimming':
                updateStep(0, 'active', 'Preparing document...');
                break;
            case 'trimmed':
                updateStep(0, 'complete', data.was_trimmed ? `Trimmed to 9 pages` : 'Document ready');
                updateStep(1, 'active', 'Extracting text...');
                break;
            case 'ocr':
                updateStep(1, 'active', 'Extracting text with Gemini...');
                break;
            case 'ocr_done':
                updateStep(1, 'complete', 'Text extracted');
                updateStep(2, 'active', 'Generating with IntelliAsk-32B...');
                break;
            case 'generating':
                updateStep(2, 'active', 'This may take up to 2 minutes...');
                break;
            case 'complete':
                updateStep(2, 'complete', 'Complete');
                setTimeout(() => {
                    showResult(data.question, data.metadata);
                }, 500);
                break;
            case 'error':
                showError(data.message);
                break;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
