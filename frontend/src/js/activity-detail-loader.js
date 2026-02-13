/**
 * Activity Detail Loader
 * Dynamically loads activity content based on URL parameter
 */

(function() {
  'use strict';

  // Get activity ID from URL parameter
  function getActivityId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || 'dhow-sailing'; // Default to dhow-sailing
  }

  // Generate star icons based on rating
  function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
  }

  // Load and populate activity data
  function loadActivityData() {
    const activityId = getActivityId();
    
    // If it's dhow-sailing, keep the static HTML content (don't load dynamic data)
    if (activityId === 'dhow-sailing') {
      console.log('Using static content for dhow-sailing');
      return; // Exit early, keep the static HTML
    }
    
    const activity = activitiesData[activityId];

    if (!activity) {
      console.error('Activity not found:', activityId);
      // Redirect to activities page if activity doesn't exist
      window.location.href = 'activities.html';
      return;
    }

    // Update page title
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
      pageTitle.textContent = `${activity.title} ${activity.titleItalic} | The Coconut Saraih`;
    }
    
    // Update breadcrumb
    const breadcrumbCurrent = document.getElementById('breadcrumb-current');
    if (breadcrumbCurrent) {
      breadcrumbCurrent.textContent = `${activity.title} ${activity.titleItalic}`;
    }

    // Update hero section
    const heroImage = document.getElementById('hero-image');
    if (heroImage) {
      heroImage.src = activity.heroImage;
      heroImage.alt = `${activity.title} ${activity.titleItalic}`;
    }
    
    const heroCategory = document.getElementById('hero-category');
    if (heroCategory) {
      heroCategory.textContent = activity.category;
    }
    
    const heroTitleMain = document.getElementById('hero-title-main');
    if (heroTitleMain) {
      heroTitleMain.textContent = activity.title;
    }
    
    const heroTitleItalic = document.getElementById('hero-title-italic');
    if (heroTitleItalic) {
      heroTitleItalic.textContent = activity.titleItalic;
    }

    // Update hero meta pills
    const heroMeta = document.getElementById('hero-meta');
    if (heroMeta) {
      heroMeta.innerHTML = `
        <div class="meta-pill"><i class="fas fa-clock"></i> ${activity.duration}</div>
        <div class="meta-pill"><i class="fas fa-users"></i> ${activity.groupSize}</div>
        <div class="meta-pill"><i class="fas fa-sun"></i> ${activity.timing}</div>
        <div class="meta-pill"><i class="fas fa-star"></i> ${activity.rating} · ${activity.reviewCount} Reviews</div>
      `;
    }

    // Update overview section
    const overviewEyebrow = document.getElementById('overview-eyebrow');
    if (overviewEyebrow) {
      overviewEyebrow.textContent = activity.overview.eyebrow;
    }
    
    const overviewHeadingMain = document.getElementById('overview-heading-main');
    if (overviewHeadingMain) {
      overviewHeadingMain.textContent = activity.overview.heading;
    }
    
    const overviewHeadingItalic = document.getElementById('overview-heading-italic');
    if (overviewHeadingItalic) {
      overviewHeadingItalic.textContent = activity.overview.headingItalic;
    }
    
    const overviewLead = document.getElementById('overview-lead');
    if (overviewLead) {
      overviewLead.textContent = activity.overview.lead;
    }
    
    // Add overview paragraphs
    const overviewBody = document.getElementById('overview-body');
    if (overviewBody) {
      overviewBody.innerHTML = '';
      if (activity.overview.paragraphs) {
        activity.overview.paragraphs.forEach(para => {
          const p = document.createElement('p');
          p.textContent = para;
          overviewBody.appendChild(p);
        });
      }
    }
    
    const overviewImage = document.getElementById('overview-image');
    if (overviewImage) {
      overviewImage.src = activity.overview.image;
      overviewImage.alt = `${activity.title} ${activity.titleItalic}`;
    }

    // Update gallery
    const gallery = document.getElementById('gallery');
    if (gallery) {
      gallery.innerHTML = '';
      if (activity.gallery) {
        activity.gallery.forEach(imageSrc => {
          const div = document.createElement('div');
          div.className = 'gallery-cell';
          div.innerHTML = `<img src="${imageSrc}" alt="${activity.title}">`;
          gallery.appendChild(div);
        });
      }
    }

    // Update highlights
    const highlightsGrid = document.getElementById('highlights-grid');
    if (highlightsGrid) {
      highlightsGrid.innerHTML = '';
      if (activity.highlights) {
        activity.highlights.forEach(highlight => {
          const div = document.createElement('div');
          div.className = 'highlight-item';
          div.innerHTML = `
            <div class="highlight-icon"><i class="fas ${highlight.icon}"></i></div>
            <div class="highlight-text">
              <h4>${highlight.title}</h4>
              <p>${highlight.description}</p>
            </div>
          `;
          highlightsGrid.appendChild(div);
        });
      }
    }

    // Update included/not included lists
    const includedList = document.getElementById('included-list');
    if (includedList) {
      includedList.innerHTML = '';
      if (activity.included) {
        activity.included.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<i class="fas fa-check check"></i>${item}`;
          includedList.appendChild(li);
        });
      }
    }

    const notIncludedList = document.getElementById('not-included-list');
    if (notIncludedList) {
      notIncludedList.innerHTML = '';
      if (activity.notIncluded) {
        activity.notIncluded.forEach(item => {
          const li = document.createElement('li');
          li.innerHTML = `<i class="fas fa-times cross"></i>${item}`;
          notIncludedList.appendChild(li);
        });
      }
    }

    // Update itinerary
    const timeline = document.getElementById('timeline');
    if (timeline) {
      timeline.innerHTML = '';
      if (activity.itinerary) {
        activity.itinerary.forEach(item => {
          const div = document.createElement('div');
          div.className = 'timeline-item';
          div.innerHTML = `
            <div class="timeline-dot"></div>
            <div class="timeline-time">${item.time}</div>
            <div class="timeline-title">${item.title}</div>
            <div class="timeline-desc">${item.description}</div>
          `;
          timeline.appendChild(div);
        });
      }
    }

    // Update reviews section
    const ratingNum = document.getElementById('rating-num');
    if (ratingNum) {
      ratingNum.textContent = activity.rating;
    }
    
    const ratingStars = document.getElementById('rating-stars');
    if (ratingStars) {
      ratingStars.innerHTML = generateStars(parseFloat(activity.rating));
    }
    
    const ratingCount = document.getElementById('rating-count');
    if (ratingCount) {
      ratingCount.textContent = `Based on ${activity.reviewCount} reviews`;
    }

    const reviewCards = document.getElementById('review-cards');
    if (reviewCards) {
      reviewCards.innerHTML = '';
      if (activity.reviews) {
        activity.reviews.forEach(review => {
          const div = document.createElement('div');
          div.className = 'review-card';
          div.innerHTML = `
            <div class="review-stars">${generateStars(review.stars)}</div>
            <p class="review-text">${review.text}</p>
            <div class="reviewer">
              <div class="reviewer-avatar">${review.avatar}</div>
              <div>
                <div class="reviewer-name">${review.name}</div>
                <div class="reviewer-origin">${review.location}</div>
              </div>
              <div class="reviewer-date">${review.date}</div>
            </div>
          `;
          reviewCards.appendChild(div);
        });
      }
    }

    // Update booking card
    const bookingPrice = document.getElementById('booking-price');
    if (bookingPrice) {
      bookingPrice.textContent = activity.price;
    }
    
    const bookingPriceNote = document.getElementById('booking-price-note');
    if (bookingPriceNote) {
      bookingPriceNote.textContent = activity.priceNote;
    }

    const bookingMeta = document.getElementById('booking-meta');
    if (bookingMeta && activity.bookingMeta) {
      bookingMeta.innerHTML = `
        <div class="bm-row">
          <span class="bm-label"><i class="fas fa-clock"></i> Duration</span>
          <span class="bm-value">${activity.bookingMeta.duration}</span>
        </div>
        <div class="bm-row">
          <span class="bm-label"><i class="fas fa-users"></i> Group Size</span>
          <span class="bm-value">${activity.bookingMeta.groupSize}</span>
        </div>
        <div class="bm-row">
          <span class="bm-label"><i class="fas fa-sun"></i> Departure</span>
          <span class="bm-value">${activity.bookingMeta.departure}</span>
        </div>
        <div class="bm-row">
          <span class="bm-label"><i class="fas fa-map-marker-alt"></i> Meeting Point</span>
          <span class="bm-value">${activity.bookingMeta.meetingPoint}</span>
        </div>
        <div class="bm-row">
          <span class="bm-label"><i class="fas fa-language"></i> Language</span>
          <span class="bm-value">${activity.bookingMeta.language}</span>
        </div>
      `;
    }

    // Update good to know section
    const goodToKnowList = document.getElementById('good-to-know-list');
    if (goodToKnowList) {
      goodToKnowList.innerHTML = '';
      if (activity.goodToKnow) {
        activity.goodToKnow.forEach(item => {
          const div = document.createElement('div');
          div.className = 'sic-item';
          div.innerHTML = `<i class="fas ${item.icon}"></i> ${item.text}`;
          goodToKnowList.appendChild(div);
        });
      }
    }

    // Update related activities
    const relatedGrid = document.getElementById('related-grid');
    if (relatedGrid) {
      relatedGrid.innerHTML = '';
      if (activity.relatedActivities) {
        activity.relatedActivities.forEach(related => {
          const a = document.createElement('a');
          a.href = `activity-detail.html?id=${related.id}`;
          a.className = 'related-card';
          a.innerHTML = `
            <img src="${related.image}" alt="${related.name}">
            <div class="related-card-body">
              <div class="related-tag">${related.tag}</div>
              <div class="related-name">${related.name}</div>
              <div class="related-price">From <strong>KShs ${related.price}</strong></div>
            </div>
          `;
          relatedGrid.appendChild(a);
        });
      }
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadActivityData);
  } else {
    loadActivityData();
  }

  // Booking form submit handler
  window.addEventListener('load', function() {
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('.booking-btn');
        btn.textContent = '✓ Request Received';
        btn.style.background = '#3a7a3a';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.textContent = 'Reserve Now →';
          btn.style.background = '';
          btn.style.color = '';
        }, 4000);
      });
    }

    // Save button toggle
    const saveBtn = document.querySelector('.sidebar-action-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        const icon = this.querySelector('i');
        if (icon) {
          if (icon.classList.contains('far')) {
            icon.classList.replace('far', 'fas');
            this.style.color = 'var(--gold)';
            this.style.borderColor = 'var(--gold)';
          } else {
            icon.classList.replace('fas', 'far');
            this.style.color = '';
            this.style.borderColor = '';
          }
        }
      });
    }

    // Intersection observer for timeline animations
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
      const io = new IntersectionObserver(entries => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            entry.target.style.animationDelay = (i * 0.1) + 's';
            entry.target.style.animation = 'fadeUp 0.5s both ease-out';
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      timelineItems.forEach(el => io.observe(el));
    }
  });

})();
