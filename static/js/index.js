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

    const fileInput = document.getElementById('paper-upload');
    const generateBtn = document.getElementById('generate-btn');
    const progressContainer = document.getElementById('progress-container');
    const resultContainer = document.getElementById('result-container');
    const uploadArea = document.getElementById('upload-area');

    if (!fileInput || !generateBtn) return;

    let selectedFile = null;

    // File input change
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.name.toLowerCase().endsWith('.pdf')) {
                alert('Please select a PDF file.');
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                alert('File size must be less than 20MB.');
                return;
            }
            selectedFile = file;

            // Update UI to show file selected
            if (uploadArea) {
                uploadArea.classList.add('file-selected');
                const uploadIcon = uploadArea.querySelector('.upload-icon');
                const uploadText = uploadArea.querySelector('.upload-text');
                if (uploadIcon) uploadIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                if (uploadText) {
                    uploadText.innerHTML = '<span id="file-name">' + file.name + '</span><span class="file-size">' + (file.size / 1024 / 1024).toFixed(2) + ' MB</span>';
                }
            }

            generateBtn.disabled = false;
            generateBtn.classList.remove('is-light');
        }
    });

    // Drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });
    }

    // Generate button click
    generateBtn.addEventListener('click', async function() {
        if (!selectedFile) {
            alert('Please upload a PDF file first.');
            return;
        }

        // Show loading
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';

        if (progressContainer) {
            progressContainer.style.display = 'block';
            progressContainer.innerHTML = '<div class="loading-state"><div class="loading-spinner"><i class="fas fa-circle-notch fa-spin"></i></div><div class="loading-text"><strong>Processing your paper...</strong><p>This may take up to 2 minutes</p></div></div>';
        }
        if (resultContainer) resultContainer.style.display = 'none';

        // Make the API call
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
                // Show result
                if (progressContainer) progressContainer.style.display = 'none';
                if (resultContainer) {
                    resultContainer.style.display = 'block';

                    let metaHtml = '';
                    if (data.metadata) {
                        metaHtml = '<div class="result-meta"><span><i class="fas fa-file-alt"></i> ' + data.metadata.processed_pages + ' pages analyzed</span>';
                        if (data.metadata.was_trimmed) {
                            metaHtml += '<span class="trimmed-badge"><i class="fas fa-cut"></i> Trimmed from ' + data.metadata.original_pages + ' pages</span>';
                        }
                        metaHtml += '</div>';
                    }

                    resultContainer.innerHTML = '<div class="result-success"><div class="result-header"><span class="result-badge"><i class="fas fa-lightbulb"></i> Generated Question</span></div><div class="result-question">' + escapeHtml(data.question) + '</div>' + metaHtml + '</div>';
                }

                generateBtn.innerHTML = '<span>Generate Another</span><i class="fas fa-arrow-right"></i>';
            } else {
                throw new Error('Unexpected response format');
            }
        } catch (error) {
            console.error('Error:', error);

            if (progressContainer) progressContainer.style.display = 'none';
            if (resultContainer) {
                resultContainer.style.display = 'block';
                resultContainer.innerHTML = '<div class="result-error"><div class="error-icon"><i class="fas fa-exclamation-circle"></i></div><p class="error-message">' + escapeHtml(error.message || 'Something went wrong.') + '</p></div>';
            }

            generateBtn.innerHTML = '<span>Generate Question</span><i class="fas fa-arrow-right"></i>';
        }

        generateBtn.disabled = false;
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
