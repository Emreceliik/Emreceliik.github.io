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
});

// Function to load components dynamically
window.loadComponent = loadComponent; 