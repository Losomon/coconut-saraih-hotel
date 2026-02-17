/**
 * CHECKOUT.JS - FULLY FUNCTIONAL CHECKOUT SYSTEM
 * The Coconut Saraih Hotel
 * 
 * Features:
 * - Dynamic cart data loading
 * - Form validation
 * - Payment method switching
 * - Promo code application
 * - Order calculation
 * - Payment processing simulation
 * - Success/Error handling
 */

// ==========================================
// STATE MANAGEMENT
// ==========================================
const checkoutState = {
    cartItems: [],
    subtotal: 0,
    tax: 0,
    serviceFee: 5.00,
    discount: 0,
    total: 0,
    promoCode: null,
    selectedPaymentMethod: 'card'
};

// ==========================================
// PROMO CODES DATABASE
// ==========================================
const promoCodes = {
    'WELCOME10': { discount: 10, type: 'percentage', message: '10% off applied!' },
    'SAVE20': { discount: 20, type: 'percentage', message: '20% off applied!' },
    'SUMMER25': { discount: 25, type: 'percentage', message: '25% Summer discount!' },
    'FLAT50': { discount: 50, type: 'fixed', message: '$50 off applied!' },
    'COCONUT': { discount: 15, type: 'percentage', message: '15% Coconut special!' }
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page initialized');
    
    loadCartData();
    setupPaymentMethodToggle();
    setupFormValidation();
    setupCardFormatting();
    
    // Load from session storage if available
    loadGuestInfo();
});

// ==========================================
// LOAD CART DATA
// ==========================================
function loadCartData() {
    try {
        // Get cart from localStorage
        const cartData = localStorage.getItem('hotelCart');
        
        if (cartData) {
            checkoutState.cartItems = JSON.parse(cartData);
            displayCheckoutSummary();
            calculateTotals();
        } else {
            // Show empty cart message
            showEmptyCartMessage();
        }
    } catch (error) {
        console.error('Error loading cart data:', error);
        showEmptyCartMessage();
    }
}

// ==========================================
// DISPLAY CHECKOUT SUMMARY
// ==========================================
function displayCheckoutSummary() {
    const summaryContainer = document.getElementById('checkout-summary');
    
    if (!summaryContainer) return;
    
    if (checkoutState.cartItems.length === 0) {
        summaryContainer.innerHTML = `
            <div class="empty-checkout">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="rooms.html" class="btn-primary">Browse Rooms</a>
            </div>
        `;
        return;
    }
    
    summaryContainer.innerHTML = checkoutState.cartItems.map(item => `
        <div class="summary-item" data-item-id="${item.id}">
            <img src="${item.image || 'assets/images/default-room.jpg'}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.nights || 1} night${(item.nights || 1) > 1 ? 's' : ''} • ${item.guests || 2} Guest${(item.guests || 2) > 1 ? 's' : ''}</p>
                <p class="dates">${formatDate(item.checkIn)} - ${formatDate(item.checkOut)}</p>
            </div>
            <span class="price">$${parseFloat(item.price).toFixed(2)}</span>
        </div>
    `).join('');
}

// ==========================================
// CALCULATE TOTALS
// ==========================================
function calculateTotals() {
    // Calculate subtotal
    checkoutState.subtotal = checkoutState.cartItems.reduce((sum, item) => {
        return sum + parseFloat(item.price);
    }, 0);
    
    // Calculate tax (16%)
    checkoutState.tax = checkoutState.subtotal * 0.16;
    
    // Apply discount if promo code exists
    if (checkoutState.promoCode) {
        const promo = promoCodes[checkoutState.promoCode];
        if (promo.type === 'percentage') {
            checkoutState.discount = checkoutState.subtotal * (promo.discount / 100);
        } else {
            checkoutState.discount = promo.discount;
        }
    }
    
    // Calculate total
    checkoutState.total = checkoutState.subtotal + checkoutState.tax + checkoutState.serviceFee - checkoutState.discount;
    
    // Update UI
    updateSummaryUI();
}

// ==========================================
// UPDATE SUMMARY UI
// ==========================================
function updateSummaryUI() {
    const subtotalEl = document.getElementById('summary-subtotal');
    const taxEl = document.getElementById('summary-tax');
    const serviceEl = document.getElementById('summary-service');
    const discountEl = document.getElementById('summary-discount');
    const discountRow = document.getElementById('discount-row');
    const totalEl = document.getElementById('summary-total');
    
    if (subtotalEl) subtotalEl.textContent = `$${checkoutState.subtotal.toFixed(2)}`;
    if (taxEl) taxEl.textContent = `$${checkoutState.tax.toFixed(2)}`;
    if (serviceEl) serviceEl.textContent = `$${checkoutState.serviceFee.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${checkoutState.total.toFixed(2)}`;
    
    // Show/hide discount row
    if (checkoutState.discount > 0) {
        if (discountRow) discountRow.style.display = 'flex';
        if (discountEl) discountEl.textContent = `-$${checkoutState.discount.toFixed(2)}`;
    } else {
        if (discountRow) discountRow.style.display = 'none';
    }
}

