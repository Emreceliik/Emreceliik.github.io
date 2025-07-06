// Internship page JavaScript functionality

let currentTrack = '';

// Show application form for specific internship track
function showApplicationForm(trackName) {
    currentTrack = trackName;
    const positionTitle = document.getElementById('position-title');
    const applicationForm = document.getElementById('application-form');
    
    if (positionTitle) {
        positionTitle.textContent = `Track: ${trackName}`;
    }
    
    if (applicationForm) {
        applicationForm.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Check if contact form container exists, if not load it
        const formContainer = document.getElementById('contact-form-container');
        if (formContainer && !formContainer.hasChildNodes()) {
            // Check if there's a preloaded form
            const preloadContainer = document.getElementById('preload-form-container');
            if (preloadContainer && preloadContainer.hasChildNodes()) {
                // Copy preloaded form to the actual container
                formContainer.innerHTML = preloadContainer.innerHTML;
                setTimeout(() => {
                    const subjectField = document.getElementById('subject');
                    if (subjectField) {
                        subjectField.value = `Application for ${trackName}`;
                    }
                }, 50);
            } else {
                // Load contact form if not preloaded
                if (typeof loadComponent === 'function') {
                    loadComponent('contact-form', 'contact-form-container').then(() => {
                        setTimeout(() => {
                            const subjectField = document.getElementById('subject');
                            if (subjectField) {
                                subjectField.value = `Application for ${trackName}`;
                            }
                        }, 100);
                    }).catch(error => {
                        console.error('Error loading contact form:', error);
                    });
                }
            }
        } else {
            // Form already exists, just update subject
            setTimeout(() => {
                const subjectField = document.getElementById('subject');
                if (subjectField) {
                    subjectField.value = `Application for ${trackName}`;
                }
            }, 50);
        }
    }
}

// Hide application form
function hideApplicationForm() {
    const applicationForm = document.getElementById('application-form');
    
    if (applicationForm) {
        applicationForm.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    currentTrack = '';
}

// Close form when clicking outside
document.addEventListener('click', function(event) {
    const applicationForm = document.getElementById('application-form');
    const formContainer = applicationForm?.querySelector('.container');
    
    if (applicationForm && 
        applicationForm.style.display === 'block' && 
        !formContainer?.contains(event.target)) {
        hideApplicationForm();
    }
});

// Escape key to close form
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        hideApplicationForm();
    }
});

// Smooth scrolling for track anchors
document.addEventListener('DOMContentLoaded', function() {
    // Handle hash links in URL
    if (window.location.hash) {
        setTimeout(() => {
            const element = document.querySelector(window.location.hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500); // Wait for components to load
    }
});

// Export functions for global access
window.showApplicationForm = showApplicationForm;
window.hideApplicationForm = hideApplicationForm; 