$(document).ready(function() {
    // Navbar burger toggle
    $(".navbar-burger").click(function() {
        var target = $(this).data("target");
        $(this).toggleClass("is-active");
        $("#" + target).toggleClass("is-active");
    });

    initNavigation();
    initSidebarTOC();
    initIntelliAskDemo();
});

// ========================================
// Top Navbar + Sidebar TOC Navigation
// ========================================
function initNavigation() {
    // Navbar link clicks - smooth scroll
    document.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = this.getAttribute('data-target');
            var target = document.getElementById(targetId);
            if (target) {
                var offset = 56 + 16; // navbar height + padding
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
            // Close mobile menu
            $('.navbar-burger').removeClass('is-active');
            $('.navbar-menu').removeClass('is-active');
        });
    });

    // Highlight active nav link on scroll
    var navLinks = document.querySelectorAll('.nav-link');
    var sections = [];
    navLinks.forEach(function(link) {
        var id = link.getAttribute('data-target');
        var el = document.getElementById(id);
        if (el) sections.push({ id: id, el: el });
    });

    window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY + 100;
        var activeId = null;

        for (var i = sections.length - 1; i >= 0; i--) {
            if (sections[i].el.offsetTop <= scrollPos) {
                activeId = sections[i].id;
                break;
            }
        }

        navLinks.forEach(function(link) {
            if (link.getAttribute('data-target') === activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });
}

