// ============================================
// The Coconut Grill Hotels - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        
        // Close mobile menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                navLinks.classList.remove('active');
                const icon = menuToggle.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }
    
    // Form submission - Handle contact forms (not newsletter forms)
    const contactForm = document.querySelector('form:not(.newsletter-form)');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your enquiry! We\'ll get back to you shortly.\n\nFor immediate assistance, please call or WhatsApp us at +254 700 000 000');
            e.target.reset();
        });
    }
    
    // ============================================
    // Newsletter Form Handler
    // ============================================
    const newsletterForms = document.querySelectorAll('.newsletter-form');
    
    newsletterForms.forEach(form => {
        // Skip if already initialized
        if (form.dataset.initialized === 'true') return;
        form.dataset.initialized = 'true';
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
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
                const response = await fetch('/api/v1/newsletter', {
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
        });
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const nav = document.querySelector('.navbar') || document.querySelector('.nav-wrapper');
            const navHeight = nav ? nav.offsetHeight : 0;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Hide WhatsApp button when at bottom (to avoid overlapping footer)
    const whatsappBtn = document.querySelector('.whatsapp-float');
    const footer = document.querySelector('footer');
    
    if (whatsappBtn && footer) {
        window.addEventListener('scroll', () => {
            const footerTop = footer.offsetTop;
            const scrollPosition = window.scrollY + window.innerHeight;
            
            if (scrollPosition >= footerTop - 100) {
                whatsappBtn.style.opacity = '0';
                whatsappBtn.style.pointerEvents = 'none';
            } else {
                whatsappBtn.style.opacity = '1';
                whatsappBtn.style.pointerEvents = 'auto';
            }
        });
    }
    
    // Navbar scroll effect
    const navbar = document.querySelector('.navbar') || document.querySelector('.nav-wrapper');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }
    
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements with animation classes
    document.querySelectorAll('.feature-card, .room-card, .review-card, .restaurant-highlight').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // ============================================
    // Dynamic Booking Date Defaults
    // ============================================
    const checkInInput = document.getElementById('check-in');
    const checkOutInput = document.getElementById('check-out');
    
    if (checkInInput && checkOutInput) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Format date as YYYY-MM-DD
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        checkInInput.value = formatDate(today);
        checkOutInput.value = formatDate(tomorrow);
        
        // Set min dates
        checkInInput.min = formatDate(today);
        checkOutInput.min = formatDate(tomorrow);
        
        // Update checkout min when checkin changes
        checkInInput.addEventListener('change', function() {
            const checkInDate = new Date(this.value);
            const checkOutDate = new Date(checkInDate);
            checkOutDate.setDate(checkOutDate.getDate() + 1);
            checkOutInput.min = formatDate(checkOutDate);
            
            if (new Date(checkOutInput.value) <= new Date(this.value)) {
                checkOutInput.value = formatDate(checkOutDate);
            }
        });
    }

    const slides = document.querySelectorAll('.room-slide');
    const track = document.querySelector('.slider-track');
    let index = 0;

    function showSlide(i) {
        track.style.transform = `translateX(-${i * 100}%)`;
    }

    function nextSlide() {
        index = (index + 1) % slides.length;
        showSlide(index);
    }

    function prevSlide() {
        index = (index - 1 + slides.length) % slides.length;
        showSlide(index);
    }

    document.querySelector('.next').addEventListener('click', nextSlide);
    document.querySelector('.prev').addEventListener('click', prevSlide);

    setInterval(nextSlide, 10000);
    
    // Scroll-based Slider with Keyboard & Touch Navigation
    const sliderTrack = document.getElementById('sliderTrack');
    
    function slideLeft() {
        sliderTrack.scrollBy({
            left: -410,
            behavior: 'smooth'
        });
    }
    
    function slideRight() {
        sliderTrack.scrollBy({
            left: 410,
            behavior: 'smooth'
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') slideLeft();
        if (e.key === 'ArrowRight') slideRight();
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    sliderTrack.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    sliderTrack.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        if (touchEndX < touchStartX - 50) slideRight();
        if (touchEndX > touchStartX + 50) slideLeft();
    }
    
    // ============================================
    // Venue Cards Slider (8 second auto-slide)
    // ============================================
    
    const venueCardsTrack = document.getElementById('venueCardsTrack');
    const venueCardsPrev = document.getElementById('venueCardsPrev');
    const venueCardsNext = document.getElementById('venueCardsNext');
    const venueCardsDots = document.getElementById('venueCardsDots');
    
    if (venueCardsTrack && venueCardsPrev && venueCardsNext && venueCardsDots) {
        const venueCards = venueCardsTrack.querySelectorAll('.venue-card');
        let currentVenueCard = 0;
        let venueCardsInterval;
        const cardsToShow = window.innerWidth > 1024 ? 3 : (window.innerWidth > 600 ? 2 : 1);
        const totalCards = venueCards.length;
        
        // Create dots
        const dotsCount = Math.ceil(totalCards / cardsToShow);
        for (let i = 0; i < dotsCount; i++) {
            const dot = document.createElement('div');
            dot.className = 'venue-cards-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => goToVenueCard(i));
            venueCardsDots.appendChild(dot);
        }
        
        const dots = venueCardsDots.querySelectorAll('.venue-cards-dot');
        
        function updateVenueCards() {
            const cardWidth = venueCards[0].offsetWidth + 24; // card width + gap
            venueCardsTrack.style.transform = `translateX(-${currentVenueCard * cardWidth}px)`;
            
            // Update dots
            const activeDot = Math.floor(currentVenueCard / cardsToShow);
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === activeDot);
            });
        }
        
        function goToVenueCard(index) {
            currentVenueCard = index;
            updateVenueCards();
            resetVenueCardsInterval();
        }
        
        function nextVenueCard() {
            const maxIndex = totalCards - cardsToShow;
            currentVenueCard = currentVenueCard < maxIndex ? currentVenueCard + 1 : 0;
            updateVenueCards();
        }
        
        function prevVenueCard() {
            const maxIndex = totalCards - cardsToShow;
            currentVenueCard = currentVenueCard > 0 ? currentVenueCard - 1 : maxIndex;
            updateVenueCards();
        }
        
        function startVenueCardsInterval() {
            venueCardsInterval = setInterval(nextVenueCard, 8000);
        }
        
        function resetVenueCardsInterval() {
            clearInterval(venueCardsInterval);
            startVenueCardsInterval();
        }
        
        // Event listeners
        venueCardsNext.addEventListener('click', () => {
            nextVenueCard();
            resetVenueCardsInterval();
        });
        
        venueCardsPrev.addEventListener('click', () => {
            prevVenueCard();
            resetVenueCardsInterval();
        });
        
        // Touch swipe support
        let venueCardTouchStartX = 0;
        let venueCardTouchEndX = 0;
        
        venueCardsTrack.addEventListener('touchstart', (e) => {
            venueCardTouchStartX = e.changedTouches[0].screenX;
        });
        
        venueCardsTrack.addEventListener('touchend', (e) => {
            venueCardTouchEndX = e.changedTouches[0].screenX;
            if (venueCardTouchEndX < venueCardTouchStartX - 50) nextVenueCard();
            if (venueCardTouchEndX > venueCardTouchStartX + 50) prevVenueCard();
            resetVenueCardsInterval();
        });
        
        // Start auto-slide
        startVenueCardsInterval();
        
        // Update on resize
        window.addEventListener('resize', () => {
            updateVenueCards();
        });
    }
    
    // ============================================
    // Booking Form Handler - Check Availability
    // ============================================
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const checkIn = document.getElementById('check-in').value;
            const checkOut = document.getElementById('check-out').value;
            const rooms = document.getElementById('rooms-count').value;
            const guestsSelect = document.getElementById('guests-count');
            const guestsValue = guestsSelect.value;
            
            // Validate dates
            if (!checkIn || !checkOut) {
                alert('Please select both check-in and check-out dates.');
                return;
            }
            
            const checkInDate = new Date(checkIn);
            const checkOutDate = new Date(checkOut);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (checkInDate < today) {
                alert('Check-in date cannot be in the past.');
                return;
            }
            
            if (checkOutDate <= checkInDate) {
                alert('Check-out date must be after check-in date.');
                return;
            }
            
            // Parse guests (format: "adults,children")
            const [adults, children] = guestsValue.split(',');
            
            // Build query parameters
            const params = new URLSearchParams({
                checkIn: checkIn,
                checkOut: checkOut,
                guests: adults,
                children: children,
                rooms: rooms
            });
            
            // Redirect to rooms page with filters
            window.location.href = 'rooms.html?' + params.toString();
        });
    }
    
    // ============================================
    // URL Parameter Handler for Rooms Page
    // ============================================
    if (window.location.pathname.includes('rooms.html') || window.location.href.includes('rooms.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const checkInParam = urlParams.get('checkIn');
        const checkOutParam = urlParams.get('checkOut');
        const guestsParam = urlParams.get('guests');
        const childrenParam = urlParams.get('children');
        const roomsParam = urlParams.get('rooms');
        
        // Pre-fill booking form if parameters exist
        if (checkInParam) {
            const checkInInput = document.getElementById('check-in');
            if (checkInInput) checkInInput.value = checkInParam;
        }
        if (checkOutParam) {
            const checkOutInput = document.getElementById('check-out');
            if (checkOutInput) checkOutInput.value = checkOutParam;
        }
        if (roomsParam) {
            const roomsSelect = document.getElementById('rooms-count');
            if (roomsSelect) roomsSelect.value = roomsParam;
        }
        if (guestsParam || childrenParam) {
            const guestsSelect = document.getElementById('guests-count');
            if (guestsSelect) {
                const adults = guestsParam || '2';
                const children = childrenParam || '0';
                guestsSelect.value = `${adults},${children}`;
            }
        }
        
        // If we have search parameters, trigger availability check
        if (checkInParam && checkOutParam) {
            // Show filter indicator
            const filterInfo = document.createElement('div');
            filterInfo.className = 'filter-info';
            filterInfo.innerHTML = `
                <span>Showing available rooms for:</span>
                <strong>${new Date(checkInParam).toLocaleDateString()} - ${new Date(checkOutParam).toLocaleDateString()}</strong>
                <span>(${guestsParam || 2} guests${roomsParam ? ', ' + roomsParam + ' room(s)' : ''})</span>
                <a href="rooms.html" class="clear-filters">Clear filters</a>
            `;
            
            const roomsHeader = document.querySelector('.rooms-header');
            if (roomsHeader) {
                roomsHeader.insertAdjacentElement('afterend', filterInfo);
            }
            
            // In a real implementation, you would call the API here:
            // fetch(`/api/v1/rooms?checkIn=${checkInParam}&checkOut=${checkOutParam}&guests=${guestsParam || 2}`)
            //     .then(res => res.json())
            //     .then(data => renderRooms(data));
            
            console.log('Searching for rooms:', { checkIn: checkInParam, checkOut: checkOutParam, guests: guestsParam });
        }
    }
});

// ============================================
// Newsletter Helper Functions
// ============================================

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function getPageSource() {
    const path = window.location.pathname;
    
    if (path.includes('checkout')) return 'checkout';
    if (path.includes('book')) return 'booking';
    return 'website';
}

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