$(document).ready(function() {
    $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    var carousels = bulmaCarousel.attach('.carousel', {
        slidesToScroll: 1,
        slidesToShow: 3,
        loop: true,
        infinite: true,
        autoplay: false
    });

    initIntelliAskDemo();
});

function initIntelliAskDemo() {
    const API_BASE = 'https://api.bbnschool.in';

    const fileInput = document.getElementById('paper-upload');
    const generateBtn = document.getElementById('generate-btn');
    const progressContainer = document.getElementById('progress-container');
    const resultContainer = document.getElementById('result-container');
    const uploadArea = document.getElementById('upload-area');

    if (!fileInput || !generateBtn) return;

    let selectedFile = null;

    const steps = [
        { name: 'Queued', desc: 'Waiting to start...' },
        { name: 'Trimming PDF', desc: 'Processing pages...' },
        { name: 'Extracting Text', desc: 'Reading your paper...' },
        { name: 'Generating Question', desc: 'IntelliAsk is thinking...' },
        { name: 'Complete', desc: 'Done!' }
    ];

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please select a PDF file.');
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            alert('File size must be less than 20MB.');
            return;
        }
        selectedFile = file;
        uploadArea.classList.add('file-selected');
        uploadArea.querySelector('.upload-icon').innerHTML = '<i class="fas fa-check-circle"></i>';
        uploadArea.querySelector('.upload-text').innerHTML = '<span>' + file.name + '</span><span class="file-size">' + (file.size / 1024 / 1024).toFixed(2) + ' MB</span>';
        generateBtn.disabled = false;
        generateBtn.classList.remove('is-light');
    });

    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) { e.preventDefault(); uploadArea.classList.add('drag-over'); });
        uploadArea.addEventListener('dragleave', function(e) { e.preventDefault(); uploadArea.classList.remove('drag-over'); });
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            if (e.dataTransfer.files[0]) {
                const dt = new DataTransfer();
                dt.items.add(e.dataTransfer.files[0]);
                fileInput.files = dt.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });
    }

    function renderProgress(step) {
        const s = steps[step] || steps[0];
        let html = '<div class="loading-state"><div class="step-progress">';
        for (let i = 1; i <= 4; i++) {
            const cls = i < step ? 'done' : (i === step ? 'active' : '');
            html += '<div class="step-item ' + cls + '"><div class="step-num">' + (i < step ? '✓' : i) + '</div></div>';
            if (i < 4) html += '<div class="step-line ' + (i < step ? 'done' : '') + '"></div>';
        }
        html += '</div><div class="loading-text"><strong>' + s.name + '</strong><p>' + s.desc + '</p></div></div>';
        progressContainer.innerHTML = html;
    }

    async function pollStatus(jobId) {
        try {
            const res = await fetch(API_BASE + '/api/status/' + jobId);
            const data = await res.json();

            if (data.error && !data.status) {
                showError(data.error);
                return;
            }

            renderProgress(data.step);

            if (data.status === 'completed') {
                showResult(data.question, data.metadata);
            } else if (data.status === 'error') {
                showError(data.error || 'Processing failed');
            } else {
                setTimeout(() => pollStatus(jobId), 1000);
            }
        } catch (e) {
            showError('Connection error. Please try again.');
        }
    }

    function showResult(question, metadata) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        let meta = '';
        if (metadata) {
            meta = '<div class="result-meta"><span><i class="fas fa-file-alt"></i> ' + metadata.processed_pages + ' pages</span>';
            if (metadata.was_trimmed) meta += '<span class="trimmed-badge"><i class="fas fa-cut"></i> Trimmed from ' + metadata.original_pages + '</span>';
            meta += '</div>';
        }
        resultContainer.innerHTML = '<div class="result-success"><div class="result-header"><span class="result-badge"><i class="fas fa-lightbulb"></i> Generated Question</span></div><div class="result-question">' + escapeHtml(question) + '</div>' + meta + '</div>';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span>Generate Another</span><i class="fas fa-arrow-right"></i>';
    }

    function showError(msg) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = '<div class="result-error"><div class="error-icon"><i class="fas fa-exclamation-circle"></i></div><p class="error-message">' + escapeHtml(msg) + '</p></div>';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span>Generate Question</span><i class="fas fa-arrow-right"></i>';
    }

    generateBtn.addEventListener('click', async function() {
        if (!selectedFile) return;

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Submitting...</span>';
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        renderProgress(0);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const res = await fetch(API_BASE + '/api/submit', { method: 'POST', body: formData });
            const data = await res.json();

            if (data.job_id) {
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
                pollStatus(data.job_id);
            } else {
                showError('Failed to submit job');
            }
        } catch (e) {
            showError('Connection error');
        }
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}
