// Component Loader for modular HTML components
async function loadComponent(componentName, targetId) {
    try {
        const response = await fetch(`components/${componentName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load component: ${componentName}`);
        }
        const html = await response.text();
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            targetElement.innerHTML = html;
        }
        return Promise.resolve();
    } catch (error) {
        console.error('Error loading component:', error);
        return Promise.reject(error);
    }
}

// Load navbar when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    loadComponent('navbar', 'navbar-container');
    loadComponent('footer', 'footer-container');
    
    // Load contact form if contact form container exists
    const contactFormContainer = document.getElementById('contact-form-container');
    if (contactFormContainer) {
        loadComponent('contact-form', 'contact-form-container');
    }
    
    // Pre-load contact form for modal functionality on positions and internship pages
    const currentPath = window.location.pathname;
    const isPositionsPage = currentPath.includes('openpositions') || currentPath.endsWith('openpositions.html');
    const isInternshipPage = currentPath.includes('internship') || currentPath.endsWith('internship.html');
    
    if (isPositionsPage || isInternshipPage) {
        console.log('Pre-loading contact form for modal functionality');
        // Create a hidden container for pre-loading
        setTimeout(() => {
            if (!document.getElementById('preload-form-container')) {
                const preloadContainer = document.createElement('div');
                preloadContainer.id = 'preload-form-container';
                preloadContainer.style.display = 'none';
                document.body.appendChild(preloadContainer);
                loadComponent('contact-form', 'preload-form-container');
            }
        }, 500);
    }

    // Load Game Development section if container exists
    const gameDevContainer = document.getElementById('game-development-container');
    if (gameDevContainer) {
        loadComponent('game-development', 'game-development-container');
    }
});

// Function to load components dynamically
window.loadComponent = loadComponent; 