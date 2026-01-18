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
        const uploadIcon = uploadArea.querySelector('.upload-icon');
        const uploadText = uploadArea.querySelector('.upload-text');

        uploadArea.classList.add('file-selected');
        if (uploadIcon) uploadIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
        if (uploadText) uploadText.innerHTML = '<span id="file-name">' + escapeHtml(file.name) + '</span><span class="file-size">' + (file.size / 1024 / 1024).toFixed(2) + ' MB</span>';
    }

    function showError(message) {
        resultContainer.innerHTML = '<div class="result-error"><div class="error-icon"><i class="fas fa-exclamation-circle"></i></div><p class="error-message">' + escapeHtml(message) + '</p></div>';
        resultContainer.style.display = 'block';
        progressContainer.style.display = 'none';
        resetButton();
    }

    function showLoading() {
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';

        progressContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></div><div class="loading-text"><strong>Analyzing your paper...</strong><p>Extracting text and generating question. This may take 1-2 minutes.</p></div></div>';
    }

    function showResult(question, metadata) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        let metaHtml = '';
        if (metadata) {
            metaHtml = '<div class="result-meta"><span><i class="fas fa-file-alt"></i> ' + metadata.processed_pages + ' pages analyzed</span>' + (metadata.was_trimmed ? '<span class="trimmed-badge"><i class="fas fa-cut"></i> Trimmed from ' + metadata.original_pages + '</span>' : '') + '</div>';
        }

        resultContainer.innerHTML = '<div class="result-success"><div class="result-header"><span class="result-badge"><i class="fas fa-lightbulb"></i> Generated Question</span></div><div class="result-question">' + escapeHtml(question) + '</div>' + metaHtml + '</div>';

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

        showLoading();

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Failed to generate question');
            }

            if (data.success && data.question) {
                showResult(data.question, data.metadata);
            } else {
                throw new Error('Unexpected response format');
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

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
