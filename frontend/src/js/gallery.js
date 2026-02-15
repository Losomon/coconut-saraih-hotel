// Gallery JavaScript
// Handles dynamic image loading, filtering, and lightbox functionality

// Gallery Images Data - All available hotel images
const galleryImages = [
    // Rooms
    {
        src: 'assets/images/b1.jpg',
        category: 'rooms',
        title: 'Standard Room',
        description: 'Cozy and comfortable with all essentials'
    },
    {
        src: 'assets/images/b2.jpg',
        category: 'rooms',
        title: 'Deluxe Room',
        description: 'Spacious luxury with modern furnishings'
    },
    {
        src: 'assets/images/b3.jpg',
        category: 'rooms',
        title: 'Family Suite',
        description: 'Perfect for families with generous space'
    },
    {
        src: 'assets/images/b4.jpg',
        category: 'rooms',
        title: 'Executive Suite',
        description: 'Sophisticated luxury for executives'
    },
    {
        src: 'assets/images/b5.jpg',
        category: 'rooms',
        title: 'Presidential Villa',
        description: 'Ultimate luxury coastal living'
    },
    {
        src: 'assets/images/room-a.jpg',
        category: 'rooms',
        title: 'Luxury Accommodation',
        description: 'Premium room with ocean views'
    },
    // Dining
    {
        src: 'assets/images/dining1.jpg',
        category: 'dining',
        title: 'Fine Dining',
        description: 'Exquisite culinary experiences'
    },
    {
        src: 'assets/images/dining2.jpg',
        category: 'dining',
        title: 'Beachside Dining',
        description: 'Dining with ocean views'
    },
    {
        src: 'assets/images/dining3.jpg',
        category: 'dining',
        title: 'Gourmet Cuisine',
        description: 'Seasonal and regional specialties'
    },
    {
        src: 'assets/images/menu1.jpg',
        category: 'dining',
        title: 'Restaurant Menu',
        description: 'Curated culinary experiences'
    },
    {
        src: 'assets/images/menu2.jpg',
        category: 'dining',
        title: 'Signature Dishes',
        description: 'Chef\'s special creations'
    },
    // Facilities
    {
        src: 'assets/images/a1.jpg',
        category: 'facilities',
        title: 'Hotel Exterior',
        description: 'Beautiful tropical architecture'
    },
    {
        src: 'assets/images/a2.jpg',
        category: 'facilities',
        title: 'Lobby Area',
        description: 'Warm and welcoming entrance'
    },
    {
        src: 'assets/images/a3.jpg',
        category: 'facilities',
        title: 'Pool Area',
        description: 'Refreshing relaxation spot'
    },
    {
        src: 'assets/images/a4.jpg',
        category: 'facilities',
        title: 'Beach View',
        description: 'Stunning coastal panorama'
    },
    // Activities
    {
        src: 'assets/images/exp1.jpg',
        category: 'activities',
        title: 'Beach Activities',
        description: 'Adventure awaits'
    },
    {
        src: 'assets/images/exp2.jpg',
        category: 'activities',
        title: 'Water Sports',
        description: 'Exciting ocean adventures'
    },
    // Events
    {
        src: 'assets/images/events (1).jpg',
        category: 'events',
        title: 'Event Space',
        description: 'Perfect for celebrations'
    },
    {
        src: 'assets/images/events (2).jpg',
        category: 'events',
        title: 'Wedding Setup',
        description: 'Magical wedding venues'
    },
    {
        src: 'assets/images/events (3).jpg',
        category: 'events',
        title: 'Conference Room',
        description: 'Modern meeting facilities'
    },
    {
        src: 'assets/images/events (4).jpg',
        category: 'events',
        title: 'Private Dining',
        description: 'Intimate gatherings'
    },
    {
        src: 'assets/images/events (5).jpg',
        category: 'events',
        title: 'Event Decor',
        description: 'Elegant arrangements'
    },
    {
        src: 'assets/images/events (7).jpg',
        category: 'events',
        title: 'Meeting Space',
        description: 'Professional settings'
    },
    // Spa
    {
        src: 'assets/images/spa (1).jpg',
        category: 'spa',
        title: 'Spa Reception',
        description: 'Tranquil entrance'
    },
    {
        src: 'assets/images/spa (2).jpg',
        category: 'spa',
        title: 'Treatment Room',
        description: 'Relaxation sanctuary'
    },
    {
        src: 'assets/images/spa (3).jpg',
        category: 'spa',
        title: 'Massage Therapy',
        description: 'Rejuvenating treatments'
    },
    {
        src: 'assets/images/spa (4).jpg',
        category: 'spa',
        title: 'Spa Facilities',
        description: 'Wellness amenities'
    },
    {
        src: 'assets/images/spa (5).jpg',
        category: 'spa',
        title: 'Beauty Treatments',
        description: 'Pampering experiences'
    },
    {
        src: 'assets/images/spa (6).jpg',
        category: 'spa',
        title: 'Spa Pool',
        description: 'Healing waters'
    },
    {
        src: 'assets/images/spa (7).jpg',
        category: 'spa',
        title: 'Relaxation Area',
        description: 'Peaceful retreat'
    },
    {
        src: 'assets/images/spa (8).jpg',
        category: 'spa',
        title: 'Wellness Center',
        description: 'Complete rejuvenation'
    },
    {
        src: 'assets/images/spa (9).jpg',
        category: 'spa',
        title: 'Spa Garden',
        description: 'Natural serenity'
    },
    // Restaurant & Bars
    {
        src: 'assets/images/restaurant-bar (1).jpg',
        category: 'dining',
        title: 'Main Restaurant',
        description: 'Elegant dining venue'
    },
    {
        src: 'assets/images/restaurant-bar (2).jpg',
        category: 'dining',
        title: 'Beach Bar',
        description: 'Tropical cocktails'
    },
    {
        src: 'assets/images/restaurant-bar (3).jpg',
        category: 'dining',
        title: 'Pool Bar',
        description: 'Refreshing drinks'
    },
    {
        src: 'assets/images/restaurant-bar (4).jpg',
        category: 'dining',
        title: 'Bar Interior',
        description: 'Cozy atmosphere'
    },
    {
        src: 'assets/images/restaurant-bar (5).jpg',
        category: 'dining',
        title: 'Signature Drinks',
        description: 'Crafted cocktails'
    },
    {
        src: 'assets/images/restaurant-bar (6).jpg',
        category: 'dining',
        title: 'Lounge Area',
        description: 'Relax and unwind'
    },
    {
        src: 'assets/images/restaurant-bar (7).jpg',
        category: 'dining',
        title: 'Outdoor Seating',
        description: 'Al fresco dining'
    },
    {
        src: 'assets/images/restaurant-bar (8).jpg',
        category: 'dining',
        title: 'Evening Ambiance',
        description: 'Romantic setting'
    },
    {
        src: 'assets/images/restaurant-bar (9).jpg',
        category: 'dining',
        title: 'Sunset Views',
        description: 'Breathtaking evenings'
    },
    {
        src: 'assets/images/restaurant-bar (10).jpg',
        category: 'dining',
        title: 'Dining Experience',
        description: 'Memorable meals'
    },
    {
        src: 'assets/images/restaurant-bar (11).jpg',
        category: 'dining',
        title: 'Wine Selection',
        description: 'Premium wines'
    },
    {
        src: 'assets/images/restaurant-bar (12).jpg',
        category: 'dining',
        title: 'Chef\'s Table',
        description: 'Exclusive dining'
    },
    // Local Activities
    {
        src: 'assets/images/local-activities (1).jpg',
        category: 'activities',
        title: 'Local Excursions',
        description: 'Explore the area'
    },
    {
        src: 'assets/images/local-activities (2).jpg',
        category: 'activities',
        title: 'Beach Walks',
        description: 'Scenic coastline'
    },
    {
        src: 'assets/images/local-activities (3).jpg',
        category: 'activities',
        title: 'Cultural Tours',
        description: 'Local heritage'
    },
    {
        src: 'assets/images/local-activities (4).jpg',
        category: 'activities',
        title: 'Nature Walks',
        description: 'Lush surroundings'
    },
    {
        src: 'assets/images/local-activities (5).jpg',
        category: 'activities',
        title: 'Sunset Cruises',
        description: 'Golden hour magic'
    },
    {
        src: 'assets/images/local-activities (6).jpg',
        category: 'activities',
        title: 'Fishing Trips',
        description: 'Adventure on water'
    },
    {
        src: 'assets/images/local-activities (7).jpg',
        category: 'activities',
        title: 'Diving',
        description: 'Underwater exploration'
    },
    {
        src: 'assets/images/local-activities (8).jpg',
        category: 'activities',
        title: 'Snorkeling',
        description: 'Marine life discovery'
    },
    // Gallery Featured (from index)
    {
        src: 'assets/images/gallery1.jpg',
        category: 'facilities',
        title: 'Beachfront Paradise',
        description: 'Stunning ocean views'
    },
    {
        src: 'assets/images/gallery2.jpg',
        category: 'rooms',
        title: 'Luxury Suites',
        description: 'Comfort & elegance'
    },
    {
        src: 'assets/images/gallery3.jpg',
        category: 'facilities',
        title: 'Elegant Architecture',
        description: 'Modern tropical design'
    },
    {
        src: 'assets/images/gallery4.jpg',
        category: 'facilities',
        title: 'Infinity Pool',
        description: 'Refreshing retreat'
    },
    {
        src: 'assets/images/gallery5.jpg',
        category: 'dining',
        title: 'Fine Dining',
        description: 'Culinary excellence'
    },
    {
        src: 'assets/images/gallery6.jpg',
        category: 'spa',
        title: 'Spa & Wellness',
        description: 'Ultimate relaxation'
    },
    {
        src: 'assets/images/gallery7.jpg',
        category: 'activities',
        title: 'Beach Activities',
        description: 'Adventure awaits'
    },
    {
        src: 'assets/images/gallery8.jpg',
        category: 'facilities',
        title: 'Magical Sunsets',
        description: 'Unforgettable moments'
    }
];

