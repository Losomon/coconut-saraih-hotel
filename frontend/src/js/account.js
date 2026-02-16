/**
 * Account Page JavaScript
 * The Coconut Saraih Hotel
 */

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api/v1';

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
});

// Check if user is logged in
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if (token && user) {
        showDashboard(user);
    } else {
        showAuthForms();
        // Check URL params for login/register
        const params = new URLSearchParams(window.location.search);
        const action = params.get('action');
        if (action === 'register') {
            showRegister();
        }
    }
}

// Show authentication forms
function showAuthForms() {
    document.getElementById('auth-forms').style.display = 'block';
    document.getElementById('user-dashboard').style.display = 'none';
}

// Show user dashboard
function showDashboard(user) {
    document.getElementById('auth-forms').style.display = 'none';
    document.getElementById('user-dashboard').style.display = 'grid';
    
    // Update user info
    document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('user-email').textContent = user.email;
    
    // Update profile form fields
    const profileForm = document.getElementById('tab-profile');
    if (profileForm) {
        const firstNameInput = profileForm.querySelector('#profile-firstname');
        const lastNameInput = profileForm.querySelector('#profile-lastname');
        const emailInput = profileForm.querySelector('#profile-email');
        const phoneInput = profileForm.querySelector('#profile-phone');
        const nationalitySelect = profileForm.querySelector('#profile-nationality');
        
        if (firstNameInput) firstNameInput.value = user.firstName || '';
        if (lastNameInput) lastNameInput.value = user.lastName || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        if (nationalitySelect) nationalitySelect.value = user.nationality || 'Kenya';
    }
    
    // Load dashboard data
    loadDashboardData();
}

// Switch between login and register
function showLogin() {
    // Hide all forms first
    const allForms = ['login-form', 'register-form', 'forgot-password-form', 'verification-code-form', 'new-password-form'];
    allForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.classList.remove('active');
            form.style.display = 'none';
        }
    });
    
    // Show login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.classList.add('active');
        loginForm.style.display = 'block';
    }
    
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
    document.querySelectorAll('.auth-tab')[1].classList.remove('active');
}

function showRegister() {
    // Hide all forms first
    const allForms = ['login-form', 'register-form', 'forgot-password-form', 'verification-code-form', 'new-password-form'];
    allForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.classList.remove('active');
            form.style.display = 'none';
        }
    });
    
    // Show register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.classList.add('active');
        registerForm.style.display = 'block';
    }
    
    document.querySelectorAll('.auth-tab')[0].classList.remove('active');
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
}

