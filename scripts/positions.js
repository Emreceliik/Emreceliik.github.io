// Positions page JavaScript functionality

let currentPosition = '';

// Show application form for specific position
function showApplicationForm(positionName) {
    currentPosition = positionName;
    const positionTitle = document.getElementById('position-title');
    const applicationForm = document.getElementById('application-form');
    
    if (positionTitle) {
        positionTitle.textContent = `Position: ${positionName}`;
    }
    
    if (applicationForm) {
        applicationForm.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        
        // Load contact form if not already loaded
        loadComponent('contact-form', 'contact-form-container').then(() => {
            // Update subject field with position name
            const subjectField = document.getElementById('subject');
            if (subjectField) {
                subjectField.value = `Application for ${positionName} Position`;
            }
        });
    }
}

// Hide application form
function hideApplicationForm() {
    const applicationForm = document.getElementById('application-form');
    
    if (applicationForm) {
        applicationForm.style.display = 'none';
        document.body.style.overflow = 'auto'; // Restore scrolling
    }
    
    currentPosition = '';
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

// Smooth scrolling for position anchors
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