// State
let currentFilter = 'all';
let visibleImages = [];
let imagesPerPage = 16;
let currentImageIndex = 0;

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const filterButtons = document.querySelectorAll('.filter-btn');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxDescription = document.getElementById('lightboxDescription');
const lightboxCurrent = document.getElementById('lightboxCurrent');
const lightboxTotal = document.getElementById('lightboxTotal');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

// Initialize Gallery
function initGallery() {
    filterImages();
    setupEventListeners();
}

// Filter Images by Category
function filterImages() {
    if (currentFilter === 'all') {
        visibleImages = [...galleryImages];
    } else {
        visibleImages = galleryImages.filter(img => img.category === currentFilter);
    }
    renderGallery();
}

// Render Gallery Grid
function renderGallery() {
    const imagesToShow = visibleImages.slice(0, imagesPerPage);
    
    galleryGrid.innerHTML = imagesToShow.map((img, index) => `
        <div class="gallery-page-item" data-index="${index}" onclick="openLightbox(${index})">
            <img src="${img.src}" alt="${img.title}" loading="lazy">
            <div class="gallery-page-overlay">
                <div class="gallery-page-content">
                    <span class="gallery-page-icon"><i class="fas fa-expand"></i></span>
                    <h3>${img.title}</h3>
                    <p>${img.description}</p>
                </div>
            </div>
        </div>
    `).join('');

    // Show/hide load more button
    if (visibleImages.length > imagesPerPage) {
        loadMoreBtn.style.display = 'inline-block';
    } else {
        loadMoreBtn.style.display = 'none';
    }
}