// Handle login
async function handleLogin(event) {
    event.preventDefault();
    
    // Check if account is locked
    if (checkAccountLockout()) {
        return;
    }
    
    const form = event.target;
    let email = form.email.value.trim();
    const password = form.password.value;
    const remember = form.remember?.checked || false;
    
    // Sanitize email
    email = sanitizeInput(email);
    
    // Validate email format before submission
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const emailInput = form.email;
        setInputError(emailInput, 'Please enter a valid email address');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Clear failed attempts on success
            localStorage.removeItem('failedAttempts');
            
            // Handle Remember Me
            if (remember) {
                localStorage.setItem('rememberedEmail', email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Store auth data
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // Show success notification
            showNotification('Login successful! Welcome back.', 'success');
            
            // Check for redirect
            const redirect = sessionStorage.getItem('redirectAfterLogin');
            if (redirect) {
                sessionStorage.removeItem('redirectAfterLogin');
                setTimeout(() => {
                    window.location.href = redirect;
                }, 1000);
            } else {
                // Show dashboard
                setTimeout(() => {
                    showDashboard(data.data.user);
                }, 1000);
            }
        } else {
            // Track failed attempt
            trackFailedAttempt();
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    } catch (error) {
        console.error('Login error:', error);
        
        // Track failed attempt
        if (trackFailedAttempt()) {
            return;
        }
        
        // Fallback to demo mode if API is not available
        const demoUser = {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: email,
            phone: '+254 700 000 000',
            nationality: 'Kenya'
        };
        
        // Handle Remember Me for demo
        if (remember) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        localStorage.setItem('authToken', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        showNotification('Login successful! (Demo Mode)', 'success');
        
        setTimeout(() => {
            showDashboard(demoUser);
        }, 1000);
    }
}

// Handle registration
async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    const userData = {
        email: form.email.value,
        password: password,
        firstName: form.firstName.value,
        lastName: form.lastName.value,
        phone: form.phone.value
    };
    
    try {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store auth data
            localStorage.setItem('authToken', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            // Show success notification
            showNotification('Account created successfully! Welcome to Coconut Saraih.', 'success');
            
            // Show dashboard
            setTimeout(() => {
                showDashboard(data.data.user);
            }, 1500);
        } else {
            showNotification(data.message || 'Registration failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        }
    } catch (error) {
        console.error('Registration error:', error);
        
        // Fallback to demo mode
        const demoUser = {
            id: Date.now(),
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            nationality: 'Kenya'
        };
        
        localStorage.setItem('authToken', 'demo-token');
        localStorage.setItem('user', JSON.stringify(demoUser));
        
        showNotification('Account created! (Demo Mode)', 'success');
        
        setTimeout(() => {
            showDashboard(demoUser);
        }, 1500);
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Show dashboard tab
function showDashboardTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(`tab-${tabName}`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Update nav items
    document.querySelectorAll('.dashboard-nav .nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    if (event && event.target) {
        const navItem = event.target.closest('.nav-item');
        if (navItem) {
            navItem.classList.add('active');
        }
    }
}

// Load dashboard data
async function loadDashboardData() {
    const token = localStorage.getItem('authToken');
    
    // If no token, load demo data
    if (!token) {
        loadDemoBookings();
        return;
    }
    
    try {
        // Load bookings
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            const bookings = data.data.bookings;
            
            // Update stats
            updateStats(bookings);
            
            // Display recent bookings
            displayRecentBookings(bookings.slice(0, 3));
            
            // Display all bookings in bookings tab
            displayAllBookings(bookings);
        } else {
            // Load demo data if API returns error
            loadDemoBookings();
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Load demo data on error
        loadDemoBookings();
    }
}

// Load demo bookings for testing
function loadDemoBookings() {
    const demoBookings = [
        {
            _id: '1',
            bookingReference: 'CS-2026-001',
            room: {
                type: 'Deluxe Ocean View Room',
                roomNumber: '101',
                images: ['https://cozystay.loftocean.com/apartment/wp-content/uploads/sites/6/2023/03/img-32.jpg']
            },
            checkIn: '2026-02-15',
            checkOut: '2026-02-18',
            guests: { adults: 2, children: 0 },
            pricing: { total: 333 },
            status: 'confirmed'
        },
        {
            _id: '2',
            bookingReference: 'CS-2026-002',
            room: {
                type: 'Ocean View Suite',
                roomNumber: '205',
                images: ['https://cozystay.loftocean.com/apartment/wp-content/uploads/sites/6/2023/03/img-30.jpg']
            },
            checkIn: '2026-02-20',
            checkOut: '2026-02-23',
            guests: { adults: 2, children: 1 },
            pricing: { total: 450 },
            status: 'pending'
        },
        {
            _id: '3',
            bookingReference: 'CS-2025-156',
            room: {
                type: 'Standard Room',
                roomNumber: '002',
                images: ['https://cozystay.loftocean.com/apartment/wp-content/uploads/sites/6/2023/03/img-28.jpg']
            },
            checkIn: '2025-12-20',
            checkOut: '2025-12-25',
            guests: { adults: 2, children: 1 },
            pricing: { total: 275 },
            status: 'completed'
        }
    ];
    
    // Update stats
    updateStats(demoBookings);
    
    // Display recent bookings
    displayRecentBookings(demoBookings.slice(0, 2));
    
    // Display all bookings
    displayAllBookings(demoBookings);
}

// Update stats
function updateStats(bookings) {
    const totalBookings = bookings.length;
    const upcomingStays = bookings.filter(b => 
        new Date(b.checkIn) > new Date() && b.status !== 'cancelled' && b.status !== 'completed'
    ).length;
    
    const totalSpent = bookings.reduce((sum, b) => 
        sum + (b.pricing?.total || 0), 0
    );
    
    const totalEl = document.getElementById('total-bookings');
    const upcomingEl = document.getElementById('upcoming-stays');
    const spentEl = document.getElementById('total-spent');
    const pointsEl = document.getElementById('loyalty-points');
    
    if (totalEl) totalEl.textContent = totalBookings;
    if (upcomingEl) upcomingEl.textContent = upcomingStays;
    if (spentEl) spentEl.textContent = `$${totalSpent.toFixed(2)}`;
    if (pointsEl) pointsEl.textContent = totalBookings * 100;
}

// Display recent bookings
function displayRecentBookings(bookings) {
    const container = document.getElementById('recent-bookings-list');
    
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">No bookings yet. <a href="rooms.html">Browse rooms</a></p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <img src="${booking.room?.images?.[0] || 'assets/images/default-room.jpg'}" alt="Room" class="booking-image">
            <div class="booking-details">
                <h4>${booking.room?.type || 'Room'} - ${booking.room?.roomNumber || 'N/A'}</h4>
                <p><i class="fas fa-calendar"></i> ${formatDate(booking.checkIn)} - ${formatDate(booking.checkOut)}</p>
                <p><i class="fas fa-users"></i> ${booking.guests?.adults || 2} Adults, ${booking.guests?.children || 0} Children</p>
                <span class="booking-status ${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-actions">
                <button class="btn-action" onclick="viewBooking('${booking._id}')">View Details</button>
                ${booking.status === 'confirmed' ? `<button class="btn-action" onclick="cancelBooking('${booking._id}')">Cancel</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Display all bookings
function displayAllBookings(bookings) {
    const container = document.getElementById('bookings-list');
    
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-bookings">No bookings found. <a href="rooms.html">Make your first booking</a></p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card" data-status="${booking.status}">
            <img src="${booking.room?.images?.[0] || 'assets/images/default-room.jpg'}" alt="Room" class="booking-image">
            <div class="booking-details">
                <h4>${booking.room?.type || 'Room'} - Booking #${booking.bookingReference}</h4>
                <p><i class="fas fa-calendar-check"></i> Check-in: ${formatDate(booking.checkIn)}</p>
                <p><i class="fas fa-calendar-times"></i> Check-out: ${formatDate(booking.checkOut)}</p>
                <p><i class="fas fa-users"></i> ${booking.guests?.adults || 2} Adults, ${booking.guests?.children || 0} Children</p>
                <p><i class="fas fa-dollar-sign"></i> Total: $${booking.pricing?.total || 0}</p>
                <span class="booking-status ${booking.status}">${booking.status}</span>
            </div>
            <div class="booking-actions">
                <button class="btn-action" onclick="viewBooking('${booking._id}')">View Details</button>
                ${booking.status === 'confirmed' ? `<button class="btn-action" onclick="cancelBooking('${booking._id}')">Cancel Booking</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Filter bookings
function filterBookings(filter) {
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Filter cards
    const cards = document.querySelectorAll('#bookings-list .booking-card');
    cards.forEach(card => {
        const status = card.dataset.status;
        
        if (filter === 'all') {
            card.style.display = 'grid';
        } else if (filter === 'upcoming') {
            const checkInDate = card.querySelector('.booking-details p').textContent;
            const dateMatch = checkInDate.match(/Check-in:\s*(.+)/);
            if (dateMatch) {
                const isUpcoming = new Date(dateMatch[1]) > new Date();
                card.style.display = isUpcoming ? 'grid' : 'none';
            } else {
                card.style.display = 'none';
            }
        } else if (filter === 'past') {
            card.style.display = (status === 'completed') ? 'grid' : 'none';
        } else if (filter === 'cancelled') {
            card.style.display = (status === 'cancelled') ? 'grid' : 'none';
        } else {
            card.style.display = 'grid';
        }
    });
}

// View booking details
function viewBooking(bookingId) {
    // Redirect to booking details page or open modal
    window.location.href = `booking-details.html?id=${bookingId}`;
}

// Cancel booking
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    // If demo mode, just show notification
    if (!token || token === 'demo-token') {
        showNotification('Booking cancelled! (Demo Mode)', 'success');
        loadDemoBookings();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Booking cancelled successfully', 'success');
            loadDashboardData(); // Reload data
        } else {
            showNotification(data.message || 'Failed to cancel booking', 'error');
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        showNotification('Failed to cancel booking', 'error');
    }
}

// Update profile
async function updateProfile(event) {
    event.preventDefault();
    
    const form = event.target;
    const userData = {
        firstName: form.querySelector('#profile-firstname')?.value,
        lastName: form.querySelector('#profile-lastname')?.value,
        phone: form.querySelector('#profile-phone')?.value,
        nationality: form.querySelector('#profile-nationality')?.value
    };
    
    const token = localStorage.getItem('authToken');
    
    // If demo mode, just update local storage
    if (!token || token === 'demo-token') {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        Object.assign(user, userData);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update display
        document.getElementById('user-name').textContent = `${userData.firstName} ${userData.lastName}`;
        
        showNotification('Profile updated! (Demo Mode)', 'success');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update stored user data
            const user = JSON.parse(localStorage.getItem('user'));
            Object.assign(user, userData);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Update display
            document.getElementById('user-name').textContent = `${userData.firstName} ${userData.lastName}`;
            
            showNotification('Profile updated successfully', 'success');
        } else {
            showNotification(data.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        
        // Fallback to demo mode
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        Object.assign(user, userData);
        localStorage.setItem('user', JSON.stringify(user));
        
        document.getElementById('user-name').textContent = `${userData.firstName} ${userData.lastName}`;
        
        showNotification('Profile updated! (Demo Mode)', 'success');
    }
}

// Change password
async function changePassword(event) {
    event.preventDefault();
    
    const form = event.target;
    const currentPassword = form.currentPassword?.value;
    const newPassword = form.newPassword?.value;
    const confirmPassword = form.confirmPassword?.value;
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    const token = localStorage.getItem('authToken');
    
    // If demo mode
    if (!token || token === 'demo-token') {
        showNotification('Password changed! (Demo Mode)', 'success');
        form.reset();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Password changed successfully', 'success');
            form.reset();
        } else {
            showNotification(data.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Change password error:', error);
        showNotification('Password changed! (Demo Mode)', 'success');
        form.reset();
    }
}

// Helper: Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Helper: Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    notification.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Additional event listeners can be added here
    setupFormValidation();
    console.log('Account page initialized');
}

// ============================================
// MODAL FUNCTIONS
// ============================================

// Show Terms & Conditions modal
function showTermsModal(event) {
    event.preventDefault();
    document.getElementById('terms-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Show Privacy Policy modal
function showPrivacyModal(event) {
    event.preventDefault();
    document.getElementById('privacy-modal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Accept terms
function acceptTerms() {
    const checkbox = document.getElementById('terms-checkbox');
    if (checkbox) {
        checkbox.checked = true;
    }
    closeModal('terms-modal');
    showNotification('Terms accepted!', 'success');
}

// Accept privacy policy
function acceptPrivacy() {
    const checkbox = document.getElementById('terms-checkbox');
    if (checkbox) {
        checkbox.checked = true;
    }
    closeModal('privacy-modal');
    showNotification('Privacy policy accepted!', 'success');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// FORGOT PASSWORD FUNCTIONS
// ============================================

// Show forgot password form
function showForgotPassword(event) {
    event.preventDefault();
    
    console.log('showForgotPassword called');
    
    // Hide all auth forms first
    const allForms = ['login-form', 'register-form', 'forgot-password-form', 'verification-code-form', 'new-password-form'];
    allForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.classList.remove('active');
            form.style.display = 'none';
        }
    });
    
    // Show forgot password form
    const forgotForm = document.getElementById('forgot-password-form');
    if (forgotForm) {
        forgotForm.classList.add('active');
        forgotForm.style.display = 'block';
        console.log('Forgot password form shown');
    } else {
        console.error('Forgot password form not found');
    }
    
    // Update tab states
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
}

// Handle forgot password - send verification code
async function handleForgotPassword(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value.trim();
    
    if (!email) {
        showNotification('Please enter your email address', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    
    try {
        // API call to send verification code
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store email for verification
            sessionStorage.setItem('resetEmail', email);
            
            showNotification('Verification code sent to your email!', 'success');
            
            // Show verification form
            setTimeout(() => {
                showVerificationForm();
            }, 1000);
        } else {
            showNotification(data.message || 'Failed to send verification code', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-envelope"></i> Send Verification Code';
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        
        // Demo mode - simulate success
        sessionStorage.setItem('resetEmail', email);
        showNotification('Verification code sent! (Demo: use 123456)', 'success');
        
        setTimeout(() => {
            showVerificationForm();
        }, 1000);
    }
}

// Show verification code form
function showVerificationForm() {
    // Hide all forms first
    const allForms = ['login-form', 'register-form', 'forgot-password-form', 'verification-code-form', 'new-password-form'];
    allForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.classList.remove('active');
            form.style.display = 'none';
        }
    });
    
    // Show verification form
    const verificationForm = document.getElementById('verification-code-form');
    if (verificationForm) {
        verificationForm.classList.add('active');
        verificationForm.style.display = 'block';
    }
    
    // Clear and focus the code input
    const codeInput = document.getElementById('verification-code');
    if (codeInput) {
        codeInput.value = '';
        codeInput.focus();
    }
    
    // Start resend timer
    startResendTimer();
}

// Show new password form
function showNewPasswordForm() {
    // Hide all forms first
    const allForms = ['login-form', 'register-form', 'forgot-password-form', 'verification-code-form', 'new-password-form'];
    allForms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) {
            form.classList.remove('active');
            form.style.display = 'none';
        }
    });
    
    // Show new password form
    const newPasswordForm = document.getElementById('new-password-form');
    if (newPasswordForm) {
        newPasswordForm.classList.add('active');
        newPasswordForm.style.display = 'block';
    }
    
    // Clear and focus the password input
    const passwordInput = document.getElementById('new-password');
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Handle verification code submission
async function handleVerificationCode(event) {
    event.preventDefault();
    
    const form = event.target;
    const code = form.code.value.trim();
    
    if (!code || code.length !== 6) {
        showNotification('Please enter a 6-digit verification code', 'error');
        return;
    }
    
    const email = sessionStorage.getItem('resetEmail');
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Code verified successfully!', 'success');
            
            // Show new password form
            setTimeout(() => {
                showNewPasswordForm();
            }, 1000);
        } else {
            showNotification(data.message || 'Invalid verification code', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Verify Code';
        }
    } catch (error) {
        console.error('Verification error:', error);
        
        // Demo mode - accept 123456
        if (code === '123456') {
            showNotification('Code verified! (Demo Mode)', 'success');
            
            setTimeout(() => {
                showNewPasswordForm();
            }, 1000);
        } else {
            showNotification('Invalid code. Use 123456 for demo.', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Verify Code';
        }
    }
}

// Show new password form
function showNewPasswordForm() {
    // Hide other forms
    document.getElementById('login-form').classList.remove('active');
    document.getElementById('register-form').classList.remove('active');
    document.getElementById('forgot-password-form').classList.remove('active');
    document.getElementById('verification-code-form').classList.remove('active');
    
    // Show new password form
    document.getElementById('new-password-form').classList.add('active');
    
    // Clear and focus the password input
    const passwordInput = document.getElementById('new-password');
    passwordInput.value = '';
    passwordInput.focus();
}

// Handle new password submission
async function handleNewPassword(event) {
    event.preventDefault();
    
    const form = event.target;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }
    
    // Validate password strength
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;
    
    if (!isLongEnough || !hasUppercase || !hasNumber || !hasSpecial) {
        showNotification('Password must have 8+ chars, uppercase, number, and special char', 'error');
        return;
    }
    
    const email = sessionStorage.getItem('resetEmail');
    
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, newPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('Password updated successfully!', 'success');
            
            // Clear session data
            sessionStorage.removeItem('resetEmail');
            
            // Redirect to login
            setTimeout(() => {
                showLogin();
            }, 1500);
        } else {
            showNotification(data.message || 'Failed to update password', 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Password';
        }
    } catch (error) {
        console.error('Reset password error:', error);
        
        // Demo mode
        showNotification('Password updated! (Demo Mode)', 'success');
        
        sessionStorage.removeItem('resetEmail');
        
        setTimeout(() => {
            showLogin();
        }, 1500);
    }
}

// Resend verification code
function resendCode(event) {
    event.preventDefault();
    
    const email = sessionStorage.getItem('resetEmail');
    if (!email) {
        showForgotPassword(event);
        return;
    }
    
    showNotification('Verification code resent!', 'success');
    startResendTimer();
}

// Resend timer
let resendTimer = null;
function startResendTimer() {
    const timerElement = document.getElementById('resend-timer');
    if (!timerElement) return;
    
    let seconds = 60;
    
    // Clear existing timer
    if (resendTimer) {
        clearInterval(resendTimer);
    }
    
    // Disable resend link
    const resendLink = document.querySelector('.resend-code a');
    if (resendLink) resendLink.style.pointerEvents = 'none';
    
    resendTimer = setInterval(() => {
        seconds--;
        
        if (seconds <= 0) {
            clearInterval(resendTimer);
            timerElement.textContent = '';
            if (resendLink) resendLink.style.pointerEvents = 'auto';
        } else {
            timerElement.textContent = `Resend code in ${seconds}s`;
        }
    }, 1000);
}

// ============================================
// FORM VALIDATION FUNCTIONS
// ============================================

function setupFormValidation() {
    // Phone number validation
    const phoneInput = document.getElementById('reg-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', validatePhone);
        phoneInput.addEventListener('blur', validatePhone);
    }
    
    // Password validation
    const passwordInput = document.getElementById('reg-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordStrength);
        passwordInput.addEventListener('blur', validatePassword);
    }
    
    // Confirm password validation
    const confirmInput = document.getElementById('reg-confirm');
    if (confirmInput) {
        confirmInput.addEventListener('input', validatePasswordMatch);
        confirmInput.addEventListener('blur', validatePasswordMatch);
    }
    
    // Email validation (register)
    const regEmailInput = document.getElementById('reg-email');
    if (regEmailInput) {
        regEmailInput.addEventListener('input', validateEmail);
        regEmailInput.addEventListener('blur', validateEmail);
    }
    
    // Login email validation
    const loginEmailInput = document.getElementById('login-email');
    if (loginEmailInput) {
        loginEmailInput.addEventListener('input', validateLoginEmail);
        loginEmailInput.addEventListener('blur', validateLoginEmail);
    }
    
    // Password visibility toggles
    setupPasswordToggles();
    
    // Check for stored failed attempts
    checkAccountLockout();
    
    // Pre-fill remember me if stored
    handleRememberMe();
}

// Login email validation - only gmail.com and outlook.com allowed
function validateLoginEmail(event) {
    const input = event.target;
    const email = input.value.trim().toLowerCase();
    
    // Real-time validation on input
    if (event.type === 'input' && email.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            if (email.endsWith('@gmail.com') || email.endsWith('@outlook.com')) {
                setInputValid(input);
            } else {
                input.classList.remove('valid');
            }
        } else {
            input.classList.remove('valid');
        }
        return;
    }
    
    // Validation on blur
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email.length === 0) {
        clearInputState(input);
        return false;
    }
    
    if (!emailRegex.test(email)) {
        setInputError(input, 'Please enter a valid email address');
        return false;
    }
    
    if (!email.endsWith('@gmail.com') && !email.endsWith('@outlook.com')) {
        setInputError(input, 'Please use Gmail or Outlook email only');
        return false;
    }
    
    setInputValid(input);
    return true;
}

// Handle Remember Me functionality
function handleRememberMe() {
    const rememberCheckbox = document.getElementById('remember-me');
    const savedEmail = localStorage.getItem('rememberedEmail');
    
    if (rememberCheckbox && savedEmail) {
        const emailInput = document.getElementById('login-email');
        if (emailInput) {
            emailInput.value = savedEmail;
            rememberCheckbox.checked = true;
        }
    }
}

// Check account lockout status
function checkAccountLockout() {
    const lockoutUntil = localStorage.getItem('accountLockoutUntil');
    const loginForm = document.getElementById('login-form-element');
    
    if (lockoutUntil && new Date(lockoutUntil) > new Date()) {
        // Account is locked
        if (loginForm) {
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-lock"></i> Account Locked';
            }
        }
        
        const remainingTime = Math.ceil((new Date(lockoutUntil) - new Date()) / 1000 / 60);
        showNotification(`Account locked. Try again in ${remainingTime} minutes.`, 'error');
        return true;
    }
    
    // Clear expired lockout
    localStorage.removeItem('accountLockoutUntil');
    localStorage.removeItem('failedAttempts');
    return false;
}

// Track failed login attempts
function trackFailedAttempt() {
    let attempts = parseInt(localStorage.getItem('failedAttempts') || '0');
    attempts++;
    localStorage.setItem('failedAttempts', attempts.toString());
    
    // Lock after 5 failed attempts
    if (attempts >= 5) {
        const lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        localStorage.setItem('accountLockoutUntil', lockoutUntil.toString());
        localStorage.removeItem('failedAttempts');
        showNotification('Too many failed attempts. Account locked for 15 minutes.', 'error');
        
        const loginForm = document.getElementById('login-form-element');
        if (loginForm) {
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-lock"></i> Account Locked';
            }
        }
        return true;
    }
    
    const remaining = 5 - attempts;
    showNotification(`Invalid credentials. ${remaining} attempts remaining.`, 'error');
    return false;
}

