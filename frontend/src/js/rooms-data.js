/**
 * Room Data - The Coconut Saraih Hotel
 * Dynamic room details system
 */

const roomsData = {
  // Standard Room - Static content (kept as-is in HTML)
  "standard-room": {
    name: "Standard Room",
    tagline: "Comfortable Beachfront Stay",
    category: "Beach View • 24 m² • Queen Bed",
    heroImage: "assets/images/b1.jpg",
    price: "23",
    priceNote: "per night • 2 Adults max",
    rating: "4.5",
    reviewCount: "89",
    size: "24 m²",
    guests: "2 Adults max",
    bed: "Queen Bed",
    view: "Beach View",
    
    overview: {
      eyebrow: "Welcome to Your Coastal Retreat",
      headingMain: "Simple Comfort",
      headingItalic: "Beachside Living",
      lead: "Your comfortable and affordable beachfront escape awaits. The Standard Room offers everything you need for a relaxing stay without breaking the bank.",
      paragraphs: [
        "Our Standard Room is perfect for solo travelers or couples seeking a budget-friendly beachfront experience. Despite its affordable price, the room doesn't compromise on comfort or cleanliness. The queen-size bed ensures a restful night's sleep, while the modern en-suite bathroom provides all the essentials.",
        "Wake up to gentle ocean breezes and the sound of waves from your private balcony. The room features air conditioning, a flat-screen TV with local channels, and free high-speed WiFi to stay connected. A small desk area lets you catch up on work or plan your day's activities.",
        "Located on the ground floor for easy access, you're just steps away from the beach and pool area. Room service is available from our on-site restaurant, and daily housekeeping ensures your space stays fresh throughout your stay."
      ],
      image: "assets/images/b1.jpg"
    },
    
    gallery: [
      "assets/images/b1.jpg",
      "assets/images/b2.jpg",
      "assets/images/b3.jpg"
    ],
    
    amenities: [
      { icon: "fas fa-wifi", title: "Free WiFi", desc: "High-speed internet access" },
      { icon: "fas fa-tv", title: "Smart TV", desc: "32-inch with local channels" },
      { icon: "fas fa-snowflake", title: "Air Conditioning", desc: "Climate control" },
      { icon: "fas fa-bed", title: "Queen Bed", desc: "Premium linens" },
      { icon: "fas fa-shower", title: "En-suite Shower", desc: "Hot water available" },
      { icon: "fas fa-coffee", title: "Coffee Maker", desc: "Instant coffee provided" }
    ],
    
    features: {
      included: [
        "Daily housekeeping",
        "Fresh bed linens",
        "Bath towels provided",
        "Toiletries included",
        "24-hour front desk",
        "Free parking",
        "Beach access",
        "Pool access"
      ],
      optional: [
        "Airport transfer - $25",
        "Laundry service - $10/bag",
        "Late checkout - $15",
        "In-room breakfast - $12"
      ]
    },
    
    reviews: [
      {
        stars: 5,
        text: "Great value for money. The room was clean, bed was comfortable, and the beach access was fantastic.",
        name: "Michael Chen",
        origin: "Singapore",
        date: "January 2025"
      },
      {
        stars: 4,
        text: "Perfect budget option. Basic but everything you need for a beach holiday. Staff were very friendly.",
        name: "Sarah Williams",
        origin: "Australia",
        date: "December 2024"
      },
      {
        stars: 5,
        text: "Exceeded expectations for a standard room. Would definitely stay here again when on a budget.",
        name: "James Peterson",
        origin: "UK",
        date: "November 2024"
      }
    ],
    
    policies: [
      { icon: "fas fa-clock", title: "Check-in", desc: "2:00 PM - 11:00 PM" },
      { icon: "fas fa-sign-out-alt", title: "Check-out", desc: "10:00 AM" },
      { icon: "fas fa-smoking-ban", title: "Smoking", desc: "Non-smoking rooms" },
      { icon: "fas fa-child", title: "Children", desc: "Welcome of all ages" }
    ],
    
    relatedRooms: [
      { id: "deluxe-room", name: "Deluxe Room", price: "$37", image: "assets/images/b2.jpg" },
      { id: "ocean-view-suite", name: "Ocean View Suite", price: "$50", image: "assets/images/a2.jpg" },
      { id: "family-suite", name: "Family Suite", price: "$57", image: "assets/images/b3.jpg" }
    ]
  },

  // Deluxe Room
  "deluxe-room": {
    name: "Deluxe Room",
    tagline: "Pool View Luxury",
    category: "Pool View • 32 m² • King Bed with Bathtub",
    heroImage: "assets/images/b2.jpg",
    price: "37",
    priceNote: "per night • 2 Adults max",
    rating: "4.8",
    reviewCount: "156",
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
    
    gallery: [
      "assets/images/b2.jpg",
      "assets/images/b3.jpg",
      "assets/images/b4.jpg"
    ],
    
    amenities: [
      { icon: "fas fa-wifi", title: "High-Speed WiFi", desc: "Free fiber optic connection" },
      { icon: "fas fa-tv", title: "55\" Smart TV", desc: "Netflix & international channels" },
      { icon: "fas fa-snowflake", title: "Air Conditioning", desc: "Quiet inverter system" },
      { icon: "fas fa-bed", title: "King Size Bed", desc: "Premium Egyptian cotton" },
      { icon: "fas fa-bath", title: "Soaking Tub", desc: "Rainfall shower combo" },
      { icon: "fas fa-minibar", title: "Mini Bar", desc: "Stocked with beverages" }
    ],
    
    features: {
      included: [
        "Daily housekeeping",
        "Premium bed linens",
        "Bathrobe & slippers",
        "Toiletries bundle",
        "Pool towels provided",
        "Evening turndown service",
        "Fruit basket on arrival",
        "Free water bottles"
      ],
      optional: [
        "Airport transfer - $30",
        "Spa treatment discount - 15%",
        "Romantic setup - $25",
        "In-room breakfast - $15"
      ]
    },
    
    reviews: [
      {
        stars: 5,
        text: "Absolutely loved this room! The bathtub was amazing after a long day at the beach. Pool views were perfect.",
        name: "Emma Thompson",
        origin: "Canada",
        date: "January 2025"
      },
      {
        stars: 5,
        text: "Worth every penny. The bed was incredibly comfortable and the room was spotless. Staff were exceptional.",
        name: "David Park",
        origin: "South Korea",
        date: "December 2024"
      },
      {
        stars: 4,
        text: "Beautiful room with great amenities. The only reason for 4 stars is the WiFi was occasionally slow.",
        name: "Lisa Martin",
        origin: "Germany",
        date: "November 2024"
      }
    ],
    
    policies: [
      { icon: "fas fa-clock", title: "Check-in", desc: "2:00 PM - Midnight" },
      { icon: "fas fa-sign-out-alt", title: "Check-out", desc: "11:00 AM" },
      { icon: "fas fa-smoking-ban", title: "Smoking", desc: "Non-smoking property" },
      { icon: "fas fa-paw", title: "Pets", desc: "Not allowed" }
    ],
    
    relatedRooms: [
      { id: "standard-room", name: "Standard Room", price: "$23", image: "assets/images/b1.jpg" },
      { id: "ocean-view-suite", name: "Ocean View Suite", price: "$50", image: "assets/images/a2.jpg" },
      { id: "executive-suite", name: "Executive Suite", price: "$80", image: "assets/images/b4.jpg" }
    ]
  },

  // Ocean View Suite
  "ocean-view-suite": {
    name: "Ocean View Suite",
    tagline: "Panoramic Ocean Views",
    category: "Ocean View • 42 m² • King Bed • Private Terrace",
    heroImage: "assets/images/a2.jpg",
    price: "50",
    priceNote: "per night • 2 Adults max",
    rating: "4.9",
    reviewCount: "203",
    size: "42 m²",
    guests: "2 Adults max",
    bed: "King Size Bed",
    view: "Ocean View",
    
    overview: {
      eyebrow: "Wake Up to the Indian Ocean",
      headingMain: "Your Window to",
      headingItalic: "Paradise Views",
      lead: "Experience the magic of coastal Kenya from your private suite, where every morning begins with panoramic ocean vistas and the gentle rhythm of waves.",
      paragraphs: [
        "Our Ocean View Suite is designed to bring the outside in, featuring floor-to-ceiling windows that showcase the endless blue of the Indian Ocean. At 42 square meters, the suite offers a spacious bedroom and separate living area, perfect for those who appreciate both luxury and practicality.",
        "The private terrace is the crown jewel of this suite — an expansive outdoor space with loungers and a small dining table where you can enjoy breakfast while watching dolphins play in the distance. Sunsets from this vantage point are nothing short of spectacular, painting the sky in shades of orange and purple.",
        "The bathroom features double vanities, a rainfall shower, and premium bath products. A Nespresso machine, fully stocked mini bar, and round-the-clock room service ensure your every need is met. The suite also includes a dedicated workspace for business travelers who can't completely disconnect."
      ],
      image: "assets/images/a1.jpg"
    },
    
    gallery: [
      "assets/images/a2.jpg",
      "assets/images/a1.jpg",
      "assets/images/a3.jpg"
    ],
    
    amenities: [
      { icon: "fas fa-wifi", title: "Premium WiFi", desc: "Fiber optic, 100Mbps" },
      { icon: "fas fa-tv", title: "65\" Smart TV", desc: "Home theater system" },
      { icon: "fas fa-snowflake", title: "Air Conditioning", desc: "Smart climate control" },
      { icon: "fas fa-bed", title: "King Size Bed", desc: "Memory foam mattress" },
      { icon: "fas fa-eye", title: "Ocean View", desc: "Panoramic windows" },
      { icon: "fas fa-coffee", title: "Nespresso Machine", desc: "Premium coffee selection" }
    ],
    
    features: {
      included: [
        "Daily housekeeping",
        "Premium linens",
        "Bathrobe & slippers",
        "Full toiletries kit",
        "Pool & beach access",
        "Evening turndown",
        "Welcome champagne",
        "Daily fruit replenishment"
      ],
      optional: [
        "Private dinner on terrace - $80",
        "Couples massage - $120",
        "Sunset sailing trip - $75",
        "Butler service upgrade - $40"
      ]
    },
    
    reviews: [
      {
        stars: 5,
        text: "Words cannot describe how beautiful this suite is. The ocean views are incredible and the terrace is the perfect spot for sunset cocktails.",
        name: "Jennifer & Mark",
        origin: "USA",
        date: "January 2025"
      },
      {
        stars: 5,
        text: "We booked for our honeymoon and it exceeded all expectations. The staff arranged a romantic setup that brought tears to my wife's eyes.",
        name: "Robert Kim",
        origin: "Australia",
        date: "December 2024"
      },
      {
        stars: 5,
        text: "Best hotel room I've ever stayed in. The attention to detail was remarkable, from the quality of the beddings to the ocean view.",
        name: "Princess Al-Rashid",
        origin: "UAE",
        date: "November 2024"
      }
    ],
    
    policies: [
      { icon: "fas fa-clock", title: "Check-in", desc: "1:00 PM - Midnight" },
      { icon: "fas fa-sign-out-alt", title: "Check-out", desc: "11:00 AM" },
      { icon: "fas fa-smoking-ban", title: "Smoking", desc: "Non-smoking" },
      { icon: "fas fa-glass-cheers", title: "Occasions", desc: "Celebrations welcome" }
    ],
    
    relatedRooms: [
      { id: "deluxe-room", name: "Deluxe Room", price: "$37", image: "assets/images/b2.jpg" },
      { id: "executive-suite", name: "Executive Suite", price: "$80", image: "assets/images/b4.jpg" },
      { id: "presidential-villa", name: "Presidential Villa", price: "$167", image: "assets/images/b5.jpg" }
    ]
  },

  // Family Suite
  "family-suite": {
    name: "Family Suite",
    tagline: "Space for the Whole Family",
    category: "Garden View • 48 m² • 2 Bedrooms • Living Area",
    heroImage: "assets/images/b3.jpg",
    price: "57",
    priceNote: "per night • Up to 5 guests",
    rating: "4.7",
    reviewCount: "134",
    
    overview: {
      eyebrow: "Togetherness in Comfort",
      headingMain: "Space for",
      headingItalic: "Quality Family Time",
      lead: "Our Family Suite offers the perfect blend of togetherness and privacy, with two bedrooms, a spacious living area, and thoughtful amenities for guests of all ages.",
      paragraphs: [
        "Designed with families in mind, our 48-square-meter Family Suite features two separate bedrooms connected to a generous living area. The master bedroom has a king-size bed, while the second bedroom features two single beds — perfect for children or additional adults. Both rooms have their own dedicated space for belongings and relaxation.",
        "The living area is a versatile space where the family can gather to watch movies on the 55-inch smart TV, play games, or plan the next day's adventures. A dining table provides space for meals together, and the convenient kitchenette area includes a mini fridge, microwave, and basic cookware for preparing light snacks.",
        "Families will appreciate the practical touches: child safety features on balconies, a comfortable sofa bed in the living room, and proximity to the children's pool and kids' club. Our team is happy to arrange cots, high chairs, and babysitting services to make your family vacation as relaxing as possible."
      ],
      image: "assets/images/b3.jpg"
    },
    
    gallery: [
      "assets/images/b3.jpg",
      "assets/images/b4.jpg",
      "assets/images/b5.jpg"
    ],
    
    amenities: [
      { icon: "fas fa-wifi", title: "Free WiFi", desc: "Connect all devices" },
      { icon: "fas fa-tv", title: "55\" Smart TV", desc: "Kids' channels available" },
      { icon: "fas fa-bed", title: "2 Bedrooms", desc: "King + 2 singles" },
      { icon: "fas fa-couch", title: "Living Area", desc: "Spacious lounge" },
      { icon: "fas fa-utensils", title: "Kitchenette", desc: "Mini fridge & microwave" },
      { icon: "fas fa-shower", title: "2 Bathrooms", desc: "En-suite access" }
    ],
    
    features: {
      included: [
        "Daily housekeeping",
        "Children's amenities",
        "Board games library",
        "Beach toys provided",
        "Kids' pool access",
        "Kids' club activities",
        "Family beach towels",
        "Welcome treats for kids"
      ],
      optional: [
        "Babysitting - $15/hour",
        "Kids' cooking class - $20",
        "Family photo shoot - $60",
        "Connecting rooms - Free"
      ]
    },
    
    reviews: [
      {
        stars: 5,
        text: "Perfect for our family of 4. The kids loved having their own room, and we appreciated the extra bathroom space.",
        name: "The Anderson Family",
        origin: "USA",
        date: "January 2025"
      },
      {
        stars: 5,
        text: "The kids' club was a lifesaver! Our children had so much fun that they didn't want to leave. Highly recommend for families.",
        name: "Michelle O'Brien",
        origin: "Ireland",
        date: "December 2024"
      },
      {
        stars: 4,
        text: "Spacious suite that worked well for our multi-generational trip. Would have given 5 stars if the kitchenette had more utensils.",
        name: "Tanaka Family",
        origin: "Japan",
        date: "November 2024"
      }
    ],
    
    policies: [
      { icon: "fas fa-clock", title: "Check-in", desc: "2:00 PM - 11:00 PM" },
      { icon: "fas fa-sign-out-alt", title: "Check-out", desc: "11:00 AM" },
      { icon: "fas fa-baby", title: "Cots", desc: "Available on request" },
      { icon: "fas fa-users", title: "Capacity", desc: "Up to 5 guests" }
    ],
    
    relatedRooms: [
      { id: "standard-room", name: "Standard Room", price: "$23", image: "assets/images/b1.jpg" },
      { id: "deluxe-room", name: "Deluxe Room", price: "$37", image: "assets/images/b2.jpg" },
      { id: "presidential-villa", name: "Presidential Villa", price: "$167", image: "assets/images/b5.jpg" }
    ]
  },

  // Executive Suite
  "executive-suite": {
    name: "Executive Suite",
    tagline: "Business & Leisure Combined",
    category: "Ocean View • 55 m² • King Bed • Private Jacuzzi",
    heroImage: "assets/images/b4.jpg",
    price: "80",
    priceNote: "per night • 2-3 Adults max",
    rating: "4.9",
    reviewCount: "178",
    
    overview: {
      eyebrow: "For the Discerning Traveler",
      headingMain: "Where Business",
      headingItalic: "Meets Luxury",
      lead: "The Executive Suite seamlessly blends professional amenities with resort luxury, featuring a dedicated workspace, private jacuzzi, and stunning ocean panoramas.",
      paragraphs: [
        "At 55 square meters, the Executive Suite is designed for guests who demand excellence in both work and relaxation. The separate living area features a spacious work desk with dual monitor support, Herman Miller ergonomic chair, and high-speed internet with video conferencing capabilities — ensuring you stay productive without sacrificing comfort.",
        "After a day of meetings or exploration, unwind in your private jacuzzi on the terrace, overlooking the infinite ocean horizon. The suite includes a premium sound system, perfect for playing your favorite relaxation playlist or conducting conference calls in privacy. A dedicated butler service ensures your schedule runs smoothly.",
        "The bedroom features our finest linens on a king-size bed, with blackout curtains for perfect sleep. The marble bathroom includes a soaking tub, rainfall shower, and premium toiletries. Executive privileges include access to the Business Lounge, express check-in/check-out, and complimentary pressing of two garments daily."
      ],
      image: "assets/images/b4.jpg"
    },
    
    gallery: [
      "assets/images/b4.jpg",
      "assets/images/b5.jpg",
      "assets/images/a2.jpg"
    ],
    
    amenities: [
      { icon: "fas fa-wifi", title: "Business WiFi", desc: "Fiber, 200Mbps, VPN ready" },
      { icon: "fas fa-tv", title: "65\" Smart TV", desc: "Video call capable" },
      { icon: "fas fa-briefcase", title: "Work Desk", desc: "Ergonomic setup" },
      { icon: "fas fa-bed", title: "King Size Bed", desc: "Premium hybrid mattress" },
      { icon: "fas fa-hot-tub", title: "Private Jacuzzi", desc: "Heated ocean view" },
      { icon: "fas fa-user-tie", title: "Butler Service", desc: "24/7 dedicated" }
    ],
    
    features: {
      included: [
        "Daily housekeeping",
        "Business Lounge access",
        "Express check-in/out",
        "Pressing service (2 items)",
        "Welcome amenity basket",
        "Premium bath products",
        "Nespresso selection",
        "Newspaper daily"
      ],
      optional: [
        "Airport transfer - $45 (luxury vehicle)",
        "Private meeting room - $50/hour",
        "Executive dinner - $60/person",
        "Helicopter transfer - $350"
      ]
    },
    
    reviews: [
      {
        stars: 5,
        text: "As a frequent business traveler, this is exactly what I need. The workspace is fantastic and the jacuzzi is perfect for unwinding after a long day.",
        name: "Alexander Weber",
        origin: "Switzerland",
        date: "January 2025"
      },
      {
        stars: 5,
        text: "The butler service made our anniversary trip effortless. Every detail was taken care of, from restaurant reservations to surprise cake.",
        name: "Nadia & Hassan",
        origin: "Egypt",
        date: "December 2024"
      },
      {
        stars: 5,
        text: "Best executive suite I've experienced in Africa. The ocean view from the jacuzzi is unforgettable.",
        name: "Christopher Lee",
        origin: "Singapore",
        date: "November 2024"
      }
    ],
    
    policies: [
      { icon: "fas fa-clock", title: "Check-in", desc: "12:00 PM - Midnight" },
      { icon: "fas fa-sign-out-alt", title: "Check-out", desc: "12:00 PM" },
      { icon: "fas fa-laptop", title: "Workspace", desc: "Fully equipped" },
      { icon: "fas fa-star", title: "Status", desc: "Executive lounge access" }
    ],
    
    relatedRooms: [
      { id: "ocean-view-suite", name: "Ocean View Suite", price: "$50", image: "assets/images/a2.jpg" },
      { id: "deluxe-room", name: "Deluxe Room", price: "$37", image: "assets/images/b2.jpg" },
      { id: "presidential-villa", name: "Presidential Villa", price: "$167", image: "assets/images/b5.jpg" }
    ]
  },

  // Presidential Villa
  "presidential-villa": {
    name: "Presidential Villa",
    tagline: "Ultimate Beachfront Luxury",
    category: "Beachfront • 120 m² • 3 Bedrooms • Private Pool • Butler",
    heroImage: "assets/images/b5.jpg",
    price: "167",
    priceNote: "per night • Up to 8 guests",
    rating: "5.0",
    reviewCount: "67",
    
    overview: {
      eyebrow: "The Pinnacle of Luxury",
      headingMain: "Your Private",
      headingItalic: "Beachfront Paradise",
      lead: "The Presidential Villa represents the ultimate in coastal luxury — a sprawling 120-square-meter sanctuary with three bedrooms, your own private pool, dedicated butler, and direct beach access.",
      paragraphs: [
        "Set apart from the main resort, the Presidential Villa offers uncompromising privacy and space. This magnificent property features three en-suite bedrooms (two with king beds, one with twins), a grand living room, formal dining area for eight, and a fully equipped kitchen. Every surface speaks to quality: Italian marble floors, hand-carved wooden furniture, and original African art.",
        "The outdoor space is your personal resort: a heated infinity pool overlooks the beach, with plenty of loungers, umbrellas, and an outdoor bar area. Your dedicated butler is available around the clock to prepare meals, arrange activities, or simply ensure your glass is never empty as you watch the sun melt into the ocean.",
        "Exclusive privileges include a private chef option, complimentary airport transfers in a luxury vehicle, pre-arranged grocery stocking, and access to all resort facilities including the spa, restaurants, and water sports. The villa also features its own sound system, home theater, and smart home technology for seamless control of lighting, climate, and entertainment."
      ],
      image: "assets/images/b5.jpg"
    },
    
    gallery: [
      "assets/images/b5.jpg",
      "assets/images/a1.jpg",
      "assets/images/a3.jpg"
    ],
    
    amenities: [
      { icon: "fas fa-swimming-pool", title: "Private Pool", desc: "Heated infinity pool" },
      { icon: "fas fa-wifi", title: "Premium WiFi", desc: "Whole-villa coverage" },
      { icon: "fas fa-bed", title: "3 Bedrooms", desc: "2 King + 1 Twin" },
      { icon: "fas fa-utensils", title: "Private Chef", desc: "On request included" },
      { icon: "fas fa-car", title: "Luxury Transfers", desc: "Airport pickup/drop" },
      { icon: "fas fa-concierge", title: "24/7 Butler", desc: "Dedicated service" }
    ],
    
    features: {
      included: [
        "Daily housekeeping",
        "Dedicated butler",
        "Private chef (1 meal/day)",
        "Luxury airport transfers",
        "Welcome champagne & caviar",
        "Premium toiletries",
        "Daily newspaper",
        "Grocery stocking service"
      ],
      optional: [
        "Private yacht charter - $500",
        "In-villa spa treatments",
        "Helicopter tour - $350",
        "Personal trainer - $40/hour"
      ]
    },
    
    reviews: [
      {
        stars: 5,
        text: "We've stayed at luxury properties worldwide, but this villa is in a class of its own. The private pool, direct beach access, and incredible butler service made our 25th anniversary truly special.",
        name: "The Royal Family",
        origin: "UK",
        date: "January 2025"
      },
      {
        stars: 5,
        text: "Booked for a special corporate retreat and it was perfection. The team loved the outdoor spaces for meetings and the evenings by the pool were legendary.",
        name: "CEO - Tech Startup",
        origin: "USA",
        date: "December 2024"
      },
      {
        stars: 5,
        text: "Words cannot express how incredible this villa is. From the moment we arrived to the moment we left, we were treated like royalty. Already planning our next visit!",
        name: "The Al-Fayed Family",
        origin: "Qatar",
        date: "November 2024"
      }
    ],
    
    policies: [
      { icon: "fas fa-clock", title: "Check-in", desc: "Flexible, pre-arranged" },
      { icon: "fas fa-sign-out-alt", title: "Check-out", desc: "Flexible, pre-arranged" },
      { icon: "fas fa-users", title: "Capacity", desc: "Up to 8 guests" },
      { icon: "fas fa-glass-cheers", title: "Events", desc: "Pre-approved allowed" }
    ],
    
    relatedRooms: [
      { id: "executive-suite", name: "Executive Suite", price: "$80", image: "assets/images/b4.jpg" },
      { id: "ocean-view-suite", name: "Ocean View Suite", price: "$50", image: "assets/images/a2.jpg" },
      { id: "family-suite", name: "Family Suite", price: "$57", image: "assets/images/b3.jpg" }
    ]
  }
};
