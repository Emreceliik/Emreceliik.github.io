// Captcha System
class CaptchaSystem {
    constructor() {
        this.currentCaptcha = '';
        this.generateCaptcha();
        this.bindEvents();
    }

    generateCaptcha() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let captcha = '';
        
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        this.currentCaptcha = captcha;
        this.displayCaptcha();
    }

    displayCaptcha() {
        const display = document.getElementById('captchaDisplay');
        if (display) {
            display.textContent = this.currentCaptcha;
        }
    }

    bindEvents() {
        const refreshBtn = document.getElementById('refreshCaptcha');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.generateCaptcha();
            });
        }
    }

    validateCaptcha(userInput) {
        return userInput.toUpperCase() === this.currentCaptcha.toUpperCase();
    }
}

// EmailJS Configuration - ⚠️ BU BİLGİLERİ DEĞİŞTİRMENİZ GEREK ⚠️
const EMAILJS_CONFIG = {
    serviceID: 'service_ssc4cxc',        // ⚠️ EmailJS'te oluşturacağınız Service ID
    templateID: 'template_zh4wtow',      // ⚠️ EmailJS'te oluşturacağınız Template ID
    publicKey: '5tzmXmc7BPIcqjag7'         // ⚠️ EmailJS'ten alacağınız Public Key
};

// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.messageDiv = document.getElementById('formMessage');
        this.captcha = new CaptchaSystem();
        this.initEmailJS();
        this.bindEvents();
    }

    initEmailJS() {
        // EmailJS'i başlat
        emailjs.init(EMAILJS_CONFIG.publicKey);
        
        // Debug: Konfigürasyon kontrol
        console.log('📧 EmailJS Configuration:', {
            serviceID: EMAILJS_CONFIG.serviceID,
            templateID: EMAILJS_CONFIG.templateID,
            publicKey: EMAILJS_CONFIG.publicKey ? 'Set' : 'Missing'
        });
        
        // Uyarı: Eğer default değerler kullanılıyorsa
        if (EMAILJS_CONFIG.serviceID === 'YOUR_SERVICE_ID') {
            console.warn('⚠️ EmailJS not configured! Please update EMAILJS_CONFIG in script.js');
            console.warn('📖 See EMAILJS_SETUP.md for detailed instructions');
        }
    }

    bindEvents() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }
    }

    async handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);

        // Validate captcha
        if (!this.captcha.validateCaptcha(data.captcha)) {
            this.showMessage('Invalid captcha. Please try again.', 'error');
            this.captcha.generateCaptcha();
            return;
        }

        // Validate required fields
        const requiredFields = ['name', 'email', 'subject', 'message'];
        for (const field of requiredFields) {
            if (!data[field] || data[field].trim() === '') {
                this.showMessage(`Please fill in the ${field} field.`, 'error');
                return;
            }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // Send email via EmailJS
        this.showSubmitButton(false);
        
        try {
            // EmailJS template parametreleri
            const templateParams = {
                from_name: data.name,
                from_email: data.email,
                company: data.company || 'Belirtilmemiş',
                subject: data.subject,
                message: data.message,
                to_name: 'Rigid Logic Team',
                reply_to: data.email,
                current_date: new Date().toLocaleString('tr-TR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Istanbul'
                })
            };

            // EmailJS ile email gönder
            const response = await emailjs.send(
                EMAILJS_CONFIG.serviceID,
                EMAILJS_CONFIG.templateID,
                templateParams
            );

            console.log('Email gönderildi!', response.status, response.text);
            this.showMessage('Mesajınız için teşekkürler! En kısa sürede size geri döneceğiz.', 'success');
            this.form.reset();
            this.captcha.generateCaptcha();
            
        } catch (error) {
            console.error('Email gönderme hatası:', error);
            
            // Hata mesajını kullanıcı dostu hale getir
            let errorMessage = 'Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';
            
            if (error.text) {
                if (error.text.includes('Invalid')) {
                    errorMessage = 'EmailJS konfigürasyonu hatalı. Lütfen ayarları kontrol edin.';
                } else if (error.text.includes('rate limit')) {
                    errorMessage = 'Çok fazla mesaj gönderildi. Lütfen biraz bekleyip tekrar deneyin.';
                }
            }
            
            this.showMessage(errorMessage, 'error');
        } finally {
            this.showSubmitButton(true);
        }
    }

    showMessage(message, type) {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `form-message ${type}`;
        this.messageDiv.style.display = 'block';

        // Hide message after 5 seconds
        setTimeout(() => {
            this.messageDiv.style.display = 'none';
        }, 5000);
    }

    showSubmitButton(enabled) {
        const submitBtn = this.form.querySelector('.submit-btn');
        if (submitBtn) {
            submitBtn.disabled = !enabled;
            submitBtn.textContent = enabled ? 'Send Message' : 'Sending...';
        }
    }
}

