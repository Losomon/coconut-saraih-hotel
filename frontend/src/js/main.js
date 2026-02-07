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
                const navHeight = document.querySelector('.nav-wrapper').offsetHeight;
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
    const navWrapper = document.querySelector('.nav-wrapper');
    if (navWrapper) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navWrapper.style.background = 'rgba(255, 255, 255, 0.98)';
                navWrapper.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navWrapper.style.background = 'rgba(255, 255, 255, 0.98)';
                navWrapper.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.08)';
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
});
