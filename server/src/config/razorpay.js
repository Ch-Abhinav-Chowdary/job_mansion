const Razorpay = require('razorpay');
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = require('./env');

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

module.exports = razorpay;