// Smooth Scrolling and Navigation
class Navigation {
    constructor() {
        this.initSmoothScrolling();
        this.initScrollToTop();
        this.initActiveNavigation();
    }

    initSmoothScrolling() {
        // Handle navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    const navHeight = document.querySelector('.navbar').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    initScrollToTop() {
        // Create scroll to top button
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            background: #7f8c8d;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            font-size: 20px;
            display: none;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(scrollBtn);

        // Show/hide scroll button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.display = 'block';
            } else {
                scrollBtn.style.display = 'none';
            }
        });

        // Scroll to top when clicked
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    initActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');

        window.addEventListener('scroll', () => {
            let current = '';
            const navHeight = document.querySelector('.navbar').offsetHeight;

            sections.forEach(section => {
                const sectionTop = section.offsetTop - navHeight - 100;
                const sectionHeight = section.clientHeight;
                
                if (window.pageYOffset >= sectionTop && 
                    window.pageYOffset < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        });
    }
}

// Animation on Scroll
class ScrollAnimations {
    constructor() {
        this.initIntersectionObserver();
    }

    initIntersectionObserver() {
        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, options);

        // Observe sections for animation
        document.querySelectorAll('section').forEach(section => {
            observer.observe(section);
        });

        // Observe service cards
        document.querySelectorAll('.service-card').forEach(card => {
            observer.observe(card);
        });
    }
}

// Utility Functions
function copyEmail() {
    const email = 'info@rigidlgc.com';
    navigator.clipboard.writeText(email).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        
        copyBtn.textContent = 'COPIED!';
        copyBtn.style.background = '#27ae60';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#7f8c8d';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'COPIED!';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    });
}

// Mobile Navigation (for future enhancement)
class MobileNavigation {
    constructor() {
        this.createMobileMenu();
    }

    createMobileMenu() {
        // Add mobile menu toggle button
        const navbar = document.querySelector('.navbar .nav-container');
        const mobileToggle = document.createElement('button');
        mobileToggle.className = 'mobile-toggle';
        mobileToggle.innerHTML = '☰';
        mobileToggle.style.cssText = `
            display: none;
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
        `;

        navbar.appendChild(mobileToggle);

        // Add mobile styles
        const mobileStyles = document.createElement('style');
        mobileStyles.textContent = `
            @media (max-width: 768px) {
                .mobile-toggle {
                    display: block !important;
                }
                
                .nav-menu {
                    position: fixed;
                    top: 70px;
                    left: -100%;
                    width: 100%;
                    height: calc(100vh - 70px);
                    background: #2c3e50;
                    flex-direction: column;
                    justify-content: start;
                    align-items: center;
                    padding-top: 2rem;
                    transition: left 0.3s ease;
                }
                
                .nav-menu.active {
                    left: 0;
                }
                
                .nav-item {
                    margin: 1rem 0;
                }
                
                .nav-link.active {
                    color: #95a5a6;
                    border-bottom: 2px solid #95a5a6;
                    padding-bottom: 5px;
                }
            }
        `;
        document.head.appendChild(mobileStyles);

        // Toggle mobile menu
        mobileToggle.addEventListener('click', () => {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('active');
            mobileToggle.innerHTML = navMenu.classList.contains('active') ? '✕' : '☰';
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                const navMenu = document.querySelector('.nav-menu');
                navMenu.classList.remove('active');
                mobileToggle.innerHTML = '☰';
            });
        });
    }
}

// Performance Optimization
class PerformanceOptimizer {
    constructor() {
        this.lazyLoadImages();
        this.preloadCriticalResources();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    preloadCriticalResources() {
        // Preload critical CSS
        const criticalResources = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    new ContactForm();
    new Navigation();
    new ScrollAnimations();
    new MobileNavigation();
    new PerformanceOptimizer();

    // Add loading animation
    document.body.classList.add('loaded');

    // Console message for developers
    console.log('%cRigid Logic Website', 'color: #7f8c8d; font-size: 24px; font-weight: bold;');
    console.log('%cBuilt with modern web technologies', 'color: #5d6d7e; font-size: 14px;');
    console.log('%cFor inquiries: info@rigidlgc.com', 'color: #5d6d7e; font-size: 14px;');
});

// Handle window resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate any layout-dependent elements
        console.log('Window resized, recalculating layout...');
    }, 150);
});

// Export for potential use in other scripts
window.RigidLogic = {
    ContactForm,
    Navigation,
    ScrollAnimations,
    CaptchaSystem,
    copyEmail
}; 