// Load More Images
function loadMore() {
    imagesPerPage += 16;
    renderGallery();
}

// Setup Event Listeners
function setupEventListeners() {
    // Filter buttons
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            imagesPerPage = 16;
            filterImages();
        });
    });

    // Load more button
    loadMoreBtn.addEventListener('click', loadMore);

    // Lightbox controls
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));

    // Close lightbox on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });
}

// Open Lightbox
function openLightbox(index) {
    currentImageIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close Lightbox
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Navigate Lightbox
function navigateLightbox(direction) {
    currentImageIndex += direction;
    
    // Wrap around
    if (currentImageIndex < 0) {
        currentImageIndex = visibleImages.length - 1;
    } else if (currentImageIndex >= visibleImages.length) {
        currentImageIndex = 0;
    }
    
    updateLightbox();
}

// Update Lightbox Content
function updateLightbox() {
    const img = visibleImages[currentImageIndex];
    lightboxImage.src = img.src;
    lightboxImage.alt = img.title;
    lightboxTitle.textContent = img.title;
    lightboxDescription.textContent = img.description;
    lightboxCurrent.textContent = currentImageIndex + 1;
    lightboxTotal.textContent = visibleImages.length;
}

// Make functions globally available
window.openLightbox = openLightbox;
window.navigateLightbox = navigateLightbox;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initGallery);