// ==========================================
// PAYMENT METHOD TOGGLE
// ==========================================
function setupPaymentMethodToggle() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('card-details');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            checkoutState.selectedPaymentMethod = this.value;
            
            // Show/hide card details
            if (cardDetails) {
                if (this.value === 'card') {
                    cardDetails.style.display = 'block';
                    cardDetails.style.animation = 'fadeIn 0.3s ease';
                } else {
                    cardDetails.style.display = 'none';
                }
            }
        });
    });
}

// ==========================================
// FORM VALIDATION
// ==========================================
function setupFormValidation() {
    const form = document.getElementById('checkout-form');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        try {
            // Simulate payment processing
            await processPayment();
            
            // Success - redirect to confirmation
            window.location.href = 'confirmation.html';
            
        } catch (error) {
            // Show error
            showNotification('Payment failed. Please try again.', 'error');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ==========================================
// VALIDATE FORM
// ==========================================
function validateForm() {
    const form = document.getElementById('checkout-form');
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('error');
            
            // Remove error class on input
            field.addEventListener('input', function() {
                this.classList.remove('error');
            }, { once: true });
        }
    });
    
    // Validate email
    const email = document.getElementById('email');
    if (email && email.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            isValid = false;
            email.classList.add('error');
            showNotification('Please enter a valid email address', 'error');
        }
    }
    
    // Validate phone
    const phone = document.getElementById('phone');
    if (phone && phone.value) {
        const phoneRegex = /^[0-9+\-\s()]{10,}$/;
        if (!phoneRegex.test(phone.value)) {
            isValid = false;
            phone.classList.add('error');
            showNotification('Please enter a valid phone number', 'error');
        }
    }
    
    // Validate card details if card payment selected
    if (checkoutState.selectedPaymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber');
        const cardExpiry = document.getElementById('cardExpiry');
        const cardCVV = document.getElementById('cardCVV');
        
        if (cardNumber && !cardNumber.value.replace(/\s/g, '').match(/^\d{16}$/)) {
            isValid = false;
            cardNumber.classList.add('error');
            showNotification('Please enter a valid card number', 'error');
        }
        
        if (cardExpiry && !cardExpiry.value.match(/^\d{2}\/\d{2}$/)) {
            isValid = false;
            cardExpiry.classList.add('error');
            showNotification('Please enter a valid expiry date (MM/YY)', 'error');
        }
        
        if (cardCVV && !cardCVV.value.match(/^\d{3,4}$/)) {
            isValid = false;
            cardCVV.classList.add('error');
            showNotification('Please enter a valid CVV', 'error');
        }
    }
    
    if (!isValid) {
        showNotification('Please fill in all required fields correctly', 'error');
    }
    
    return isValid;
}

