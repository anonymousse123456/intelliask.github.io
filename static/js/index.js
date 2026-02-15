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
    initTableOfContents();
});

function initTableOfContents() {
    const toc = document.getElementById('toc-nav');
    if (!toc) return;

    const tocItems = document.querySelectorAll('.toc-item');

    // Show TOC when user scrolls down
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            toc.classList.add('visible');
        } else {
            toc.classList.remove('visible');
        }

        // Highlight active section
        tocItems.forEach(item => {
            const target = document.getElementById(item.dataset.target);
            if (target) {
                const rect = target.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
    });

    // Smooth scroll to section on click
    tocItems.forEach(item => {
        item.addEventListener('click', function() {
            const target = document.getElementById(this.dataset.target);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

function initIntelliAskDemo() {
    const API_BASE = 'https://api.bbnschool.in';

    const fileInput = document.getElementById('paper-upload');
    const generateBtn = document.getElementById('generate-btn');
    const progressContainer = document.getElementById('progress-container');
    const resultContainer = document.getElementById('result-container');
    const uploadArea = document.getElementById('upload-area');

    if (!fileInput || !generateBtn) return;

    let selectedFile = null;
    let stepStartTime = null;
    let lastStep = -1;
    let stepTimings = {};
    let currentStepTimer = null;

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

    function renderProgress(step, elapsedSecs) {
        // Track step changes
        if (step !== lastStep) {
            if (lastStep >= 0 && stepStartTime) {
                stepTimings[lastStep] = Math.round((Date.now() - stepStartTime) / 1000);
            }
            stepStartTime = Date.now();
            lastStep = step;
        }

        const s = steps[step] || steps[0];
        let html = '<div class="loading-state"><div class="step-progress">';
        for (let i = 1; i <= 4; i++) {
            const cls = i < step ? 'done' : (i === step ? 'active' : '');
            let timeLabel = '';
            if (stepTimings[i]) {
                timeLabel = '<span class="step-time">' + stepTimings[i] + 's</span>';
            }
            html += '<div class="step-item ' + cls + '"><div class="step-num">' + (i < step ? '✓' : i) + '</div>' + timeLabel + '</div>';
            if (i < 4) html += '<div class="step-line ' + (i < step ? 'done' : '') + '"></div>';
        }
        html += '</div><div class="loading-text"><strong>' + s.name + '</strong><p>' + s.desc;
        if (step > 0 && step < 4 && elapsedSecs !== undefined) {
            html += ' <span class="elapsed-time">(' + elapsedSecs + 's)</span>';
        }
        html += '</p></div></div>';
        progressContainer.innerHTML = html;
    }

    function startElapsedTimer() {
        if (currentStepTimer) clearInterval(currentStepTimer);
        currentStepTimer = setInterval(function() {
            if (stepStartTime && lastStep > 0 && lastStep < 4) {
                const elapsed = Math.round((Date.now() - stepStartTime) / 1000);
                renderProgress(lastStep, elapsed);
            }
        }, 1000);
    }

    function stopElapsedTimer() {
        if (currentStepTimer) {
            clearInterval(currentStepTimer);
            currentStepTimer = null;
        }
    }

    async function pollStatus(jobId) {
        try {
            const res = await fetch(API_BASE + '/api/status/' + jobId);
            const data = await res.json();

            if (data.error && !data.status) {
                stopElapsedTimer();
                showError(data.error);
                return;
            }

            const elapsed = stepStartTime ? Math.round((Date.now() - stepStartTime) / 1000) : 0;
            renderProgress(data.step, elapsed);

            if (data.status === 'completed') {
                stopElapsedTimer();
                showResult(data.questions, data.metadata);
            } else if (data.status === 'error') {
                stopElapsedTimer();
                showError(data.error || 'Processing failed');
            } else {
                setTimeout(() => pollStatus(jobId), 1000);
            }
        } catch (e) {
            stopElapsedTimer();
            showError('Connection error. Please try again.');
        }
    }

    function showResult(questions, metadata) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        let html = '<div class="questions-list">';

        questions.forEach((question, index) => {
            html += '<div class="result-success">';
            html += '<div class="result-header"><span class="result-badge"><i class="fas fa-check-circle"></i> Question ' + (index + 1) + '</span></div>';
            html += '<div class="result-question">' + escapeHtml(question) + '</div>';
            html += '<div class="share-actions">';
            html += '<button class="action-btn" onclick="copyQuestion(' + index + ')"><i class="fas fa-copy"></i> Copy</button>';
            html += '<button class="action-btn" onclick="shareQuestion(' + index + ')"><i class="fas fa-share-alt"></i> Share</button>';
            html += '</div>';
            html += '</div>';
        });

        html += '</div>';

        if (metadata) {
            html += '<div style="margin-top: 16px; padding: 12px; background: #f8f9fa; border-radius: 4px; font-size: 0.85rem; color: #5f6368;">';
            html += '<i class="fas fa-info-circle"></i> Processed ' + metadata.processed_pages + ' pages';
            if (metadata.was_trimmed) {
                html += ' (trimmed from ' + metadata.original_pages + ')';
            }
            html += '</div>';
        }

        resultContainer.innerHTML = html;

        // Store questions globally for copy/share functions
        window.currentQuestions = questions;

        generateBtn.disabled = false;
        generateBtn.innerHTML = '<span>Generate More</span><i class="fas fa-arrow-right"></i>';
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
                stepStartTime = Date.now();
                lastStep = 0;
                stepTimings = {};
                startElapsedTimer();
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

// Global functions for copy and share
window.copyQuestion = function(index) {
    const question = window.currentQuestions[index];
    navigator.clipboard.writeText(question).then(() => {
        const btn = event.target.closest('.action-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        btn.style.background = '#e8f0fe';
        btn.style.color = '#1967d2';
        btn.style.borderColor = '#1967d2';
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
};

window.shareQuestion = function(index) {
    const question = window.currentQuestions[index];
    const shareText = 'Check out this question from IntelliAsk:\n\n' + question + '\n\nTry it: https://intelliask.github.io';

    if (navigator.share) {
        navigator.share({
            title: 'IntelliAsk Question',
            text: shareText
        }).catch(() => {});
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            const btn = event.target.closest('.action-btn');
            const originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied';
            btn.style.background = '#e8f0fe';
            btn.style.color = '#1967d2';
            btn.style.borderColor = '#1967d2';
            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 2000);
        });
    }
};