// Phone number validation (multiple countries support)
function validatePhone(event) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    // Country phone patterns (country code + number)
    const countryPatterns = {
        '+254': { name: 'Kenya', pattern: /^\+254\d{9}$/, maxDigits: 12 },        // Kenya
        '+255': { name: 'Tanzania', pattern: /^\+255\d{9}$/, maxDigits: 12 },       // Tanzania
        '+256': { name: 'Uganda', pattern: /^\+256\d{9}$/, maxDigits: 12 },        // Uganda
        '+1': { name: 'US/Canada', pattern: /^\+1\d{10}$/, maxDigits: 12 },        // US/Canada
        '+44': { name: 'UK', pattern: /^\+44\d{10}$/, maxDigits: 13 },             // UK
        '+91': { name: 'India', pattern: /^\+91\d{10}$/, maxDigits: 13 },          // India
        '+49': { name: 'Germany', pattern: /^\+49\d{10,11}$/, maxDigits: 14 },     // Germany
        '+33': { name: 'France', pattern: /^\+33\d{9}$/, maxDigits: 12 },          // France
        '+971': { name: 'UAE', pattern: /^\+971\d{9}$/, maxDigits: 13 },           // UAE
        '+254': { name: 'Kenya', pattern: /^\+254\d{9}$/, maxDigits: 12 }
    };
    
    // Handle input with + prefix
    if (value.length > 0) {
        // Already has + prefix
        if (input.value.startsWith('+')) {
            value = '+' + value.replace(/^\+/, '');
        } else {
            // Add + prefix
            value = '+' + value;
        }
    }
    
    // Detect country code and format
    let formattedValue = value;
    let detectedCountry = null;
    
    for (const [code, info] of Object.entries(countryPatterns)) {
        if (value.startsWith(code)) {
            detectedCountry = info;
            break;
        }
    }
    
    // If country detected, validate and format
    if (detectedCountry) {
        const digitsOnly = value.replace(/\+/g, '');
        
        // Limit to max digits
        const maxDigits = detectedCountry.maxDigits;
        if (digitsOnly.length > maxDigits - 1) { // -1 for + prefix
            const truncated = digitsOnly.substring(0, maxDigits - 1);
            formattedValue = '+' + truncated;
        }
        
        // Check if valid
        if (detectedCountry.pattern.test(formattedValue)) {
            input.value = formattedValue;
            setInputValid(input);
            return;
        } else if (formattedValue.length > 3) {
            input.value = formattedValue;
            setInputError(input, `Invalid ${detectedCountry.name} phone format`);
            return;
        }
    } else {
        // Default to Kenya format if no country code
        if (value.length > 1) {
            // Try to detect if it starts with country code
            if (value.length >= 3) {
                const prefix = value.substring(1, 4);
                if (prefix === '254') {
                    formattedValue = '+' + value.substring(1);
                } else if (value.length > 4) {
                    // Default to Kenya
                    formattedValue = '+254' + value.substring(1);
                }
            }
        }
    }
    
    input.value = formattedValue;
    
    // Show validation state
    if (formattedValue.length >= 13 && /^\+\d{12}$/.test(formattedValue)) {
        setInputValid(input);
    } else if (formattedValue.length > 4) {
        setInputError(input, 'Enter valid phone: +254XXXXXXXXX (Kenya), +255XXXXX (Tanzania), etc.');
    } else if (formattedValue.length > 0) {
        // Still typing
        clearInputState(input);
    } else {
        clearInputState(input);
    }
}