// ==========================================
// CARD FORMATTING
// ==========================================
function setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCVV = document.getElementById('cardCVV');
    
    // Format card number
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry date
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV numbers only
    if (cardCVV) {
        cardCVV.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

// ==========================================
// PROCESS PAYMENT
// ==========================================
async function processPayment() {
    // Simulate API call
    return new Promise(async (resolve, reject) => {
        setTimeout(async () => {
            // Get form data
            const formData = getFormData();
            
            // Save booking to localStorage
            const booking = {
                id: generateBookingId(),
                bookingDate: new Date().toISOString(),
                guestInfo: formData.guestInfo,
                items: checkoutState.cartItems,
                payment: {
                    method: checkoutState.selectedPaymentMethod,
                    subtotal: checkoutState.subtotal,
                    tax: checkoutState.tax,
                    serviceFee: checkoutState.serviceFee,
                    discount: checkoutState.discount,
                    total: checkoutState.total,
                    promoCode: checkoutState.promoCode
                },
                specialRequests: formData.specialRequests,
                preferences: formData.preferences,
                status: 'confirmed'
            };
            
            // Save to localStorage
            localStorage.setItem('lastBooking', JSON.stringify(booking));
            
            // Clear cart
            localStorage.removeItem('hotelCart');
            
            // Save guest info for future use
            saveGuestInfo(formData.guestInfo);
            
            // Handle newsletter subscription if checkbox is checked
            const newsletterCheckbox = document.querySelector('input[name="newsletter"]');
            if (newsletterCheckbox && newsletterCheckbox.checked && formData.guestInfo.email) {
                try {
                    await subscribeFromCheckout(
                        formData.guestInfo.email, 
                        `${formData.guestInfo.firstName} ${formData.guestInfo.lastName}`
                    );
                } catch (error) {
                    console.log('Newsletter subscription skipped:', error);
                }
            }
            
            resolve(booking);
        }, 2000); // 2 second delay to simulate processing
    });
}

// ==========================================
// GET FORM DATA
// ==========================================
function getFormData() {
    return {
        guestInfo: {
            firstName: document.getElementById('firstName')?.value,
            lastName: document.getElementById('lastName')?.value,
            email: document.getElementById('email')?.value,
            phone: document.getElementById('phone')?.value,
            nationality: document.getElementById('nationality')?.value
        },
        specialRequests: document.getElementById('specialRequests')?.value,
        preferences: Array.from(document.querySelectorAll('input[name="preferences"]:checked'))
            .map(cb => cb.value)
    };
}

// ==========================================
// PROMO CODE APPLICATION
// ==========================================
function applyCheckoutPromo(event) {
    event.preventDefault();
    
    const promoInput = document.getElementById('checkout-promo-input');
    const promoMessage = document.getElementById('checkout-promo-message');
    const code = promoInput.value.trim().toUpperCase();
    
    if (!code) {
        promoMessage.innerHTML = '<p class="error">Please enter a promo code</p>';
        return;
    }
    
    if (promoCodes[code]) {
        checkoutState.promoCode = code;
        calculateTotals();
        
        promoMessage.innerHTML = `<p class="success"><i class="fas fa-check-circle"></i> ${promoCodes[code].message}</p>`;
        promoInput.disabled = true;
        
        showNotification(promoCodes[code].message, 'success');
    } else {
        promoMessage.innerHTML = '<p class="error"><i class="fas fa-times-circle"></i> Invalid promo code</p>';
        showNotification('Invalid promo code', 'error');
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function generateBookingId() {
    return 'BK' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function showEmptyCartMessage() {
    const summaryContainer = document.getElementById('checkout-summary');
    if (summaryContainer) {
        summaryContainer.innerHTML = `
            <div class="empty-checkout">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <a href="rooms.html" class="btn-primary">Browse Rooms</a>
            </div>
        `;
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.checkout-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `checkout-notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function saveGuestInfo(guestInfo) {
    sessionStorage.setItem('guestInfo', JSON.stringify(guestInfo));
}

function loadGuestInfo() {
    const saved = sessionStorage.getItem('guestInfo');
    if (saved) {
        const info = JSON.parse(saved);
        
        // Pre-fill form if elements exist
        if (document.getElementById('firstName')) document.getElementById('firstName').value = info.firstName || '';
        if (document.getElementById('lastName')) document.getElementById('lastName').value = info.lastName || '';
        if (document.getElementById('email')) document.getElementById('email').value = info.email || '';
        if (document.getElementById('phone')) document.getElementById('phone').value = info.phone || '';
        if (document.getElementById('nationality')) document.getElementById('nationality').value = info.nationality || '';
    }
}

// ==========================================
// NEWSLETTER SUBSCRIPTION FROM CHECKOUT
// ==========================================
async function subscribeFromCheckout(email, name = null) {
    try {
        const response = await fetch('/api/v1/newsletter', {
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
// ANIMATIONS
// ==========================================
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
    
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #dc3545 !important;
        animation: shake 0.3s ease;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .checkout-notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-left: 4px solid;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        max-width: 350px;
    }
    
    .notification-success { border-left-color: #27ae60; }
    .notification-error { border-left-color: #dc3545; }
    .notification-info { border-left-color: #17a2b8; }
    
    .notification-success i { color: #27ae60; }
    .notification-error i { color: #dc3545; }
    .notification-info i { color: #17a2b8; }
    
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .empty-checkout {
        text-align: center;
        padding: 3rem 2rem;
    }
    
    .empty-checkout i {
        font-size: 3rem;
        color: var(--primary-gold);
        opacity: 0.3;
        margin-bottom: 1rem;
    }
    
    .empty-checkout .btn-primary {
        display: inline-block;
        margin-top: 1rem;
        padding: 0.75rem 2rem;
        background: var(--primary-gold);
        color: var(--primary-dark);
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
    }
    
    #checkout-promo-message p {
        margin: 0.75rem 0 0 0;
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
    }
    
    #checkout-promo-message .success {
        background: #d4edda;
        color: #155724;
    }
    
    #checkout-promo-message .error {
        background: #f8d7da;
        color: #721c24;
    }
`;
document.head.appendChild(style);

// ==========================================
// EXPORT FUNCTION (for use in other files)
// ==========================================
if (typeof window !== 'undefined') {
    window.applyCheckoutPromo = applyCheckoutPromo;
}

console.log('✅ Checkout system loaded successfully');
