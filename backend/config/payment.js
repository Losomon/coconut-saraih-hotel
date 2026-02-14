/**
 * Payment Gateway Configuration
 */

const config = require('./index');

let stripeClient = null;
let paypalClient = null;

/**
 * Initialize Stripe
 */
const initializeStripe = () => {
  const stripeConfig = config.payment.stripe;
  
  if (!stripeConfig.secretKey) {
    console.warn('Stripe secret key not configured');
    return null;
  }

  try {
    stripeClient = require('stripe')(stripeConfig.secretKey, {
      apiVersion: stripeConfig.apiVersion
    });
    console.log('Stripe client initialized');
    return stripeClient;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error.message);
    return null;
  }
};

/**
 * Initialize PayPal
 */
const initializePayPal = () => {
  const paypalConfig = config.payment.paypal;
  
  if (!paypalConfig.clientId || !paypalConfig.clientSecret) {
    console.warn('PayPal credentials not configured');
    return null;
  }

  try {
    const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');
    
    const environment = paypalConfig.mode === 'production'
      ? new checkoutNodeJssdk.core.LiveEnvironment(paypalConfig.clientId, paypalConfig.clientSecret)
      : new checkoutNodeJssdk.core.SandboxEnvironment(paypalConfig.clientId, paypalConfig.clientSecret);
    
    paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(environment);
    console.log('PayPal client initialized');
    return paypalClient;
  } catch (error) {
    console.error('Failed to initialize PayPal:', error.message);
    return null;
  }
};

/**
 * Get Stripe client
 */
const getStripeClient = () => stripeClient;

/**
 * Get PayPal client
 */
const getPayPalClient = () => paypalClient;

/**
 * Create Stripe Payment Intent
 */
const createStripePaymentIntent = async ({ amount, currency, customerId, metadata }) => {
  if (!stripeClient) {
    throw new Error('Stripe not initialized');
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      customer: customerId,
      metadata: metadata || {},
      automatic_payment_methods: {
        enabled: true
      }
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    };
  } catch (error) {
    console.error('Stripe payment intent error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Confirm Stripe Payment
 */
const confirmStripePayment = async (paymentIntentId) => {
  if (!stripeClient) {
    throw new Error('Stripe not initialized');
  }

  try {
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);
    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    };
  } catch (error) {
    console.error('Stripe confirm payment error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Create Stripe Refund
 */
const createStripeRefund = async ({ paymentIntentId, amount, reason }) => {
  if (!stripeClient) {
    throw new Error('Stripe not initialized');
  }

  try {
    const refund = await stripeClient.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason: reason || 'requested_by_customer'
    });

    return {
      success: true,
      refundId: refund.id,
      status: refund.status,
      amount: refund.amount / 100
    };
  } catch (error) {
    console.error('Stripe refund error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Create PayPal Order
 */
const createPayPalOrder = async ({ amount, currency, bookingRef, description }) => {
  if (!paypalClient) {
    throw new Error('PayPal not initialized');
  }

  try {
    const request = new require('@paypal/checkout-server-sdk/orders.OrdersCreateRequest')();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: bookingRef,
        description: description || `Booking ${bookingRef}`,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2)
        }
      }]
    });

    const order = await paypalClient.execute(request);
    
    return {
      success: true,
      orderId: order.result.id,
      status: order.result.status
    };
  } catch (error) {
    console.error('PayPal order error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Capture PayPal Order
 */
const capturePayPalOrder = async (orderId) => {
  if (!paypalClient) {
    throw new Error('PayPal not initialized');
  }

  try {
    const request = new require('@paypal/checkout-server-sdk/orders.OrdersCaptureRequest')(orderId);
    request.requestBody({});

    const capture = await paypalClient.execute(request);
    
    return {
      success: true,
      orderId: capture.result.id,
      status: capture.result.status,
      purchaseUnits: capture.result.purchase_units
    };
  } catch (error) {
    console.error('PayPal capture error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * M-Pesa STK Push
 */
const initiateMpesaSTKPush = async ({ phoneNumber, amount, accountRef, transactionDesc }) => {
  const mpesaConfig = config.payment.mpesa;
  
  if (!mpesaConfig.consumerKey || !mpesaConfig.consumerSecret) {
    console.warn('M-Pesa credentials not configured');
    return { success: false, error: 'M-Pesa not configured' };
  }

  try {
    // Get access token
    const tokenResponse = await fetch(
      `https://${mpesaConfig.environment === 'sandbox' ? 'sandbox.' : ''}api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${mpesaConfig.consumerKey}:${mpesaConfig.consumerSecret}`).toString('base64')}`
        }
      }
    );
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Format phone number
    const formattedPhone = phoneNumber.replace(/\D/g, '');
    const phone = formattedPhone.startsWith('254') ? formattedPhone : `254${formattedPhone.substring(1)}`;

    // STK Push request
    const timestamp = new Date().toISOString().replace(/[-:T.\d]{23}/g, '').slice(0, 8);
    const password = Buffer.from(`${mpesaConfig.shortCode}${mpesaConfig.passkey}${timestamp}`).toString('base64');

    const stkResponse = await fetch(
      `https://${mpesaConfig.environment === 'sandbox' ? 'sandbox.' : ''}api.safaricom.co.ke/mpesa/stkpush/v1/processrequest`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          BusinessShortCode: mpesaConfig.shortCode,
          Password: password,
          Timestamp: timestamp,
          TransactionType: 'CustomerBuyGoodsOnline',
          Amount: Math.round(amount),
          PartyA: phone,
          PartyB: mpesaConfig.shortCode,
          PhoneNumber: phone,
          CallBackURL: mpesaConfig.callbackUrl,
          AccountReference: accountRef,
          TransactionDesc: transactionDesc || 'Coconut Saraih Hotel Booking'
        })
      }
    );

    const stkData = await stkResponse.json();
    
    if (stkData.ResponseCode === '0') {
      return {
        success: true,
        checkoutRequestId: stkData.CheckoutRequestID,
        responseDescription: stkData.ResponseDescription
      };
    } else {
      return {
        success: false,
        error: stkData.errorMessage || 'STK Push failed'
      };
    }
  } catch (error) {
    console.error('M-Pesa STK Push error:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize all payment gateways
 */
const initializePayment = () => {
  initializeStripe();
  initializePayPal();
};

module.exports = {
  initializePayment,
  initializeStripe,
  initializePayPal,
  getStripeClient,
  getPayPalClient,
  createStripePaymentIntent,
  confirmStripePayment,
  createStripeRefund,
  createPayPalOrder,
  capturePayPalOrder,
  initiateMpesaSTKPush
};
