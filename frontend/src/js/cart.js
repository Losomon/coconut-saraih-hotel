/**
 * Cart JavaScript - The Coconut Saraih Hotel
 * Dynamic cart functionality using localStorage
 */

// Cart configuration
const CART_CONFIG = {
    TAX_RATE: 0.16,        // 16% tax
    SERVICE_FEE: 5.00,     // $5 service fee
    STORAGE_KEY: 'coconut_saraih_cart',
    PROMO_STORAGE_KEY: 'coconut_saraih_promo'
};

// ============================================
// Cart State Management
// ============================================

/**
 * Get cart from localStorage
 */
function getCart() {
    const cartData = localStorage.getItem(CART_CONFIG.STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
    localStorage.setItem(CART_CONFIG.STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
}

/**
 * Add item to cart
 */
function addToCart(roomId, checkIn, checkOut, adults, children, specialRequests = '') {
    const cart = getCart();
    
    // Get room data from roomsData
    const room = window.roomsData ? window.roomsData[roomId] : null;
    if (!room) {
        console.error('Room not found:', roomId);
        return false;
    }
    
    // Calculate nights
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    
    // Check if same room with same dates already exists
    const existingIndex = cart.findIndex(item => 
        item.roomId === roomId && 
        item.checkIn === checkIn && 
        item.checkOut === checkOut
    );
    
    if (existingIndex > -1) {
        // Update existing item
        cart[existingIndex].adults = adults;
        cart[existingIndex].children = children;
        cart[existingIndex].specialRequests = specialRequests;
    } else {
        // Add new item
        const cartItem = {
            id: Date.now().toString(),
            roomId: roomId,
            name: room.name,
            image: room.heroImage || 'assets/images/b1.jpg',
            category: room.category,
            pricePerNight: parseFloat(room.price),
            checkIn: checkIn,
            checkOut: checkOut,
            nights: nights,
            adults: parseInt(adults),
            children: parseInt(children),
            specialRequests: specialRequests,
            addedAt: new Date().toISOString()
        };
        cart.push(cartItem);
    }
    
    saveCart(cart);
    showNotification('Room added to cart!', 'success');
    return true;
}

/**
 * Remove item from cart
 */
function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    renderCart();
    showNotification('Item removed from cart', 'info');
}

/**
 * Clear entire cart
 */
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        localStorage.removeItem(CART_CONFIG.STORAGE_KEY);
        localStorage.removeItem(CART_CONFIG.PROMO_STORAGE_KEY);
        renderCart();
        showNotification('Cart cleared', 'info');
    }
}

/**
 * Update cart item
 */
function updateCartItem(itemId, updates) {
    const cart = getCart();
    const index = cart.findIndex(item => item.id === itemId);
    
    if (index > -1) {
        cart[index] = { ...cart[index], ...updates };
        
        // Recalculate nights if dates changed
        if (updates.checkIn || updates.checkOut) {
            const checkInDate = new Date(cart[index].checkIn);
            const checkOutDate = new Date(cart[index].checkOut);
            cart[index].nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
        }
        
        saveCart(cart);
        renderCart();
    }
}

// ============================================
// Cart Calculations
// ============================================

/**
 * Calculate subtotal (before tax and fees)
 */
function calculateSubtotal() {
    const cart = getCart();
    return cart.reduce((total, item) => {
        return total + (item.pricePerNight * item.nights);
    }, 0);
}

/**
 * Calculate tax amount
 */
function calculateTax() {
    return calculateSubtotal() * CART_CONFIG.TAX_RATE;
}

/**
 * Get current promo discount
 */
function getPromoDiscount() {
    const promoData = localStorage.getItem(CART_CONFIG.PROMO_STORAGE_KEY);
    if (!promoData) return 0;
    
    const promo = JSON.parse(promoData);
    const subtotal = calculateSubtotal();
    
    if (promo.type === 'percentage') {
        return subtotal * (promo.value / 100);
    } else if (promo.type === 'fixed') {
        return Math.min(promo.value, subtotal);
    }
    return 0;
}

/**
 * Calculate total
 */
function calculateTotal() {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const serviceFee = CART_CONFIG.SERVICE_FEE;
    const discount = getPromoDiscount();
    
    return subtotal + tax + serviceFee - discount;
}

// ============================================
// Cart Rendering
// ============================================

/**
 * Format date for display
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

/**
 * Format currency
 */
function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

/**
 * Get included amenities text
 */
function getIncludedText(category) {
    const base = 'Free WiFi • Breakfast Included';
    if (category && category.toLowerCase().includes('suite')) {
        return base + ' • Spa Access';
    }
    return base + ' • Pool Access';
}

/**
 * Render cart items
 */
