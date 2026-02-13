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
    
    // Form submission
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for your enquiry! We\'ll get back to you shortly.\n\nFor immediate assistance, please call or WhatsApp us at +254 700 000 000');
            e.target.reset();
        });
    }
    
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
});