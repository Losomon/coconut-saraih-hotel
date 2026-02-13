/**
 * Activities Data Store
 * Contains all activity information for dynamic loading on activity-detail.html
 * 
 * The dhow-sailing activity uses static HTML and is NOT loaded from this file
 * This data is for: safari, swahili-culture, wellness, culinary, adventure
 */

const activitiesData = {
  // ========================================
  // LAND & SAFARI
  // ========================================
  "safari": {
    title: "Tsavo National Park",
    titleItalic: "Safari",
    category: "Land & Safari",
    heroImage: "assets/images/local-activities (3).jpg",
    duration: "Full Day (10 Hours)",
    groupSize: "2 – 8 Guests",
    timing: "Early Morning Departure",
    rating: "4.8",
    reviewCount: "203",
    price: "18,500",
    priceNote: "Per person · Min. 2 guests",
    
    overview: {
      eyebrow: "About This Experience",
      heading: "Wild Kenya",
      headingItalic: "Awaits",
      lead: "Journey deep into Tsavo National Park, one of Kenya's largest and most spectacular wildlife reserves, home to the legendary red elephants and Africa's iconic Big Five.",
      paragraphs: [
        "Departing before dawn from The Coconut Saraih, this full-day safari adventure takes you through the dramatic landscapes of Tsavo East National Park. Known for its vast open plains, seasonal rivers, and remarkable biodiversity, Tsavo offers one of Kenya's most authentic safari experiences.",
        "Your expert guide navigates the park's ancient elephant corridors and acacia-dotted savannahs in search of lions, leopards, buffalo, rhinos, and the famous red elephants — named for the rust-colored dust they spray on themselves for protection from the sun. The park is also home to over 500 bird species, making it a paradise for wildlife enthusiasts.",
        "A gourmet picnic lunch is served under the shade of baobab trees overlooking a waterhole, where animals gather throughout the day. This is safari at its finest — raw, unspoiled, and utterly unforgettable."
      ],
      image: "assets/images/local-activities (28).jpg"
    },

    gallery: [
      "assets/images/local-activities (26).jpg",
      "assets/images/local-activities (22).jpg",
      "assets/images/local-activities (21).jpg"
    ],

    highlights: [
      {
        icon: "fa-binoculars",
        title: "Big Five Viewing",
        description: "Lions, elephants, buffalo, leopards and rhinos roam freely across Tsavo's vast plains."
      },
      {
        icon: "fa-car",
        title: "Private 4x4 Safari Vehicle",
        description: "Comfortable Land Cruiser with pop-up roof for unobstructed wildlife photography."
      },
      {
        icon: "fa-user-tie",
        title: "Expert Safari Guide",
        description: "Certified naturalist with decades of experience tracking Tsavo's wildlife."
      },
      {
        icon: "fa-utensils",
        title: "Gourmet Bush Lunch",
        description: "Freshly prepared picnic served at a scenic waterhole viewing point."
      },
      {
        icon: "fa-camera",
        title: "Photography Opportunities",
        description: "Stops at prime locations for capturing Kenya's incredible wildlife and landscapes."
      },
      {
        icon: "fa-leaf",
        title: "Conservation Insights",
        description: "Learn about Tsavo's critical role in elephant conservation and anti-poaching efforts."
      }
    ],

    included: [
      "Hotel pick-up and drop-off in private 4x4 vehicle",
      "Full-day guided safari in Tsavo East National Park",
      "Park entrance fees",
      "Gourmet picnic lunch with beverages",
      "Bottled water throughout the day",
      "Professional safari guide and driver",
      "Binoculars and wildlife guidebook",
      "All government taxes and levies"
    ],

    notIncluded: [
      "Alcoholic beverages (available for purchase)",
      "Personal travel insurance",
      "Gratuities for guide and driver",
      "Optional hot air balloon safari (can be arranged)"
    ],

    itinerary: [
      {
        time: "5:30 AM",
        title: "Early Morning Departure",
        description: "Pick-up from The Coconut Saraih. Light breakfast box provided for the journey."
      },
      {
        time: "7:30 AM",
        title: "Enter Tsavo East National Park",
        description: "Pass through the main gate and begin your first game drive through the morning mist."
      },
      {
        time: "9:00 AM",
        title: "Red Elephant Viewing",
        description: "Track the famous red elephants as they move toward waterholes for their morning drink."
      },
      {
        time: "12:00 PM",
        title: "Bush Lunch at Aruba Dam",
        description: "Enjoy a gourmet picnic overlooking the dam where wildlife gathers throughout the day."
      },
      {
        time: "2:00 PM",
        title: "Afternoon Game Drive",
        description: "Explore deeper into the park, searching for lions, cheetahs and the elusive leopard."
      },
      {
        time: "4:30 PM",
        title: "Return Journey Begins",
        description: "Depart Tsavo and begin the scenic drive back to the coast."
      },
      {
        time: "7:00 PM",
        title: "Arrival at The Coconut Saraih",
        description: "Return to the hotel with unforgettable memories and spectacular photographs."
      }
    ],

    reviews: [
      {
        stars: 5,
        text: "An absolutely incredible day! We saw four of the Big Five, including a pride of lions with cubs. Our guide Joseph was phenomenal — his knowledge of animal behavior and the ecosystem was fascinating. The bush lunch was surprisingly gourmet.",
        name: "Michael & Sarah Chen",
        location: "Singapore",
        date: "December 2024",
        avatar: "M"
      },
      {
        stars: 5,
        text: "Best safari experience we've had in Kenya, and we've done several! Tsavo is less crowded than Maasai Mara but equally spectacular. The red elephants are truly a sight to behold.",
        name: "Hans Müller",
        location: "Berlin, Germany",
        date: "November 2024",
        avatar: "H"
      },
      {
        stars: 4.5,
        text: "Wonderful day out. Very well organized from start to finish. Saw so much wildlife and learned a great deal about conservation efforts. Long day but absolutely worth it!",
        name: "Priya Kapoor",
        location: "Mumbai, India",
        date: "October 2024",
        avatar: "P"
      }
    ],

    bookingMeta: {
      duration: "Full Day (10 Hours)",
      groupSize: "2 – 8 Guests",
      departure: "5:30 AM Daily",
      meetingPoint: "Hotel Main Entrance",
      language: "English, Swahili, German"
    },

    goodToKnow: [
      {
        icon: "fa-info-circle",
        text: "Suitable for all ages. Children under 5 travel free."
      },
      {
        icon: "fa-tshirt",
        text: "Wear neutral colors (khaki, olive, beige). Bring sunscreen, hat and sunglasses."
      },
      {
        icon: "fa-clock",
        text: "Full day activity (12+ hours). Early start required for best wildlife viewing."
      }
    ],

    relatedActivities: [
      {
        id: "dhow-sailing",
        image: "assets/images/local-activities (9).jpg",
        tag: "Water & Ocean",
        name: "Sunset Dhow Sailing",
        price: "6,000"
      },
      {
        id: "wellness",
        image: "assets/images/local-activities (10).jpg",
        tag: "Wellness & Leisure",
        name: "Beach Yoga & Meditation",
        price: "3,500"
      },
      {
        id: "culinary",
        image: "assets/images/restaurant-bar (11).jpg",
        tag: "Food & Culinary",
        name: "Swahili Cooking Class",
        price: "5,500"
      }
    ]
  },

  // ========================================
  // CULTURE & HERITAGE
  // ========================================
  "swahili-culture": {
    title: "Lamu Old Town",
    titleItalic: "Cultural Tour",
    category: "Culture & Heritage",
    heroImage: "assets/images/local-activities (18).jpg",
    duration: "6 Hours",
    groupSize: "2 – 10 Guests",
    timing: "Morning Departure",
    rating: "4.9",
    reviewCount: "167",
    price: "8,000",
    priceNote: "Per person · Min. 2 guests",
    
    overview: {
      eyebrow: "About This Experience",
      heading: "Step into",
      headingItalic: "Swahili History",
      lead: "Discover Lamu Island, a UNESCO World Heritage Site where Swahili culture has thrived for over 700 years. Wander through narrow stone alleyways, visit ancient mosques, and experience a way of life unchanged for centuries.",
      paragraphs: [
        "This immersive cultural tour takes you by boat to Lamu Island, Kenya's oldest continuously inhabited town and one of East Africa's most significant Swahili settlements. Founded in the 14th century, Lamu Old Town remains remarkably preserved, with no cars, no modern roads — just donkeys, dhows, and the rhythms of coastal life.",
        "Your expert local guide leads you through winding alleyways past intricately carved wooden doors, coral stone houses, and bustling markets filled with spices, textiles and handcrafted goods. Visit the Lamu Museum, the German Post Office Museum, and the 19th-century Riyadha Mosque. Learn about Swahili architecture, Islamic traditions, and the island's role in Indian Ocean trade routes.",
        "The tour includes a traditional Swahili lunch at a family-owned restaurant, where you'll taste authentic coastal cuisine passed down through generations. This is cultural immersion at its finest — an unforgettable journey into Kenya's rich heritage."
      ],
      image: "assets/images/local-activities (2).jpg"
    },

    gallery: [
      "assets/images/local-activities (29).jpg",
      "assets/images/local-activities (19).jpg",
      "assets/images/local-activities (17).jpg"
    ],

    highlights: [
      {
        icon: "fa-landmark",
        title: "UNESCO World Heritage Site",
        description: "Explore one of East Africa's best-preserved Swahili settlements dating back 700 years."
      },
      {
        icon: "fa-door-open",
        title: "Carved Wooden Doors",
        description: "Marvel at the ornate Zanzibari doors that tell stories of family history and status."
      },
      {
        icon: "fa-mosque",
        title: "Historic Mosques",
        description: "Visit ancient mosques including the beautiful Riyadha Mosque and its peaceful courtyard."
      },
      {
        icon: "fa-utensils",
        title: "Traditional Swahili Lunch",
        description: "Authentic coastal cuisine served at a family-run restaurant in the heart of the old town."
      },
      {
        icon: "fa-shopping-bag",
        title: "Artisan Markets",
        description: "Browse spice markets, textile stalls and meet local craftspeople creating traditional goods."
      },
      {
        icon: "fa-user-tie",
        title: "Local Historian Guide",
        description: "Native Lamu resident with deep knowledge of Swahili culture, language and traditions."
      }
    ],

    included: [
      "Speedboat transfer to and from Lamu Island",
      "Full-day guided walking tour of Lamu Old Town",
      "Entry to Lamu Museum and German Post Office Museum",
      "Traditional Swahili lunch at local restaurant",
      "Refreshments and bottled water",
      "Expert local cultural guide",
      "All entrance fees and government taxes"
    ],

    notIncluded: [
      "Personal shopping and souvenirs",
      "Additional meals or snacks",
      "Gratuities for guide (appreciated but optional)",
      "Travel insurance"
    ],

    itinerary: [
      {
        time: "8:00 AM",
        title: "Departure from The Coconut Saraih",
        description: "Transfer to the jetty for the scenic speedboat journey to Lamu Island (45 minutes)."
      },
      {
        time: "9:00 AM",
        title: "Arrival at Lamu Waterfront",
        description: "Meet your local guide and begin the walking tour through the narrow stone alleyways."
      },
      {
        time: "9:30 AM",
        title: "Lamu Museum Visit",
        description: "Explore exhibits on Swahili culture, traditional dhow building, and the island's maritime history."
      },
      {
        time: "10:30 AM",
        title: "Old Town Walking Tour",
        description: "Wander through historic neighborhoods, visiting carved door galleries and artisan workshops."
      },
      {
        time: "12:00 PM",
        title: "Traditional Swahili Lunch",
        description: "Enjoy authentic coastal cuisine including pilau rice, coconut fish curry, and mkate wa ufuta."
      },
      {
        time: "1:30 PM",
        title: "Market & Spice Tour",
        description: "Explore the bustling markets filled with cloves, cardamom, saffron and local handicrafts."
      },
      {
        time: "2:00 PM",
        title: "Return Boat Journey",
        description: "Scenic speedboat ride back to the mainland with stunning coastal views."
      }
    ],

    reviews: [
      {
        stars: 5,
        text: "Lamu is absolutely magical — like stepping back in time. Our guide Fatima was incredible, sharing stories about her family's 8 generations on the island. The architecture, the food, the people... just perfect.",
        name: "Emma Thompson",
        location: "London, UK",
        date: "January 2025",
        avatar: "E"
      },
      {
        stars: 5,
        text: "One of the best cultural tours I've ever experienced. The Swahili lunch alone was worth the trip! So much history and tradition preserved in this beautiful town.",
        name: "Kofi Mensah",
        location: "Accra, Ghana",
        date: "December 2024",
        avatar: "K"
      },
      {
        stars: 4.5,
        text: "Fascinating day exploring Lamu's rich heritage. The carved doors are works of art. Would recommend comfortable walking shoes — lots of narrow pathways and uneven stone streets!",
        name: "Lisa van Berg",
        location: "Amsterdam, Netherlands",
        date: "November 2024",
        avatar: "L"
      }
    ],

    bookingMeta: {
      duration: "6 Hours",
      groupSize: "2 – 10 Guests",
      departure: "8:00 AM Daily",
      meetingPoint: "Hotel Main Entrance",
      language: "English, Swahili, Arabic"
    },

    goodToKnow: [
      {
        icon: "fa-info-circle",
        text: "Modest dress required (shoulders and knees covered). Suitable for all ages."
      },
      {
        icon: "fa-tshirt",
        text: "Wear comfortable walking shoes. Bring sunscreen, hat, and a light scarf."
      },
      {
        icon: "fa-camera",
        text: "Photography allowed in most areas. Ask permission before photographing people."
      }
    ],

    relatedActivities: [
      {
        id: "dhow-sailing",
        image: "assets/images/local-activities (9).jpg",
        tag: "Water & Ocean",
        name: "Sunset Dhow Sailing",
        price: "6,000"
      },
      {
        id: "culinary",
        image: "assets/images/restaurant-bar (11).jpg",
        tag: "Food & Culinary",
        name: "Swahili Cooking Class",
        price: "5,500"
      },
      {
        id: "wellness",
        image: "assets/images/local-activities (10).jpg",
        tag: "Wellness & Leisure",
        name: "Beach Yoga & Meditation",
        price: "3,500"
      }
    ]
  },

  // ========================================
  // WELLNESS & LEISURE
  // ========================================
  "wellness": {
    title: "Beach Yoga &",
    titleItalic: "Meditation",
    category: "Wellness & Leisure",
    heroImage: "assets/images/local-activities (10).jpg",
    duration: "2 Hours",
    groupSize: "1 – 15 Guests",
    timing: "Sunrise & Sunset Sessions",
    rating: "5.0",
    reviewCount: "89",
    price: "3,500",
    priceNote: "Per person · Private sessions available",
    
    overview: {
      eyebrow: "About This Experience",
      heading: "Find Your",
      headingItalic: "Inner Peace",
      lead: "Begin or end your day with restorative yoga and guided meditation on the pristine white sands of The Coconut Saraih's private beach, accompanied by the gentle rhythm of Indian Ocean waves.",
      paragraphs: [
        "This wellness experience offers both sunrise and sunset sessions, each designed to harmonize your mind, body and spirit with the natural beauty of the Kenyan coast. Practice yoga asanas (postures) on the beach as the sun rises or sets, creating a deeply meditative atmosphere enhanced by the sounds of the ocean.",
        "Our certified yoga instructors guide participants of all levels through gentle Hatha and Vinyasa flows, breathing exercises (pranayama), and mindfulness meditation techniques. The session concludes with a deeply relaxing Savasana (final relaxation) and optional guided meditation focusing on ocean sounds and coastal energy.",
        "After the session, enjoy fresh coconut water and tropical fruit served right on the beach. This is more than exercise — it's a holistic wellness ritual that reconnects you with nature and yourself."
      ],
      image: "assets/images/local-activities (1).jpg"
    },

    gallery: [
      "assets/images/local-activities (15).jpg",
      "assets/images/local-activities (11).jpg",
      "assets/images/local-activities (12).jpg"
    ],

    highlights: [
      {
        icon: "fa-spa",
        title: "Beachfront Setting",
        description: "Practice on pristine white sand with unobstructed ocean views and gentle sea breezes."
      },
      {
        icon: "fa-om",
        title: "All Levels Welcome",
        description: "Sessions adapted for beginners through advanced practitioners with personalized guidance."
      },
      {
        icon: "fa-user-tie",
        title: "Certified Yoga Instructor",
        description: "Internationally trained teachers with expertise in Hatha, Vinyasa and meditation practices."
      },
      {
        icon: "fa-sun",
        title: "Sunrise or Sunset Options",
        description: "Choose morning sessions (6:30 AM) or evening sessions (5:30 PM) to suit your schedule."
      },
      {
        icon: "fa-leaf",
        title: "Eco-Friendly Mats Provided",
        description: "Sustainable cork and natural rubber yoga mats and props included."
      },
      {
        icon: "fa-coconut",
        title: "Post-Session Refreshments",
        description: "Fresh coconut water, tropical fruits and herbal teas served on the beach."
      }
    ],

    included: [
      "2-hour beachfront yoga and meditation session",
      "Certified yoga instructor",
      "Eco-friendly yoga mat and props",
      "Beach towel and cushion for meditation",
      "Fresh coconut water and tropical fruit",
      "Herbal tea selection",
      "Wellness journal and breathing guide"
    ],

    notIncluded: [
      "Personal yoga mat (if you prefer your own)",
      "Private session supplement (available on request)",
      "Spa treatments (can be booked separately)",
      "Photography service (available as add-on)"
    ],

    itinerary: [
      {
        time: "6:30 AM / 5:30 PM",
        title: "Gather at the Beach",
        description: "Meet your instructor on the private beach. Mats and props are set up facing the ocean."
      },
      {
        time: "+0:10",
        title: "Grounding & Breathwork",
        description: "Begin with gentle stretching and pranayama (breathing exercises) to center your mind."
      },
      {
        time: "+0:20",
        title: "Yoga Flow",
        description: "Guided Hatha or Vinyasa sequence adapted to the group's experience level."
      },
      {
        time: "+1:15",
        title: "Guided Meditation",
        description: "Immersive meditation session focused on ocean sounds and coastal imagery."
      },
      {
        time: "+1:45",
        title: "Savasana & Integration",
        description: "Final relaxation with optional guided visualization. Remain as long as you wish."
      },
      {
        time: "+2:00",
        title: "Refreshments",
        description: "Enjoy fresh coconut water, tropical fruits and herbal tea on the beach."
      }
    ],

    reviews: [
      {
        stars: 5,
        text: "This was the highlight of our trip! Starting each morning with yoga on the beach while watching the sunrise over the ocean was pure magic. The instructor was incredibly patient and created such a peaceful atmosphere.",
        name: "Jennifer & David Park",
        location: "Sydney, Australia",
        date: "January 2025",
        avatar: "J"
      },
      {
        stars: 5,
        text: "As someone who practices yoga regularly, I was impressed by the quality of instruction here. The beach setting adds something special that indoor studios simply can't match. Already booked for next year's trip!",
        name: "Marcus Weber",
        location: "Munich, Germany",
        date: "December 2024",
        avatar: "M"
      },
      {
        stars: 5,
        text: "Perfect for beginners like me. The instructor made me feel completely comfortable and didn't make me feel awkward about my lack of flexibility. The meditation at the end was deeply relaxing.",
        name: "Sarah Johnson",
        location: "Toronto, Canada",
        date: "November 2024",
        avatar: "S"
      }
    ],

    bookingMeta: {
      duration: "2 Hours",
      groupSize: "1 – 15 Guests",
      departure: "6:30 AM (Sunrise) / 5:30 PM (Sunset)",
      meetingPoint: "Beachfront Yoga Pavilion",
      language: "English"
    },

    goodToKnow: [
      {
        icon: "fa-info-circle",
        text: "Suitable for all levels — beginners welcome!"
      },
      {
        icon: "fa-tshirt",
        text: "Wear comfortable, stretchy clothing. Bring a change of clothes if doing sunset session."
      },
      {
        icon: "fa-sun",
        text: "Apply reef-safe sunscreen. Hats recommended for midday sessions."
      }
    ],

    relatedActivities: [
      {
        id: "dhow-sailing",
        image: "assets/images/local-activities (9).jpg",
        tag: "Water & Ocean",
        name: "Sunset Dhow Sailing",
        price: "6,000"
      },
      {
        id: "swahili-culture",
        image: "assets/images/local-activities (29).jpg",
        tag: "Culture & Heritage",
        name: "Lamu Cultural Tour",
        price: "8,000"
      },
      {
        id: "culinary",
        image: "assets/images/restaurant-bar (11).jpg",
        tag: "Food & Culinary",
        name: "Swahili Cooking Class",
        price: "5,500"
      }
    ]
  },

  // ========================================
  // FOOD & CULINARY
  // ========================================
  "culinary": {
    title: "Swahili Cooking",
    titleItalic: "Class",
    category: "Food & Culinary",
    heroImage: "assets/images/restaurant-bar (11).jpg",
    duration: "4 Hours",
    groupSize: "2 – 12 Guests",
    timing: "Morning Session",
    rating: "4.9",
    reviewCount: "124",
    price: "5,500",
    priceNote: "Per person · Includes lunch",
    
    overview: {
      eyebrow: "About This Experience",
      heading: "Taste the",
      headingItalic: "Coast",
      lead: "Learn the art of Swahili cuisine in an intimate cooking class led by generations of local chefs. Using fresh, locally-sourced ingredients and traditional techniques, discover the rich flavors that define coastal Kenyan cooking.",
      paragraphs: [
        "Begin your culinary journey with a guided visit to the local market, where you'll learn to select the freshest spices, seafood and tropical produce. Your expert chef will introduce you to the aromatic world of Swahili cooking — cumin, coriander, cardamom, turmeric and the famous Swahili spice blend.",
        "Back at the teaching kitchen, you'll learn to prepare authentic dishes using traditional methods passed down through families for centuries. Master the art of making perfect pilau rice, coconut curry fish, mkate wa ufuta (sesame bread), and kachumbari (fresh salsa).",
        "Sit down to enjoy your creations paired with fresh fruit juices and local tea. You'll receive a comprehensive recipe booklet to recreate these dishes at home, along with a certificate of completion and a special gift basket of Swahili spices."
      ],
      image: "assets/images/restaurant-bar (12).jpg"
    },

    gallery: [
      "assets/images/restaurant-bar (11).assets/images/restaurantjpg",
      "-bar (12).jpg",
      "assets/images/restaurant-bar (13).jpg"
    ],

    highlights: [
      {
        icon: "fa-shopping-basket",
        title: "Local Market Tour",
        description: "Visit the morning market to select fresh spices, seafood and tropical produce."
      },
      {
        icon: "fa-mortar-powder",
        title: "Spice Masterclass",
        description: "Learn about Swahili spices and create your own spice blend to take home."
      },
      {
        icon: "fa-chef-hat",
        title: "Hands-On Cooking",
        description: "Prepare 4-5 traditional Swahili dishes with guidance from expert chefs."
      },
      {
        icon: "fa-utensils",
        title: "Lunch Included",
        description: "Enjoy your creations paired with fresh juices and local beverages."
      },
      {
        icon: "fa-book",
        title: "Recipe Booklet",
        description: "Take home a comprehensive recipe booklet to recreate dishes."
      },
      {
        icon: "fa-gift",
        title: "Spice Gift Basket",
        description: "Receive a curated selection of Swahili spices to continue your cooking journey."
      }
    ],

    included: [
      "Guided market tour with tastings",
      "4-hour hands-on cooking class",
      "All ingredients and cooking equipment provided",
      "Traditional Swahili lunch with beverages",
      "Recipe booklet and spice gift basket",
      "Apron and chef hat for the session",
      "Certificate of completion",
      "Hotel pick-up and drop-off"
    ],

    notIncluded: [
      "Personal shopping at the market",
      "Alcoholic beverages (available for purchase)",
      "Gratuities for chef and staff"
    ],

    itinerary: [
      {
        time: "8:00 AM",
        title: "Market Tour",
        description: "Visit the local market to learn about and select fresh ingredients and spices."
      },
      {
        time: "9:30 AM",
        title: "Welcome & Briefing",
        description: "Arrive at the teaching kitchen for welcome drinks and an introduction to Swahili cuisine."
      },
      {
        time: "10:00 AM",
        title: "Spice Masterclass",
        description: "Learn about traditional Swahili spices and create your personal spice blend."
      },
      {
        time: "11:00 AM",
        title: "Cooking Session Begins",
        description: "Prepare pilau rice, coconut fish curry and traditional accompaniments."
      },
      {
        time: "12:30 PM",
        title: "Set the Table",
        description: "Learn traditional Swahili table presentation and prepare kachumbari."
      },
      {
        time: "1:00 PM",
        title: "Lunch",
        description: "Enjoy your creations paired with fresh fruit juices and local tea."
      },
      {
        time: "2:00 PM",
        title: "Wrap-Up & Gifts",
        description: "Receive your recipe booklet, spice basket and certificate. Return to hotel."
      }
    ],

    reviews: [
      {
        stars: 5,
        text: "This cooking class was incredible! Learning about the spices and then actually cooking with them was so much fun. The market tour was a highlight — our chef knew everyone and we tasted so many things. The food we made was delicious!",
        name: "Amanda & Tom Richards",
        location: "Melbourne, Australia",
        date: "January 2025",
        avatar: "A"
      },
      {
        stars: 5,
        text: "As a foodie, I loved this experience. The depth of knowledge about Swahili spices was impressive. I've done cooking classes all over the world, and this one was truly special. The spice blend I made is now my secret ingredient at home!",
        name: "Pierre Dubois",
        location: "Paris, France",
        date: "December 2024",
        avatar: "P"
      },
      {
        stars: 4.5,
        text: "Great way to learn about local culture through food. The recipes are simple but full of flavor. My kids (ages 10 and 12) loved it too — they even helped make the mkate wa ufuta! Highly recommend for families.",
        name: "Nairobi Family",
        location: "Nairobi, Kenya",
        date: "November 2024",
        avatar: "N"
      }
    ],

    bookingMeta: {
      duration: "4 Hours",
      groupSize: "2 – 12 Guests",
      departure: "8:00 AM",
      meetingPoint: "Hotel Main Entrance",
      language: "English, Swahili"
    },

    goodToKnow: [
      {
        icon: "fa-info-circle",
        text: "Suitable for all ages. Children under 12 receive a simplified recipe booklet."
      },
      {
        icon: "fa-utensils",
        text: "Please inform us of any dietary restrictions or allergies in advance."
      },
      {
        icon: "fa-tshirt",
        text: "Wear comfortable, casual clothing. An apron is provided."
      }
    ],

    relatedActivities: [
      {
        id: "swahili-culture",
        image: "assets/images/local-activities (29).jpg",
        tag: "Culture & Heritage",
        name: "Lamu Cultural Tour",
        price: "8,000"
      },
      {
        id: "dhow-sailing",
        image: "assets/images/local-activities (9).jpg",
        tag: "Water & Ocean",
        name: "Sunset Dhow Sailing",
        price: "6,000"
      },
      {
        id: "wellness",
        image: "assets/images/local-activities (10).jpg",
        tag: "Wellness & Leisure",
        name: "Beach Yoga & Meditation",
        price: "3,500"
      }
    ]
  },

  // ========================================
  // ADVENTURE
  // ========================================
  "adventure": {
    title: "Mombasa Marine",
    titleItalic: "Snorkeling",
    category: "Adventure",
    heroImage: "assets/images/local-activities (6).jpg",
    duration: "4 Hours",
    groupSize: "2 – 8 Guests",
    timing: "Morning Trip",
    rating: "4.8",
    reviewCount: "156",
    price: "7,500",
    priceNote: "Per person · All equipment included",
    
    overview: {
      eyebrow: "About This Experience",
      heading: "Discover the",
      headingItalic: "Underwater World",
      lead: "Explore the vibrant coral reefs and colorful marine life of the Kenyan coast on this guided snorkeling adventure. Suitable for beginners and experienced snorkelers alike.",
      paragraphs: [
        "Depart from the beach in a traditional dhow, sailing to pristine coral reefs just off the coast. Our expert marine guides know the best spots for encountering tropical fish, sea turtles, and if lucky, dolphins.",
        "The reefs here are part of the Mombasa Marine National Park, a protected area known for its exceptional biodiversity. Schools of vibrant fish, intricate coral formations, and curious sea creatures await beneath the surface.",
        "No snorkeling experience is required — our guides provide thorough safety briefings and one-on-one assistance. All equipment is provided, including quality masks, snorkels, fins and wetsuits if needed. After the adventure, enjoy fresh tropical fruits and drinks on the beach."
      ],
      image: "assets/images/local-activities (5).jpg"
    },

    gallery: [
      "assets/images/local-activities (6).jpg",
      "assets/images/local-activities (5).jpg",
      "assets/images/local-activities (4).jpg"
    ],

    highlights: [
      {
        icon: "fa-fish",
        title: "Coral Reef Exploration",
        description: "Discover vibrant coral gardens teeming with tropical fish species."
      },
      {
        icon: "fa-water",
        title: "Traditional Dhow Ride",
        description: "Sail to the reefs in an authentic wooden dhow — a quintessential coastal experience."
      },
      {
        icon: "fa-binoculars",
        title: "Marine Life Spotting",
        description: "Encounter sea turtles, octopus, rays and occasionally dolphins."
      },
      {
        icon: "fa-user-shield",
        title: "Expert Guides",
        description: "Certified marine guides provide safety briefings and in-water assistance."
      },
      {
        icon: "fa-camera",
        title: "Photo Opportunities",
        description: "Capture incredible underwater moments with available underwater cameras."
      },
      {
        icon: "fa-utensils",
        title: "Beach Refreshments",
        description: "Fresh tropical fruits and beverages served after the snorkeling session."
      }
    ],

    included: [
      "Traditional dhow transport to and from the reef",
      "Professional snorkeling guide (ratio 1:4)",
      "Quality snorkeling equipment (mask, snorkel, fins)",
      "Wetsuit (if needed)",
      "Safety briefing and swimming assessment",
      "Fresh tropical fruits and beverages",
      "Marine park fees",
      "Hotel pick-up and drop-off"
    ],

    notIncluded: [
      "Underwater photography service (available as add-on)",
      "Travel insurance",
      "Gratuities for guides"
    ],

    itinerary: [
      {
        time: "7:30 AM",
        title: "Hotel Pick-Up",
        description: "Transfer from The Coconut Saraih to the beach departure point."
      },
      {
        time: "8:00 AM",
        title: "Safety Briefing",
        description: "Receive instructions on snorkeling techniques and safety procedures."
      },
      {
        time: "8:30 AM",
        title: "Dhow Journey",
        description: "Sail to the coral reefs while enjoying fresh fruit and hot beverages."
      },
      {
        time: "9:00 AM",
        title: "First Snorkel Session",
        description: "Explore the reef with guide assistance. Duration approximately 45 minutes."
      },
      {
        time: "10:00 AM",
        title: "Surface Interval",
        description: "Rest on the dhow with refreshments while moving to the second reef location."
      },
      {
        time: "10:30 AM",
        title: "Second Snorkel Session",
        description: "Explore a different reef area with new marine life to discover."
      },
      {
        time: "11:30 AM",
        title: "Return Journey",
        description: "Sail back to the beach for fresh fruit and drinks before returning to hotel."
      }
    ],

    reviews: [
      {
        stars: 5,
        text: "Absolutely stunning reefs! We saw so many fish, a sea turtle and even a small shark (harmless). The dhow ride was magical. Our guide Kelvin was amazing — patient and knowledgeable. This was the highlight of our honeymoon!",
        name: "Rachel & James Miller",
        location: "Chicago, USA",
        date: "January 2025",
        avatar: "R"
      },
      {
        stars: 5,
        text: "I've snorkeled all over the world and these reefs are incredible. The colors are so vibrant! The dhow experience added something special you don't get with speedboats. Already planning to come back next year.",
        name: "Tomoko Tanaka",
        location: "Tokyo, Japan",
        date: "December 2024",
        avatar: "T"
      },
      {
        stars: 4.5,
        text: "First time snorkeling and I was nervous, but the guides made me feel completely safe. Saw so many fish and even an octopus! The dhow ride was beautiful. Would recommend for anyone visiting the coast.",
        name: "Oliver Schmidt",
        location: "Vienna, Austria",
        date: "November 2024",
        avatar: "O"
      }
    ],

    bookingMeta: {
      duration: "4 Hours",
      groupSize: "2 – 8 Guests",
      departure: "7:30 AM",
      meetingPoint: "Hotel Main Entrance",
      language: "English, Swahili"
    },

    goodToKnow: [
      {
        icon: "fa-info-circle",
        text: "Beginners welcome! Non-swimmers can also participate with floatation assistance."
      },
      {
        icon: "fa-tshirt",
        text: "Bring swimwear, towel and change of clothes. Reef-safe sunscreen required."
      },
      {
        icon: "fa-ban",
        text: "Do not touch or stand on coral. Marine park regulations must be followed."
      }
    ],

    relatedActivities: [
      {
        id: "dhow-sailing",
        image: "assets/images/local-activities (9).jpg",
        tag: "Water & Ocean",
        name: "Sunset Dhow Sailing",
        price: "6,000"
      },
      {
        id: "safari",
        image: "assets/images/local-activities (3).jpg",
        tag: "Land & Safari",
        name: "Tsavo Safari",
        price: "18,500"
      },
      {
        id: "wellness",
        image: "assets/images/local-activities (10).jpg",
        tag: "Wellness & Leisure",
        name: "Beach Yoga & Meditation",
        price: "3,500"
      }
    ]
  }
};
