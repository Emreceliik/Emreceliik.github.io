# Rigid Logic - Corporate Website

Modern, responsive corporate website for Rigid Logic technology company, built with HTML, CSS, and JavaScript. Features a professional design with greyish color scheme and includes a contact form with captcha verification.

## 🌟 Features

### Design & Layout
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Modern UI**: Clean, professional design with greyish color palette
- **Smooth Animations**: Scroll-triggered animations and smooth transitions
- **Typography**: Inter font family for modern, readable text

### Navigation
- **Fixed Navigation Bar**: Stays at top with dropdown menus
- **Smooth Scrolling**: Animated navigation between sections
- **Active Section Highlighting**: Shows current section in navigation
- **Mobile-Friendly Menu**: Hamburger menu for mobile devices

### Sections
1. **Hero Section**: Eye-catching introduction with call-to-action
2. **About Us**: Company overview and mission
3. **Our Vision**: Company vision statement (provided content)
4. **Services**: Three main service offerings:
   - Game Development
   - VR/AR Solutions
   - Automation Systems
5. **Careers**: Employment opportunities and company culture
6. **Contact**: Contact form with captcha verification

### Contact Form Features
- **Captcha Security**: Custom 6-character alphanumeric captcha
- **Form Validation**: Client-side validation for all required fields
- **Email Validation**: Proper email format checking
- **Success/Error Messages**: User feedback for form submissions
- **Refresh Captcha**: Option to generate new captcha
- **Responsive Design**: Works on all screen sizes

### Technical Features
- **Vanilla JavaScript**: No external dependencies
- **CSS Grid & Flexbox**: Modern layout techniques
- **Intersection Observer**: Performance-optimized scroll animations
- **Mobile Navigation**: Full mobile menu implementation
- **Email Copy Function**: One-click email address copying
- **Scroll to Top**: Floating button for easy navigation

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, but recommended)

### Installation

1. **Download/Clone the files**:
   ```bash
   # If using Git
   git clone [repository-url]
   
   # Or download the ZIP file and extract
   ```

2. **File Structure**:
   ```
   rigid-logic-website/
   ├── index.html          # Main HTML file
   ├── styles.css          # CSS styles
   ├── script.js           # JavaScript functionality
   ├── logo.png            # Company logo (you need to add this)
   └── README.md           # This file
   ```

3. **Add Your Logo**:
   - Replace `logo.png` with your actual Rigid Logic logo
   - Recommended size: 40x40 pixels or higher resolution square image
   - If using a different filename, update the `src` attributes in HTML

### Running the Website

#### Option 1: Simple File Opening
- Double-click `index.html` to open in your default browser
- Some features may be limited due to browser security restrictions

#### Option 2: Local Web Server (Recommended)
- **Using Python 3**:
  ```bash
  python -m http.server 8000
  ```
- **Using Python 2**:
  ```bash
  python -m SimpleHTTPServer 8000
  ```
- **Using Node.js**:
  ```bash
  npx http-server
  ```
- **Using PHP**:
  ```bash
  php -S localhost:8000
  ```

Then visit `http://localhost:8000` in your browser.

## 🎨 Customization

### Colors
The website uses a greyish color scheme. Main colors are defined in CSS:
- **Primary**: `#2c3e50` (Dark grey-blue)
- **Secondary**: `#34495e` (Medium grey-blue)
- **Accent**: `#7f8c8d` (Light grey)
- **Light**: `#95a5a6` (Very light grey)
- **Background**: `#f8f9fa` (Off-white)

### Content
1. **Company Information**: Update text in HTML sections
2. **Contact Email**: Change `info@rigidlogic.com` in both HTML and JavaScript
3. **Services**: Modify the three service cards in the Services section
4. **Vision Statement**: Already includes your provided vision text

### Logo
- Add your logo as `logo.png` or update the `src` attributes
- The CSS includes a fallback design showing "RL" initials

## 📱 Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile Browsers**: Responsive design works on all modern mobile browsers

## 🔧 Form Functionality

The contact form includes:
- **Client-side validation** for all required fields
- **Email format validation**
- **Custom captcha system** for spam protection
- **Visual feedback** for form submission status

**EmailJS Integration**: The contact form is already integrated with EmailJS for real email sending! 

To activate email functionality:
1. Follow the setup guide in `EMAILJS_SETUP.md`
2. Create a free EmailJS account
3. Configure your email service (Gmail recommended)
4. Update the EmailJS configuration in `script.js`
5. Test the form - emails will be sent to your configured address

No backend server required! ✨

## 📄 License

This project is created for Rigid Logic. All rights reserved.

## 🤝 Support

For questions about customization or setup, contact the development team or refer to the code comments for guidance.

---

**Built with ❤️ for Rigid Logic - Transforming Digital Experiences** 