function initSidebarTOC() {
    var tocLinks = document.querySelectorAll('.toc-link');
    var sections = [];

    tocLinks.forEach(function(link) {
        var id = link.getAttribute('data-target');
        var el = document.getElementById(id);
        if (el) sections.push({ id: id, el: el, link: link });

        link.addEventListener('click', function(e) {
            e.preventDefault();
            var targetId = this.getAttribute('data-target');
            var target = document.getElementById(targetId);
            if (target) {
                var offset = 56 + 16;
                var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top: top, behavior: 'smooth' });
            }
        });
    });

    // Highlight active section
    window.addEventListener('scroll', function() {
        var scrollPos = window.scrollY + 100;
        var activeId = null;

        for (var i = sections.length - 1; i >= 0; i--) {
            if (sections[i].el.offsetTop <= scrollPos) {
                activeId = sections[i].id;
                break;
            }
        }

        tocLinks.forEach(function(link) {
            if (link.getAttribute('data-target') === activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    });
}

// ========================================
// IntelliAsk Demo
// ========================================
function initIntelliAskDemo() {
    var API_BASE = 'https://api.bbnschool.in';

    var fileInput = document.getElementById('paper-upload');
    var generateBtn = document.getElementById('generate-btn');
    var progressContainer = document.getElementById('progress-container');
    var resultContainer = document.getElementById('result-container');
    var uploadArea = document.getElementById('upload-area');

    if (!fileInput || !generateBtn) return;

    var selectedFile = null;
    var stepStartTime = null;
    var lastStep = -1;
    var stepTimings = {};
    var currentStepTimer = null;

    var steps = [
        { name: 'Uploading', desc: 'Sending your paper...' },
        { name: 'Trimming PDF', desc: 'Processing pages...' },
        { name: 'Extracting Text', desc: 'Reading your paper...' },
        { name: 'Generating Question', desc: 'IntelliAsk is thinking...' },
        { name: 'Complete', desc: 'Done!' }
    ];

    // File selection
    fileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
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

        var iconEl = uploadArea.querySelector('.upload-icon');
        if (iconEl) iconEl.className = 'fas fa-check-circle upload-icon';

        var nameEl = document.getElementById('file-name');
        var sizeEl = document.getElementById('file-size');
        if (nameEl) nameEl.textContent = file.name;
        if (sizeEl) {
            sizeEl.textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';
            sizeEl.className = 'file-meta';
        }

        generateBtn.disabled = false;
        generateBtn.classList.remove('is-light');
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
            if (e.dataTransfer.files[0]) {
                var dt = new DataTransfer();
                dt.items.add(e.dataTransfer.files[0]);
                fileInput.files = dt.files;
                fileInput.dispatchEvent(new Event('change'));
            }
        });
    }

    var uploadPercent = 0;

    function renderProgress(step, elapsedSecs) {
        if (step !== lastStep) {
            if (lastStep >= 0 && stepStartTime) {
                stepTimings[lastStep] = Math.round((Date.now() - stepStartTime) / 1000);
            }
            stepStartTime = Date.now();
            lastStep = step;
        }

        var s = steps[step] || steps[0];
        var html = '<div class="loading-state"><div class="step-progress">';
        for (var i = 1; i <= 4; i++) {
            var cls = i < step ? 'done' : (i === step ? 'active' : '');
            var timeLabel = '';
            if (stepTimings[i]) {
                timeLabel = '<span class="step-time">' + stepTimings[i] + 's</span>';
            }
            html += '<div class="step-item ' + cls + '"><div class="step-num">' + (i < step ? '&#10003;' : i) + '</div>' + timeLabel + '</div>';
            if (i < 4) html += '<div class="step-line ' + (i < step ? 'done' : '') + '"></div>';
        }
        html += '</div><div class="loading-text"><strong>' + s.name + '</strong><p>' + s.desc;
        if (step === 0 && uploadPercent > 0) {
            html += ' <span class="elapsed-time">' + uploadPercent + '%</span>';
        } else if (step > 0 && step < 4 && elapsedSecs !== undefined) {
            html += ' <span class="elapsed-time">(' + elapsedSecs + 's)</span>';
        }
        html += '</p></div>';
        // Upload progress bar for step 0
        if (step === 0) {
            html += '<div class="upload-progress-bar"><div class="upload-progress-fill" style="width:' + uploadPercent + '%"></div></div>';
        }
        html += '</div>';
        progressContainer.innerHTML = html;
    }

    function startElapsedTimer() {
        if (currentStepTimer) clearInterval(currentStepTimer);
        currentStepTimer = setInterval(function() {
            if (stepStartTime && lastStep > 0 && lastStep < 4) {
                var elapsed = Math.round((Date.now() - stepStartTime) / 1000);
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
            var res = await fetch(API_BASE + '/api/status/' + jobId);
            var data = await res.json();

            if (data.error && !data.status) {
                stopElapsedTimer();
                showError(data.error);
                return;
            }

            var elapsed = stepStartTime ? Math.round((Date.now() - stepStartTime) / 1000) : 0;
            renderProgress(data.step, elapsed);

            if (data.status === 'completed') {
                stopElapsedTimer();
                showResult(data.questions, data.metadata);
            } else if (data.status === 'error') {
                stopElapsedTimer();
                showError(data.error || 'Processing failed');
            } else {
                setTimeout(function() { pollStatus(jobId); }, 1000);
            }
        } catch (e) {
            stopElapsedTimer();
            showError('Connection error. Please try again.');
        }
    }

    function showResult(questions, metadata) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';

        var html = '<div class="questions-list">';
        questions.forEach(function(question, index) {
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
            html += '<div style="margin-top: 12px; padding: 10px; background: #f8f9fa; border: 1px solid #e8eaed; border-radius: 6px; font-size: 0.8rem; color: #5f6368;">';
            html += '<i class="fas fa-info-circle"></i> Processed ' + metadata.processed_pages + ' pages';
            if (metadata.was_trimmed) {
                html += ' (trimmed from ' + metadata.original_pages + ')';
            }
            html += '</div>';
        }

        resultContainer.innerHTML = html;
        window.currentQuestions = questions;

        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-redo"></i><span>Generate More</span>';
    }

    function showError(msg) {
        progressContainer.style.display = 'none';
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = '<div class="result-error"><div class="error-icon"><i class="fas fa-exclamation-circle"></i></div><p class="error-message">' + escapeHtml(msg) + '</p></div>';
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-bolt"></i><span>Generate</span>';
    }

    // Submit handler - uses XMLHttpRequest for upload progress
    generateBtn.addEventListener('click', function() {
        if (!selectedFile) return;

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Uploading...</span>';
        progressContainer.style.display = 'block';
        resultContainer.style.display = 'none';
        uploadPercent = 0;
        stepStartTime = Date.now();
        lastStep = -1;
        stepTimings = {};
        renderProgress(0);

        var formData = new FormData();
        formData.append('file', selectedFile);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', API_BASE + '/api/submit', true);

        // Track upload progress
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                uploadPercent = Math.round((e.loaded / e.total) * 100);
                renderProgress(0);
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Uploading ' + uploadPercent + '%</span>';
            }
        });

        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    var data = JSON.parse(xhr.responseText);
                    if (data.job_id) {
                        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
                        uploadPercent = 100;
                        stepTimings[0] = Math.round((Date.now() - stepStartTime) / 1000);
                        stepStartTime = Date.now();
                        lastStep = 0;
                        startElapsedTimer();
                        pollStatus(data.job_id);
                    } else {
                        showError('Failed to submit job');
                    }
                } catch (e) {
                    showError('Invalid response from server');
                }
            } else {
                showError('Server error (' + xhr.status + ')');
            }
        };

        xhr.onerror = function() {
            showError('Connection error. Check your internet and try again.');
        };

        xhr.ontimeout = function() {
            showError('Upload timed out. Try a smaller file or check your connection.');
        };

        xhr.timeout = 300000; // 5 minute timeout for upload
        xhr.send(formData);
    });

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ========================================
// Global copy/share functions
// ========================================
window.copyQuestion = function(index) {
    var question = window.currentQuestions[index];
    navigator.clipboard.writeText(question).then(function() {
        var btn = event.target.closest('.action-btn');
        var originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        btn.style.background = '#e8f0fe';
        btn.style.color = '#1967d2';
        btn.style.borderColor = '#1967d2';
        setTimeout(function() {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.borderColor = '';
        }, 2000);
    }).catch(function(err) {
        alert('Failed to copy: ' + err);
    });
};

window.shareQuestion = function(index) {
    var question = window.currentQuestions[index];
    var shareText = 'Check out this question from IntelliAsk:\n\n' + question + '\n\nTry it: https://intelliask.github.io';

    if (navigator.share) {
        navigator.share({
            title: 'IntelliAsk Question',
            text: shareText
        }).catch(function() {});
    } else {
        navigator.clipboard.writeText(shareText).then(function() {
            var btn = event.target.closest('.action-btn');
            var originalHTML = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check"></i> Copied';
            btn.style.background = '#e8f0fe';
            btn.style.color = '#1967d2';
            btn.style.borderColor = '#1967d2';
            setTimeout(function() {
                btn.innerHTML = originalHTML;
                btn.style.background = '';
                btn.style.color = '';
                btn.style.borderColor = '';
            }, 2000);
        });
    }
};
