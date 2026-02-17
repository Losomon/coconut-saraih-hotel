/**
 * NEWS.JS - News Page Functionality
 * The Coconut Saraih Hotel
 */

// Sample news data (in production, this would come from an API)
const newsData = [
    {
        id: 1,
        title: "Exclusive Valentine's Day Package at Coconut Saraih",
        excerpt: "Celebrate love with our romantic Valentine's Day package including sunset dinner, spa treatment, and luxury ocean view accommodation.",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
        date: "February 15, 2026",
        category: "Special Offer",
        featured: true
    },
    {
        id: 2,
        title: "New Ocean View Suites Now Available",
        excerpt: "Experience luxury like never before with our newly renovated ocean view suites featuring private balconies.",
        image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400",
        date: "February 10, 2026",
        category: "Accommodation"
    },
    {
        id: 3,
        title: "Live Jazz Nights Every Friday",
        excerpt: "Enjoy soulful jazz performances by local artists every Friday evening at our beachside bar.",
        image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
        date: "February 5, 2026",
        category: "Entertainment"
    },
    {
        id: 4,
        title: "Wellness Month Special Discounts",
        excerpt: "Start the year right with our exclusive wellness package including spa treatments and yoga sessions.",
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400",
        date: "January 28, 2026",
        category: "Special Offer"
    },
    {
        id: 5,
        title: "Beach Wedding Packages 2026",
        excerpt: "Make your special day unforgettable with our stunning beach wedding venues and comprehensive packages.",
        image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
        date: "January 20, 2026",
        category: "Events"
    },
    {
        id: 6,
        title: "New Executive Chef Joins Our Team",
        excerpt: "We are thrilled to announce our new executive chef bringing innovative coastal cuisine to our restaurants.",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
        date: "January 15, 2026",
        category: "Dining"
    },
    {
        id: 7,
        title: "Sustainable Tourism Certification",
        excerpt: "Coconut Saraih Hotel receives recognition for our commitment to sustainable and eco-friendly practices.",
        image: "https://images.unsplash.com/photo-1499364615650-ec38552f4f34?w=400",
        date: "January 10, 2026",
        category: "Sustainability"
    },
    {
        id: 8,
        title: "New Year's Eve Gala Dinner",
        excerpt: "Ring in the new year with our spectacular gala dinner featuring live entertainment and fireworks.",
        image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400",
        date: "January 5, 2026",
        category: "Events"
    },
    {
        id: 9,
        title: "Kids Eat Free Promotion",
        excerpt: "Bring the whole family and enjoy complimentary meals for children under 12 at our restaurant.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
        date: "January 1, 2026",
        category: "Special Offer"
    }
];

// State
let displayedNews = 6;
const newsPerLoad = 3;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadMoreNews();
    setupLoadMoreButton();
});

// Load more news
function loadMoreNews() {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    const newsToShow = newsData.filter(news => !news.featured).slice(0, displayedNews);
    
    // Clear existing content if first load
    if (displayedNews === 6) {
        newsGrid.innerHTML = '';
    }

    newsToShow.forEach((news, index) => {
        const card = createNewsCard(news);
        newsGrid.appendChild(card);
    });
}

// Create news card
function createNewsCard(news) {
    const article = document.createElement('article');
    article.className = 'news-card';
    article.innerHTML = `
        <div class="news-image">
            <img src="${news.image}" alt="${news.title}" loading="lazy">
        </div>
        <div class="news-content">
            <div class="news-meta">
                <span class="news-date"><i class="far fa-calendar"></i> ${news.date}</span>
            </div>
            <h3>${news.title}</h3>
            <p>${news.excerpt}</p>
            <a href="#" class="read-more" onclick="openNewsDetail(${news.id}); return false;">
                Read More <i class="fas fa-arrow-right"></i>
            </a>
        </div>
    `;
    return article;
}

// Setup load more button
function setupLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    loadMoreBtn.addEventListener('click', function() {
        displayedNews += newsPerLoad;
        
        // Show loading state
        const originalText = loadMoreBtn.innerHTML;
        loadMoreBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        loadMoreBtn.disabled = true;

        // Simulate loading delay
        setTimeout(() => {
            loadMoreNews();
            
            // Check if there are more news to load
            const remainingNews = newsData.filter(news => !news.featured).length;
            if (displayedNews >= remainingNews) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.innerHTML = originalText;
                loadMoreBtn.disabled = false;
            }
        }, 500);
    });
}

// Open news detail (placeholder for full news page)
function openNewsDetail(newsId) {
    const news = newsData.find(n => n.id === newsId);
    if (news) {
        // In a full implementation, this would navigate to a news-detail.html page
        alert(`News: ${news.title}\n\nThis would open the full news article.`);
    }
}

// Filter news by category (for future implementation)
function filterNews(category) {
    const newsGrid = document.getElementById('newsGrid');
    if (!newsGrid) return;

    const filteredNews = category === 'all' 
        ? newsData.filter(news => !news.featured)
        : newsData.filter(news => !news.featured && news.category.toLowerCase() === category.toLowerCase());

    newsGrid.innerHTML = '';
    
    filteredNews.forEach(news => {
        const card = createNewsCard(news);
        newsGrid.appendChild(card);
    });

    // Hide load more when filtering
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}
