$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
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

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    // IntelliAsk Demo functionality
    initIntelliAskDemo();
});

function initIntelliAskDemo() {
    const API_ENDPOINT = 'https://api.bbnschool.in/api/generate-question';
    const fileInput = document.getElementById('paper-upload');
    const generateBtn = document.querySelector('.generation-area .button.is-success');
    const questionOutput = document.querySelector('.question-output .notification');
    const uploadBox = document.querySelector('.upload-box');
    let selectedFile = null;

    if (!fileInput || !generateBtn || !questionOutput) return;

    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
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
        }
    });

    // Handle generate button click
    generateBtn.addEventListener('click', async function() {
        if (!selectedFile) {
            showError('Please upload a PDF file first.');
            return;
        }
        await generateQuestion();
    });

    function updateUploadUI(file) {
        const uploadText = uploadBox.querySelector('.upload-text');
        if (uploadText) {
            uploadText.innerHTML = `<strong>Selected:</strong> ${escapeHtml(file.name)}<br><small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>`;
        }
        uploadBox.style.borderColor = '#48c774';
        uploadBox.style.backgroundColor = '#f0fff4';
    }

    function showError(message) {
        questionOutput.className = 'notification is-danger is-light';
        questionOutput.style.minHeight = '150px';
        questionOutput.style.display = 'flex';
        questionOutput.style.alignItems = 'center';
        questionOutput.style.justifyContent = 'center';
        questionOutput.innerHTML = `<p style="text-align: center;"><i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>${escapeHtml(message)}</p>`;
    }

    function showLoading() {
        questionOutput.className = 'notification is-info is-light';
        questionOutput.style.minHeight = '150px';
        questionOutput.style.display = 'flex';
        questionOutput.style.alignItems = 'center';
        questionOutput.style.justifyContent = 'center';
        questionOutput.innerHTML = `
            <div style="text-align: center;">
                <p><i class="fas fa-spinner fa-spin fa-2x" style="margin-bottom: 15px;"></i></p>
                <p><strong>Generating question...</strong></p>
                <p class="is-size-7 has-text-grey">This may take a moment as we analyze your paper.</p>
            </div>
        `;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="icon"><i class="fas fa-spinner fa-spin"></i></span><span>Processing...</span>';
    }

    function showQuestion(question, metadata) {
        questionOutput.className = 'notification is-success is-light';
        questionOutput.style.minHeight = 'auto';
        questionOutput.style.display = 'block';
        questionOutput.style.alignItems = '';
        questionOutput.style.justifyContent = '';

        let metaInfo = '';
        if (metadata) {
            metaInfo = `<p class="is-size-7 has-text-grey" style="margin-top: 15px; border-top: 1px solid #ddd; padding-top: 10px;">
                <i class="fas fa-file-alt"></i> Processed ${metadata.processed_pages} pages
                ${metadata.was_trimmed ? ' (trimmed from ' + metadata.original_pages + ')' : ''}
            </p>`;
        }

        questionOutput.innerHTML = `
            <h4 class="title is-5" style="margin-bottom: 10px;"><i class="fas fa-question-circle" style="margin-right: 8px;"></i>Generated Question</h4>
            <div class="content" style="white-space: pre-wrap; font-size: 0.95rem;">${escapeHtml(question)}</div>
            ${metaInfo}
        `;

        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="icon"><i class="fas fa-magic"></i></span><span>Generate Another Question</span>';
    }

    function resetUI() {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span class="icon"><i class="fas fa-magic"></i></span><span>Generate Questions with IntelliAsk</span>';
    }

    async function generateQuestion() {
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
                showQuestion(data.question, data.metadata);
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('Rate limit')) {
                showError('Rate limit exceeded. Please wait a moment and try again.');
            } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
                showError('Could not connect to the server. Please check your connection and try again.');
            } else {
                showError(error.message || 'An error occurred. Please try again.');
            }
            resetUI();
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
