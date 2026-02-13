/**
 * Room Details Loader - The Coconut Saraih Hotel
 * Dynamic room details loading system
 */

document.addEventListener('DOMContentLoaded', function() {
  // Get room ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const roomId = urlParams.get('id') || 'standard-room';

  console.log('Loading room:', roomId);

  // Check if room exists
  if (!roomsData || !roomsData[roomId]) {
    console.error('Room not found:', roomId);
    // Create a default room object to prevent undefined errors
    const defaultRoom = {
      name: "Deluxe Room",
      tagline: "Pool View Luxury",
      category: "Pool View • 32 m² • King Bed with Bathtub",
      heroImage: "assets/images/b2.jpg",
      price: "37",
      priceNote: "per night • 2 Adults max",
      rating: "4.8",
      reviewCount: "3",
      size: "32 m²",
      guests: "2 Adults max",
      bed: "King Size Bed",
      view: "Pool View",
      overview: {
        eyebrow: "Elevate Your Stay",
        headingMain: "Wake Up to",
        headingItalic: "Poolside Paradise",
        lead: "Step into spacious luxury with our Deluxe Room, featuring stunning pool views, a plush king-size bed, and a relaxing bathtub for ultimate unwinding.",
        paragraphs: [
          "The Deluxe Room at The Coconut Saraih redefines comfort with its generous 32 square meters of thoughtfully designed space. Floor-to-ceiling windows frame breathtaking views of the resort's sparkling pool and tropical gardens, creating a serene backdrop for your stay.",
          "The centerpiece of the room is our premium king-size bed, dressed in 400-thread-count Egyptian cotton sheets that promise the deepest sleep. The modern en-suite bathroom is a sanctuary in itself, featuring a rainfall shower, deep soaking bathtub, and premium toiletries from our signature bath collection.",
          "Stay entertained with a 55-inch smart TV offering international channels, or catch up on work at the dedicated workspace with ergonomic chair. The private balcony is the perfect spot for morning coffee or evening cocktails as you watch the sun set over the pool."
        ],
        image: "assets/images/b3.jpg"
      },
      gallery: ["assets/images/b2.jpg", "assets/images/b3.jpg", "assets/images/b4.jpg"],
      amenities: [
        { icon: "fas fa-wifi", title: "High-Speed WiFi", desc: "Free fiber optic connection throughout the room" },
        { icon: "fas fa-tv", title: "55\" Smart TV", desc: "Netflix and international channels available" },
        { icon: "fas fa-snowflake", title: "Air Conditioning", desc: "Quiet inverter system with climate control" },
        { icon: "fas fa-bed", title: "King Size Bed", desc: "Premium Egyptian cotton linens" },
        { icon: "fas fa-bath", title: "Soaking Tub", desc: "Rainfall shower combo with premium toiletries" },
        { icon: "fas fa-minibar", title: "Mini Bar", desc: "Stocked with beverages and snacks" }
      ],
      features: {
        included: ["Daily housekeeping", "Premium bed linens", "Bathrobe & slippers", "Pool & beach access", "Evening turndown service", "Welcome fruit basket"],
        optional: ["Airport transfer - $30", "Spa treatment - 15% off", "Romantic setup - $25", "In-room breakfast - $15"]
      },
      reviews: [
        { stars: 5, text: "Absolutely loved this room! The bathtub was amazing after a long day at the beach. Pool views were perfect.", name: "Emma Thompson", origin: "United Kingdom", date: "January 2025" },
        { stars: 5, text: "Worth every penny. The bed was incredibly comfortable and the room was spotless. Staff were exceptional.", name: "David Park", origin: "South Korea", date: "December 2024" },
        { stars: 4, text: "Beautiful room with great amenities. The only reason for 4 stars is the WiFi was occasionally slow.", name: "Lisa Martin", origin: "Germany", date: "November 2024" }
      ],
      policies: [
        { icon: "fas fa-clock", title: "Check-in", desc: "2:00 PM - Midnight" },
        { icon: "fas fa-sign-out-alt", title: "Check-out", desc: "11:00 AM" },
        { icon: "fas fa-smoking-ban", title: "Non-Smoking", desc: "This is a non-smoking room" },
        { icon: "fas fa-child", title: "Children Welcome", desc: "Children of all ages are welcome" }
      ],
      relatedRooms: [
        { id: "standard-room", name: "Standard Room", price: "$23", image: "assets/images/b1.jpg" },
        { id: "ocean-view-suite", name: "Ocean View Suite", price: "$50", image: "assets/images/a2.jpg" },
        { id: "executive-suite", name: "Executive Suite", price: "$80", image: "assets/images/b4.jpg" }
      ]
    };
    
    // Use default room data
    window.roomsData = window.roomsData || {};
    window.roomsData[roomId] = defaultRoom;
  }

  const room = roomsData[roomId];
  const pageTitle = document.getElementById('page-title');
  const metaDescription = document.querySelector('meta[name="description"]');

  // Update page title
  if (pageTitle) {
    pageTitle.textContent = `${room.name} | The Coconut Saraih`;
  }
  if (metaDescription) {
    metaDescription.content = `Book ${room.name} at The Coconut Saraih. ${room.category}. From $${room.price}/night. ${room.tagline}`;
  }

  // Hero Section
  const heroImage = document.querySelector('.detail-hero-img');
  const breadcrumbCurrent = document.querySelector('.breadcrumb .current');
  const heroCategory = document.querySelector('.detail-hero-category');
  const heroTitle = document.querySelector('.detail-hero-content h1');

  if (heroImage) heroImage.src = room.heroImage;
  if (heroImage) heroImage.alt = `${room.name} at The Coconut Saraih`;
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = room.name;
  if (heroCategory) heroCategory.textContent = room.category;
  
  if (heroTitle) {
    heroTitle.innerHTML = `${room.name || 'Room'}<br><em>${room.tagline || 'Luxury Stay'}</em>`;
  }

  // Update meta pills
  const metaPills = document.querySelector('.hero-meta-pills');
  if (metaPills) {
    const ratingSpan = metaPills.querySelector('#hero-rating');
    const reviewsSpan = metaPills.querySelector('#hero-reviews');
    
    if (ratingSpan) ratingSpan.textContent = room.rating || calculateAverageRating();
    if (reviewsSpan) reviewsSpan.textContent = room.reviewCount || (room.reviews ? room.reviews.length : 0);
    
    // If dynamic elements don't exist, update the entire pills section
    if (!ratingSpan || !reviewsSpan) {
      metaPills.innerHTML = `
        <div class="meta-pill"><i class="fas fa-star"></i> ${room.rating || calculateAverageRating()} · ${room.reviewCount || (room.reviews ? room.reviews.length : 0)} Reviews</div>
        <div class="meta-pill"><i class="fas fa-bed"></i> ${room.bed || 'King Bed'}</div>
        <div class="meta-pill"><i class="fas fa-ruler-combined"></i> ${room.size || '32 m²'}</div>
        <div class="meta-pill"><i class="fas fa-eye"></i> ${room.view || 'Pool View'}</div>
      `;
    }
  }

  // Overview Section
  const overviewEyebrow = document.querySelector('#overview-eyebrow, .eyebrow-text');
  const overviewHeading = document.querySelector('#overview-heading, .overview-text h2');
  const overviewLead = document.querySelector('#overview-lead, .overview-lead');
  const overviewBody = document.querySelector('#overview-body, .overview-body');
  const overviewImage = document.querySelector('#overview-image, .overview-image img');

  const overview = room.overview || {};
  
  if (overviewHeading) {
    overviewHeading.innerHTML = `${overview.headingMain || 'Welcome'}<br><em>${overview.headingItalic || 'to Paradise'}</em>`;
  }
  
  if (overviewLead) overviewLead.textContent = overview.lead || 'Experience luxury at its finest.';
  
  if (overviewBody) {
    const paragraphs = overview.paragraphs || ['Experience luxury at its finest with our thoughtfully designed accommodations.'];
    overviewBody.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
  }
  
  if (overviewImage) {
    overviewImage.src = overview.image || 'assets/images/b3.jpg';
    overviewImage.alt = `${room.name || 'Room'} interior`;
  }

  // Gallery
  const galleryCells = document.querySelectorAll('.gallery-cell img');
  const gallery = room.gallery || ['assets/images/b2.jpg', 'assets/images/b3.jpg', 'assets/images/b4.jpg'];
  if (galleryCells.length > 0) {
    gallery.forEach((img, index) => {
      if (galleryCells[index]) {
        galleryCells[index].src = img;
      }
    });
  }

  // Amenities / Highlights
  const highlightsGrid = document.querySelector('#highlights-grid, .highlights-grid');
  if (highlightsGrid) {
    const amenities = room.amenities || [];
    if (amenities.length > 0) {
      highlightsGrid.innerHTML = amenities.map(a => `
        <div class="highlight-item">
          <div class="highlight-icon"><i class="fas ${a.icon || 'fa-check'}"></i></div>
          <div class="highlight-text">
            <h4>${a.title || 'Amenity'}</h4>
            <p>${a.desc || 'Available'}</p>
          </div>
        </div>
      `).join('');
    } else {
      // Fallback static amenities
      highlightsGrid.innerHTML = `
        <div class="highlight-item">
          <div class="highlight-icon"><i class="fas fa-wifi"></i></div>
          <div class="highlight-text">
            <h4>High-Speed WiFi</h4>
            <p>Free fiber optic connection throughout the room</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-icon"><i class="fas fa-tv"></i></div>
          <div class="highlight-text">
            <h4>55\" Smart TV</h4>
            <p>Netflix and international channels available</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-icon"><i class="fas fa-snowflake"></i></div>
          <div class="highlight-text">
            <h4>Air Conditioning</h4>
            <p>Quiet inverter system with climate control</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-icon"><i class="fas fa-bed"></i></div>
          <div class="highlight-text">
            <h4>King Size Bed</h4>
            <p>Premium Egyptian cotton linens</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-icon"><i class="fas fa-bath"></i></div>
          <div class="highlight-text">
            <h4>Soaking Tub</h4>
            <p>Rainfall shower combo with premium toiletries</p>
          </div>
        </div>
        <div class="highlight-item">
          <div class="highlight-icon"><i class="fas fa-minibar"></i></div>
          <div class="highlight-text">
            <h4>Mini Bar</h4>
            <p>Stocked with beverages and snacks</p>
          </div>
        </div>
      `;
    }
  }

  // Features / Inclusions
  const includedList = document.querySelector('#included-list, .inc-block:first-child .inc-list');
  const notIncludedList = document.querySelector('#not-included-list, .inc-block:last-child .inc-list');
  
  const features = room.features || { included: [], optional: [] };
  
  if (includedList) {
    const included = features.included || [];
    if (included.length > 0) {
      includedList.innerHTML = included.map(i => `
        <li><i class="fas fa-check check"></i>${i}</li>
      `).join('');
    } else {
      includedList.innerHTML = `
        <li><i class="fas fa-check check"></i>Daily housekeeping</li>
        <li><i class="fas fa-check check"></i>Premium bed linens</li>
        <li><i class="fas fa-check check"></i>Bathrobe & slippers</li>
        <li><i class="fas fa-check check"></i>Pool & beach access</li>
        <li><i class="fas fa-check check"></i>Evening turndown service</li>
        <li><i class="fas fa-check check"></i>Welcome fruit basket</li>
      `;
    }
  }
  
  if (notIncludedList) {
    const optional = features.optional || [];
    if (optional.length > 0) {
      notIncludedList.innerHTML = optional.map(i => `
        <li><i class="fas fa-plus cross"></i>${i}</li>
      `).join('');
    } else {
      notIncludedList.innerHTML = `
        <li><i class="fas fa-plus cross"></i>Airport transfer - $30</li>
        <li><i class="fas fa-plus cross"></i>Spa treatment - 15% off</li>
        <li><i class="fas fa-plus cross"></i>Romantic setup - $25</li>
        <li><i class="fas fa-plus cross"></i>In-room breakfast - $15</li>
      `;
    }
  }

  // Calculate average rating from all reviews
  const calculateAverageRating = () => {
    if (!room.reviews || room.reviews.length === 0) return '5.0';
    
    const totalStars = room.reviews.reduce((sum, r) => sum + (r.stars || 5), 0);
    const average = totalStars / room.reviews.length;
    return average.toFixed(1);
  };

  // Reviews
  const ratingNum = document.querySelector('#rating-num, .rating-num');
  const ratingStars = document.querySelector('#rating-stars, .rating-stars');
  const ratingCount = document.querySelector('#rating-count, .rating-count');
  const reviewCards = document.querySelector('#review-cards, .review-cards');

  if (ratingNum) ratingNum.textContent = calculateAverageRating();

  if (ratingStars && room.reviews && room.reviews.length > 0) {
    const stars = parseFloat(calculateAverageRating());
    const fullStars = Math.floor(stars);
    const hasHalf = stars % 1 >= 0.5;
    let starsHtml = '';
    for (let i = 0; i < fullStars; i++) starsHtml += '<i class="fas fa-star"></i>';
    if (hasHalf) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    for (let i = fullStars + (hasHalf ? 1 : 0); i < 5; i++) starsHtml += '<i class="far fa-star"></i>';
    ratingStars.innerHTML = starsHtml;
  }

  if (ratingCount) {
    const totalReviews = room.reviews ? room.reviews.length : 0;
    ratingCount.textContent = `Based on ${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;
  }

  if (reviewCards && room.reviews) {
    reviewCards.innerHTML = room.reviews.map(r => `
      <div class="review-card">
        <div class="review-stars">
          ${'<i class="fas fa-star"></i>'.repeat(Math.floor(r.stars || 5))}
          ${(r.stars || 5) % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
        </div>
        <p class="review-text">${r.text || 'No review text available'}</p>
        <div class="reviewer">
          <div class="reviewer-avatar">${(r.name || 'G').charAt(0).toUpperCase()}</div>
          <div>
            <div class="reviewer-name">${r.name || 'Guest'}</div>
            <div class="reviewer-origin">${r.origin || 'Location not specified'}</div>
          </div>
          <div class="reviewer-date">${r.date || 'Recently'}</div>
        </div>
      </div>
    `).join('');
  }

  // Policies / Timeline
  const timeline = document.querySelector('#timeline, .timeline');
  if (timeline) {
    const policies = room.policies || [];
    if (policies.length > 0) {
      timeline.innerHTML = policies.map(p => `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-time"><i class="fas ${p.icon || 'fa-clock'}"></i></div>
          <div class="timeline-title">${p.title || 'Policy'}</div>
          <div class="timeline-desc">${p.description || 'Contact us for details'}</div>
        </div>
      `).join('');
    } else {
      // Default policies
      timeline.innerHTML = `
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-time"><i class="fas fa-clock"></i></div>
          <div class="timeline-title">Check-in</div>
          <div class="timeline-desc">Flexible check-in from 2:00 PM onwards. Early check-in available on request.</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-time"><i class="fas fa-sign-out-alt"></i></div>
          <div class="timeline-title">Check-out</div>
          <div class="timeline-desc">Late checkout available until 2:00 PM (subject to availability).</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-time"><i class="fas fa-smoking-ban"></i></div>
          <div class="timeline-title">Non-Smoking</div>
          <div class="timeline-desc">This is a non-smoking room. Smoking is allowed in designated areas.</div>
        </div>
        <div class="timeline-item">
          <div class="timeline-dot"></div>
          <div class="timeline-time"><i class="fas fa-child"></i></div>
          <div class="timeline-title">Children Welcome</div>
          <div class="timeline-desc">Children of all ages are welcome. Cots available upon request.</div>
        </div>
      `;
    }
  }

  // Related Rooms
  const relatedGrid = document.querySelector('#related-grid, .related-grid');
  if (relatedGrid) {
    const relatedRooms = room.relatedRooms || [];
    if (relatedRooms.length > 0) {
      relatedGrid.innerHTML = relatedRooms.map(r => `
        <a href="room-details.html?id=${r.id}" class="related-card">
          <img src="${r.image || 'assets/images/b1.jpg'}" alt="${r.name || 'Room'}">
          <div class="related-card-body">
            <div class="related-tag">${r.category || 'Standard'}</div>
            <div class="related-name">${r.name || 'Room'}</div>
            <div class="related-price">From <strong>${r.price || '0'}</strong></div>
          </div>
        </a>
      `).join('');
    } else {
      // Default related rooms
      relatedGrid.innerHTML = `
        <a href="room-details.html?id=standard-room" class="related-card">
          <img src="assets/images/b1.jpg" alt="Standard Room">
          <div class="related-card-body">
            <div class="related-tag">Beach View</div>
            <div class="related-name">Standard Room</div>
            <div class="related-price">From <strong>$23</strong></div>
          </div>
        </a>
        <a href="room-details.html?id=ocean-view-suite" class="related-card">
          <img src="assets/images/a2.jpg" alt="Ocean View Suite">
          <div class="related-card-body">
            <div class="related-tag">Ocean View</div>
            <div class="related-name">Ocean View Suite</div>
            <div class="related-price">From <strong>$50</strong></div>
          </div>
        </a>
        <a href="room-details.html?id=executive-suite" class="related-card">
          <img src="assets/images/b4.jpg" alt="Executive Suite">
          <div class="related-card-body">
            <div class="related-tag">Luxury</div>
            <div class="related-name">Executive Suite</div>
            <div class="related-price">From <strong>$80</strong></div>
          </div>
        </a>
      `;
    }
  }

  // Booking Sidebar
  const bookingPrice = document.querySelector('.booking-price');
  const bookingMeta = document.querySelector('.booking-meta');

  if (bookingPrice) {
    bookingPrice.innerHTML = `
      ${room.price || '37'}
      <span>${room.priceNote || 'per night • 2 Adults max'}</span>
    `;
  }

  if (bookingMeta) {
    bookingMeta.innerHTML = `
      <div class="bm-row">
        <span class="bm-label"><i class="fas fa-ruler-combined"></i> Size</span>
        <span class="bm-value">${room.size || '32 m²'}</span>
      </div>
      <div class="bm-row">
        <span class="bm-label"><i class="fas fa-user-friends"></i> Guests</span>
        <span class="bm-value">${room.guests || '2 Adults max'}</span>
      </div>
      <div class="bm-row">
        <span class="bm-label"><i class="fas fa-bed"></i> Bed</span>
        <span class="bm-value">${room.bed || 'King Size Bed'}</span>
      </div>
      <div class="bm-row">
        <span class="bm-label"><i class="fas fa-eye"></i> View</span>
        <span class="bm-value">${room.view || 'Pool View'}</span>
      </div>
    `;
  }

  console.log('Room loaded successfully:', room.name);
});