function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartContainer = document.getElementById('empty-cart');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartService = document.getElementById('cart-service');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItemsContainer) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        // Show empty cart state
        cartItemsContainer.style.display = 'none';
        if (emptyCartContainer) {
            emptyCartContainer.style.display = 'block';
        }
        
        // Update summary to show zeros
        if (cartSubtotal) cartSubtotal.textContent = '$0.00';
        if (cartTax) cartTax.textContent = '$0.00';
        if (cartService) cartService.textContent = '$0.00';
        if (cartTotal) cartTotal.textContent = '$0.00';
        
        return;
    }
    
    // Show cart items
    cartItemsContainer.style.display = 'block';
    if (emptyCartContainer) {
        emptyCartContainer.style.display = 'none';
    }
    
    // Render each cart item
    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
                <span class="item-badge">${item.nights} Night${item.nights > 1 ? 's' : ''}</span>
            </div>
            
            <div class="cart-item-details">
                <div class="cart-item-header">
                    <h3>${item.name}</h3>
                    <button class="remove-item" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p class="cart-item-meta">${item.category || 'Standard Room'}</p>
                
                <div class="cart-item-info">
                    <div class="info-row">
                        <span class="label"><i class="fas fa-calendar-check"></i> Check In:</span>
                        <span class="value">${formatDate(item.checkIn)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label"><i class="fas fa-calendar-times"></i> Check Out:</span>
                        <span class="value">${formatDate(item.checkOut)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label"><i class="fas fa-moon"></i> Duration:</span>
                        <span class="value">${item.nights} Night${item.nights > 1 ? 's' : ''}</span>
                    </div>
                    <div class="info-row">
                        <span class="label"><i class="fas fa-users"></i> Guests:</span>
                        <span class="value">${item.adults} Adult${item.adults > 1 ? 's' : ''}${item.children > 0 ? `, ${item.children} Child${item.children > 1 ? 'ren' : ''}` : ''}</span>
                    </div>
                </div>
                
                <div class="cart-item-includes">
                    <span><i class="fas fa-check"></i> ${getIncludedText(item.category)}</span>
                </div>
            </div>
            
            <div class="cart-item-price">
                <span class="price-label">Price per night</span>
                <span class="price-amount">$${item.pricePerNight}</span>
                <span class="item-total">Total: $${(item.pricePerNight * item.nights).toFixed(2)}</span>
            </div>
        </div>
    `).join('');
    
    // Update summary
    updateCartSummary();
}

/**
 * Update cart summary
 */
function updateCartSummary() {
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartService = document.getElementById('cart-service');
    const cartTotal = document.getElementById('cart-total');
    const promoMessage = document.getElementById('promo-message');
    
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const serviceFee = CART_CONFIG.SERVICE_FEE;
    const discount = getPromoDiscount();
    const total = calculateTotal();
    
    if (cartSubtotal) cartSubtotal.textContent = formatCurrency(subtotal);
    if (cartTax) cartTax.textContent = formatCurrency(tax);
    if (cartService) cartService.textContent = formatCurrency(serviceFee);
    if (cartTotal) cartTotal.textContent = formatCurrency(total);
    
    // Show promo discount message
    if (discount > 0 && promoMessage) {
        promoMessage.innerHTML = `<span class="promo-success"><i class="fas fa-check-circle"></i> Discount applied: -${formatCurrency(discount)}</span>`;
    }
}

/**
 * Update cart count in navigation
 */
function updateCartCount() {
    const cart = getCart();
    const cartCountElements = document.querySelectorAll('.cart-count');
    
    cartCountElements.forEach(el => {
        const count = cart.length;
        el.textContent = count;
        el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
}

// ============================================
// Promo Code
// ============================================

/**
 * Apply promo code
 */
function applyPromo(event) {
    event.preventDefault();
    
    const promoInput = document.getElementById('promo-input');
    const promoMessage = document.getElementById('promo-message');
    
    if (!promoInput || !promoMessage) return;
    
    const code = promoInput.value.trim().toUpperCase();
    
    // Demo promo codes
    const promoCodes = {
        'WELCOME10': { type: 'percentage', value: 10, description: '10% off' },
        'SAVE20': { type: 'percentage', value: 20, description: '20% off' },
        'FIRST50': { type: 'fixed', value: 50, description: '$50 off' },
        'HOTEL25': { type: 'percentage', value: 25, description: '25% off' }
    };
    
    if (promoCodes[code]) {
        localStorage.setItem(CART_CONFIG.PROMO_STORAGE_KEY, JSON.stringify(promoCodes[code]));
        promoMessage.innerHTML = `<span class="promo-success"><i class="fas fa-check-circle"></i> Code applied: ${promoCodes[code].description}</span>`;
        promoInput.value = '';
        updateCartSummary();
        showNotification('Promo code applied!', 'success');
    } else {
        promoMessage.innerHTML = `<span class="promo-error"><i class="fas fa-times-circle"></i> Invalid promo code</span>`;
    }
}

/**
 * Remove promo code
 */
function removePromo() {
    localStorage.removeItem(CART_CONFIG.PROMO_STORAGE_KEY);
    const promoMessage = document.getElementById('promo-message');
    if (promoMessage) {
        promoMessage.innerHTML = '';
    }
    updateCartSummary();
}

// ============================================
// Checkout
// ============================================

/**
 * Proceed to checkout
 */
function proceedToCheckout() {
    const cart = getCart();
    
    if (cart.length === 0) {
        showNotification('Your cart is empty', 'warning');
        return;
    }
    
    // Store cart data for checkout page
    sessionStorage.setItem('checkout_cart', JSON.stringify(cart));
    sessionStorage.setItem('checkout_total', calculateTotal().toString());
    
    // Redirect to checkout
    window.location.href = 'checkout.html';
}

// ============================================
// Notifications
// ============================================

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.cart-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `cart-notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Show animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Auto hide
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// Initialize Cart
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on cart page
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;
    
    console.log('Initializing cart...');
    
    // Render cart
    renderCart();
    updateCartCount();
    
    // Add clear cart handler
    window.clearCart = clearCart;
    window.removeFromCart = removeFromCart;
    window.proceedToCheckout = proceedToCheckout;
    window.applyPromo = applyPromo;
    
    console.log('Cart initialized with', getCart().length, 'items');
});

// Export functions for use in other files
window.CartManager = {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
    updateCartItem,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    applyPromo,
    proceedToCheckout,
    formatCurrency,
    formatDate
};
