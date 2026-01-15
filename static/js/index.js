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
    // API base URL configuration
    // For local development: use local Flask server
    // For GitHub Pages: use deployed Vercel backend
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5000/api'
        : 'https://intelliaskgithubio.vercel.app/api';  // Production Vercel backend
    let selectedFile = null;

    // Handle file selection
    $('#paper-upload').on('change', function(e) {
        selectedFile = e.target.files[0];
        if (selectedFile) {
            // Update UI to show file is selected
            $('.upload-text').html(`<strong>Selected: ${selectedFile.name}</strong>`);
            $('.button.is-primary').removeClass('is-primary').addClass('is-info');
            $('.button.is-info span:last-child').text('Change File');

            // Enable the generate button
            $('.button.is-success').prop('disabled', false);

            // Update placeholder text
            $('.question-output .notification').html(`
                <p class="has-text-grey" style="text-align: center;">
                    <i class="fas fa-check-circle" style="margin-right: 10px; color: #48c774;"></i>
                    Ready to generate questions from ${selectedFile.name}
                </p>
            `);

            // Remove the "Coming Soon" tag
            $('.help .tag').remove();
        }
    });

    // Handle generate button click
    $('.button.is-success').on('click', async function() {
        if (!selectedFile) {
            alert('Please select a PDF file first');
            return;
        }

        const button = $(this);

        // Disable button and show loading state
        button.prop('disabled', true);
        button.addClass('is-loading');

        // Show processing message
        $('.question-output .notification').removeClass('is-light').addClass('is-info').html(`
            <p style="text-align: center;">
                <i class="fas fa-spinner fa-spin" style="margin-right: 10px;"></i>
                Processing your paper... This may take a minute.
            </p>
        `);

        try {
            // Create form data
            const formData = new FormData();
            formData.append('file', selectedFile);

            // Send to backend
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // Show generated questions
                $('.question-output .notification')
                    .removeClass('is-info')
                    .addClass('is-success is-light')
                    .html(`
                        <div style="text-align: left;">
                            <p style="margin-bottom: 15px;"><strong>Generated Questions:</strong></p>
                            <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHtml(data.questions)}</div>
                            <hr style="margin: 15px 0;">
                            <p class="help">
                                <i class="fas fa-info-circle"></i>
                                Processed ${data.num_pages_processed} pages |
                                Extracted ${data.extracted_text_length} characters
                            </p>
                        </div>
                    `);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            $('.question-output .notification')
                .removeClass('is-info')
                .addClass('is-danger is-light')
                .html(`
                    <p style="text-align: center;">
                        <i class="fas fa-exclamation-triangle" style="margin-right: 10px;"></i>
                        Error: ${error.message}
                    </p>
                `);
        } finally {
            // Re-enable button
            button.removeClass('is-loading').prop('disabled', false);
        }
    });

    // Helper function to escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
})
