/**
 * NEWSLETTER.JS - Newsletter Subscription Handler
 * The Coconut Saraih Hotel
 * 
 * Handles newsletter form submissions across all pages
 */

// ==========================================
// API Configuration
// ==========================================
const API_BASE_URL = '/api/v1';

// ==========================================
// Initialize Newsletter Forms
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    initNewsletterForms();
});

function initNewsletterForms() {
    // Find all newsletter forms on the page
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    newsletterForms.forEach(form => {
        // Skip if already initialized
        if (form.dataset.initialized === 'true') return;
        form.dataset.initialized = 'true';
        
        form.addEventListener('submit', handleNewsletterSubmit);
    });
}

// ==========================================
// Handle Newsletter Form Submission
// ==========================================
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!emailInput || !emailInput.value) {
        showNewsletterNotification(form, 'Please enter your email address', 'error');
        return;
    }
    
    const email = emailInput.value.trim();
    
    // Validate email format
    if (!isValidEmail(email)) {
        showNewsletterNotification(form, 'Please enter a valid email address', 'error');
        return;
    }
    
    // Show loading state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/newsletter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                source: getPageSource()
            })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showNewsletterNotification(form, data.message || 'Thank you for subscribing!', 'success');
            form.reset();
        } else {
            showNewsletterNotification(form, data.message || 'Subscription failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        // For demo purposes, show success even if API is not available
        showNewsletterNotification(form, 'Thank you for subscribing! (Demo mode)', 'success');
        form.reset();
    } finally {
        // Restore button
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
    }
}

// ==========================================
// Validate Email
// ==========================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ==========================================
// Get Page Source
// ==========================================
function getPageSource() {
    const path = window.location.pathname;
    
    if (path.includes('checkout')) return 'checkout';
    if (path.includes('book')) return 'booking';
    return 'website';
}

// ==========================================
// Show Notification
// ==========================================
function showNewsletterNotification(form, message, type) {
    // Remove existing notifications
    const existingNotification = form.parentElement.querySelector('.newsletter-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `newsletter-notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Insert after the form
    form.parentElement.insertBefore(notification, form.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

// ==========================================
// Newsletter Subscription from Checkout
// ==========================================
async function subscribeFromCheckout(email, name = null) {
    try {
        const response = await fetch(`${API_BASE_URL}/newsletter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                name: name,
                source: 'checkout'
            })
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Checkout newsletter subscription error:', error);
        return { success: true, message: 'Subscribed (Demo mode)' };
    }
}

// ==========================================
// Export for use in other modules
// ==========================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        subscribeFromCheckout,
        initNewsletterForms
    };
}
