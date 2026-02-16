/**
 * CONFIRMATION.JS
 * The Coconut Saraih Hotel
 * Displays booking confirmation details
 */

document.addEventListener('DOMContentLoaded', function() {
    loadBookingConfirmation();
    animateSuccess();
});

function loadBookingConfirmation() {
    // Get last booking from localStorage
    const bookingData = localStorage.getItem('lastBooking');
    
    if (!bookingData) {
        // No booking found, redirect to home
        window.location.href = 'index.html';
        return;
    }
    
    const booking = JSON.parse(bookingData);
    
    // Display booking ID
    document.getElementById('booking-id').textContent = booking.id;
    
    // Display guest info
    document.getElementById('guest-name').textContent = 
        `${booking.guestInfo.firstName} ${booking.guestInfo.lastName}`;
    document.getElementById('guest-email').textContent = booking.guestInfo.email;
    document.getElementById('guest-phone').textContent = booking.guestInfo.phone;
    
    // Display stay info
    const stayInfoContainer = document.getElementById('stay-info');
    stayInfoContainer.innerHTML = booking.items.map(item => `
        <div class="stay-item">
            <p><strong>${item.name}</strong></p>
            <p>${item.nights || 1} night(s) • ${item.guests || 2} guest(s)</p>
            <p>${formatDate(item.checkIn)} - ${formatDate(item.checkOut)}</p>
        </div>
    `).join('');
    
    // Display payment info
    document.getElementById('conf-subtotal').textContent = booking.payment.subtotal.toFixed(2);
    document.getElementById('conf-tax').textContent = booking.payment.tax.toFixed(2);
    document.getElementById('conf-service').textContent = booking.payment.serviceFee.toFixed(2);
    document.getElementById('conf-total').textContent = booking.payment.total.toFixed(2);
}

function animateSuccess() {
    const checkmark = document.querySelector('.checkmark-circle');
    if (checkmark) {
        setTimeout(() => {
            checkmark.style.transform = 'scale(1.1)';
            setTimeout(() => {
                checkmark.style.transform = 'scale(1)';
            }, 200);
        }, 300);
    }
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function downloadReceipt() {
    // In a real application, this would generate a PDF
    // For now, we'll just trigger print
    window.print();
}

console.log('✅ Confirmation page loaded');
