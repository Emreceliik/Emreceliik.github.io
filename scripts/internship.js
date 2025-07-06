// Internship page JavaScript functionality - Additional features only
// Main functions are defined inline in the HTML for immediate availability

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