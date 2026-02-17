const Newsletter = require('../models/Newsletter');

// @route   POST /api/newsletter
// @desc    Subscribe to newsletter
// @access  Public
exports.subscribe = async (req, res) => {
  try {
    const { email, name, source, preferences } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed to our newsletter'
        });
      } else {
        // Re-subscribe
        existingSubscriber.subscribed = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = null;
        if (name) existingSubscriber.name = name;
        if (source) existingSubscriber.source = source;
        if (preferences) existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
        
        await existingSubscriber.save();

        return res.status(200).json({
          success: true,
          message: 'You have been re-subscribed to our newsletter!',
          data: {
            email: existingSubscriber.email,
            subscribedAt: existingSubscriber.subscribedAt
          }
        });
      }
    }

    // Create new subscription
    const subscriber = new Newsletter({
      email: email.toLowerCase().trim(),
      name: name ? name.trim() : undefined,
      source: source || 'website',
      preferences: preferences || {
        promotions: true,
        news: true,
        events: true
      }
    });

    await subscriber.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for subscribing to our newsletter!',
      data: {
        email: subscriber.email,
        subscribedAt: subscriber.subscribedAt
      }
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter'
      });
    }

    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your subscription. Please try again.'
    });
  }
};

// @route   PUT /api/newsletter/unsubscribe
// @desc    Unsubscribe from newsletter
// @access  Public
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const subscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'This email is not subscribed to our newsletter'
      });
    }

    if (!subscriber.subscribed) {
      return res.status(400).json({
        success: false,
        message: 'This email is already unsubscribed'
      });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'You have been unsubscribed from our newsletter'
    });
  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request. Please try again.'
    });
  }
};

// @route   GET /api/newsletter
// @desc    Get all subscribers (admin only)
// @access  Private/Admin
exports.getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 50, subscribed } = req.query;
    
    const query = {};
    if (subscribed !== undefined) {
      query.subscribed = subscribed === 'true';
    }

    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Newsletter.countDocuments(query);

    res.status(200).json({
      success: true,
      count,
      total: await Newsletter.countDocuments(),
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: subscribers
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching subscribers'
    });
  }
};

// @route   GET /api/newsletter/stats
// @desc    Get newsletter statistics (admin only)
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const total = await Newsletter.countDocuments();
    const active = await Newsletter.countDocuments({ subscribed: true });
    const inactive = total - active;

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const subscribedThisMonth = await Newsletter.countDocuments({
      subscribed: true,
      subscribedAt: { $gte: thisMonth }
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        inactive,
        subscribedThisMonth
      }
    });
  } catch (error) {
    console.error('Get newsletter stats error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching statistics'
    });
  }
};