// Password strength validation
function validatePasswordStrength(event) {
    const input = event.target;
    const password = input.value;
    const strength = calculatePasswordStrength(password);
    
    // Update or create strength meter
    let meter = input.parentElement.querySelector('.password-strength');
    if (!meter) {
        meter = createPasswordStrengthMeter();
        input.parentElement.appendChild(meter);
    }
    
    updatePasswordStrengthMeter(meter, strength);
}

function calculatePasswordStrength(password) {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    return score;
}

function createPasswordStrengthMeter() {
    const meter = document.createElement('div');
    meter.className = 'password-strength';
    meter.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill"></div>
        </div>
        <span class="strength-text"></span>
    `;
    return meter;
}

function updatePasswordStrengthMeter(meter, score) {
    const fill = meter.querySelector('.strength-fill');
    const text = meter.querySelector('.strength-text');
    
    let width = (score / 6) * 100;
    let color = '#dc3545';
    let label = 'Weak';
    
    if (score >= 2) { color = '#ffc107'; label = 'Fair'; }
    if (score >= 4) { color = '#28a745'; label = 'Good'; }
    if (score >= 5) { color = '#198754'; label = 'Strong'; }
    
    fill.style.width = width + '%';
    fill.style.backgroundColor = color;
    text.textContent = label;
    text.style.color = color;
}

// Password validation
function validatePassword(event) {
    const input = event.target;
    const password = input.value;
    
    // Strong password: uppercase + number + special char + 8+ chars
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isLongEnough = password.length >= 8;
    
    if (password.length === 0) {
        clearInputState(input);
        return false;
    }
    
    if (!isLongEnough || !hasUppercase || !hasNumber || !hasSpecial) {
        setInputError(input, 'Password must have: 8+ chars, uppercase, number, special char');
        return false;
    }
    
    setInputValid(input);
    return true;
}

// Password match validation
function validatePasswordMatch(event) {
    const input = event.target;
    const confirmPassword = input.value;
    const passwordInput = document.getElementById('reg-password');
    const password = passwordInput?.value;
    
    if (confirmPassword.length === 0) {
        clearInputState(input);
        return false;
    }
    
    if (password && confirmPassword !== password) {
        setInputError(input, 'Passwords do not match');
        return false;
    }
    
    setInputValid(input);
    return true;
}

// Email validation - only gmail.com and outlook.com allowed
function validateEmail(event) {
    const input = event.target;
    const email = input.value.trim().toLowerCase();
    
    // Real-time validation on input
    if (event.type === 'input' && email.length > 0) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(email)) {
            // Check for allowed domains
            if (email.endsWith('@gmail.com') || email.endsWith('@outlook.com')) {
                setInputValid(input);
            } else {
                input.classList.remove('valid');
            }
        } else {
            input.classList.remove('valid');
        }
        return;
    }
    
    // Validation on blur
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email.length === 0) {
        clearInputState(input);
        return false;
    }
    
    if (!emailRegex.test(email)) {
        setInputError(input, 'Please enter a valid email address');
        return false;
    }
    
    // Check for allowed domains
    if (!email.endsWith('@gmail.com') && !email.endsWith('@outlook.com')) {
        setInputError(input, 'Please use Gmail or Outlook email only');
        return false;
    }
    
    setInputValid(input);
    return true;
}

// Password visibility toggle
function setupPasswordToggles() {
    const toggleButtons = document.querySelectorAll('.toggle-password');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
}

// Input sanitization
function sanitizeInput(input) {
    return input.trim().replace(/[<>]/g, '');
}

// Set input error state
function setInputError(input, message) {
    input.classList.remove('valid');
    input.classList.add('error');
    
    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentElement.appendChild(errorDiv);
}

// Set input valid state
function setInputValid(input) {
    input.classList.remove('error');
    input.classList.add('valid');
    
    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
}

// Clear input state
function clearInputState(input) {
    input.classList.remove('error', 'valid');
    
    // Remove existing error message
    const existingError = input.parentElement.querySelector('.error-message');
    if (existingError) existingError.remove();
}