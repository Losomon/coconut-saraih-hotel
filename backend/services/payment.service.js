const Payment = require('../models/Payment');
const Booking = require('../models/Booking');

/**
 * Payment Service - Payment processing and management
 */
class PaymentService {
  /**
   * Process Stripe payment
   */
  async processStripePayment({ amount, currency, paymentId, returnUrl }) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency?.toLowerCase() || 'usd',
        metadata: {
          paymentId: paymentId.toString()
        },
        // Only add return_url if provided (not required for some payment methods)
        ...(returnUrl && { return_url: returnUrl })
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        status: paymentIntent.status,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      throw new Error(`Payment failed: ${error.message}`);
    }
  }

  /**
   * Process PayPal payment
   */
  async processPaypalPayment({ amount, currency, paymentId }) {
    // This would use PayPal SDK
    // Placeholder implementation
    return {
      orderId: `PP-${Date.now()}`,
      approvalUrl: `https://www.paypal.com/checkoutnow?token=PP-${paymentId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };
  }

  /**
   * Process M-Pesa payment
   */
  async processMpesaPayment({ amount, phone, paymentId }) {
    // This would integrate with M-Pesa API
    // Placeholder implementation
    return {
      checkoutRequestId: `MP-${Date.now()}`,
      phone,
      status: 'pending',
      message: 'STK Push sent to your phone'
    };
  }

  /**
   * Handle successful Stripe payment
   */
  async handleSuccessfulPayment(paymentIntent) {
    const payment = await Payment.findOne({
      'metadata.paymentIntentId': paymentIntent.id
    });

    if (!payment) {
      console.error('Payment not found for:', paymentIntent.id);
      return;
    }

    payment.status = 'completed';
    payment.metadata = {
      ...payment.metadata,
      paymentIntentId: paymentIntent.id,
      paymentMethod: paymentIntent.payment_method_types[0]
    };
    payment.processedAt = new Date();
    await payment.save();

    // Update booking payment status
    if (payment.booking) {
      await Booking.findByIdAndUpdate(payment.booking, {
        'payment.status': 'paid',
        status: 'confirmed'
      });
    }
  }

  /**
   * Handle failed Stripe payment
   */
  async handleFailedPayment(paymentIntent) {
    const payment = await Payment.findOne({
      'metadata.paymentIntentId': paymentIntent.id
    });

    if (!payment) {
      console.error('Payment not found for:', paymentIntent.id);
      return;
    }

    payment.status = 'failed';
    payment.gatewayResponse = {
      error: paymentIntent.last_payment_error?.message,
      paymentIntentId: paymentIntent.id
    };
    await payment.save();
  }

  /**
   * Handle M-Pesa success callback
   */
  async handleMpesaSuccess(callbackData) {
    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = callbackData;

    const payment = await Payment.findOne({
      'metadata.checkoutRequestId': CheckoutRequestID
    });

    if (!payment) {
      console.error('Payment not found for:', CheckoutRequestID);
      return;
    }

    // Extract M-Pesa details from callback metadata
    const getMetadataValue = (key) => {
      const item = CallbackMetadata?.Item?.find(i => i.Name === key);
      return item?.Value;
    };

    payment.status = 'completed';
    payment.metadata = {
      ...payment.metadata,
      mpesaReceiptNumber: getMetadataValue('MpesaReceiptNumber'),
      transactionDate: getMetadataValue('TransactionDate'),
      phoneNumber: getMetadataValue('PhoneNumber')
    };
    payment.processedAt = new Date();
    await payment.save();

    // Update booking payment status
    if (payment.booking) {
      await Booking.findByIdAndUpdate(payment.booking, {
        'payment.status': 'paid',
        status: 'confirmed'
      });
    }
  }

  /**
   * Handle M-Pesa failure callback
   */
  async handleMpesaFailure(callbackData) {
    const { CheckoutRequestID, ResultCode, ResultDesc } = callbackData;

    const payment = await Payment.findOne({
      'metadata.checkoutRequestId': CheckoutRequestID
    });

    if (!payment) {
      console.error('Payment not found for:', CheckoutRequestID);
      return;
    }

    payment.status = 'failed';
    payment.gatewayResponse = {
      error: ResultDesc,
      resultCode: ResultCode
    };
    await payment.save();
  }

  /**
   * Verify Stripe payment status
   */
  async verifyStripePayment(payment) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        payment.metadata.paymentIntentId
      );

      return {
        verified: paymentIntent.status === 'succeeded',
        status: paymentIntent.status
      };
    } catch (error) {
      console.error('Stripe verification error:', error);
      return { verified: false, status: 'error' };
    }
  }

  /**
   * Verify M-Pesa payment status
   */
  async verifyMpesaPayment(payment) {
    // This would query M-Pesa for transaction status
    // Placeholder - assumes payment is still pending
    return {
      verified: false,
      status: 'pending'
    };
  }

  /**
   * Refund Stripe payment
   */
  async refundStripePayment(payment, amount) {
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

    try {
      const refund = await stripe.refunds.create({
        payment_intent: payment.metadata.paymentIntentId,
        amount: Math.round(amount * 100) // Convert to cents
      });

      return {
        refundId: refund.id,
        status: refund.status
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new Error(`Refund failed: ${error.message}`);
    }
  }

  /**
   * Refund M-Pesa payment
   */
  async refundMpesaPayment(payment, amount) {
    // This would initiate M-Pesa refund (B2C)
    // Placeholder implementation
    return {
      refundId: `REF-${Date.now()}`,
      status: 'pending'
    };
  }

  /**
   * Handle Stripe refund webhook
   */
  async handleRefund(charge) {
    const payment = await Payment.findOne({
      'metadata.paymentIntentId': charge.payment_intent
    });

    if (!payment) {
      console.error('Payment not found for refund:', charge.payment_intent);
      return;
    }

    payment.status = 'refunded';
    payment.refund = {
      amount: charge.amount_refunded / 100,
      processedAt: new Date(),
      refundId: charge.id
    };
    await payment.save();
  }

  /**
   * Get payment by transaction ID
   */
  async getByTransactionId(transactionId) {
    return Payment.findOne({ transactionId });
  }

  /**
   * Get payment statistics
   */
  async getStats(startDate, endDate) {
    const match = {
      status: 'completed',
      createdAt: {}
    };

    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);

    const stats = await Payment.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);

    return stats[0] || { totalAmount: 0, count: 0, avgAmount: 0 };
  }

  /**
   * Process payment for activity booking
   */
  async processActivityPayment({ amount, userId, activityId, gateway }) {
    const payment = await Payment.create({
      transactionId: `TXN-ACT-${Date.now()}`,
      user: userId,
      type: 'activity',
      amount,
      currency: 'USD',
      method: gateway,
      gateway,
      status: 'pending',
      metadata: {
        activityId
      }
    });

    if (gateway === 'stripe') {
      return this.processStripePayment({
        amount,
        paymentId: payment._id
      });
    }

    return { paymentId: payment._id };
  }
}

module.exports = new PaymentService();
