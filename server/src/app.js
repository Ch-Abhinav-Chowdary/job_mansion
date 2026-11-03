const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const { CLIENT_URL } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(cors({
  origin: true, // Reflects the request origin so 'credentials: true' works (browsers reject wildcard '*' with credentials)
  credentials: true,
}));
// Webhook route requires raw body for HMAC signature verification before JSON parsing
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  require('./controllers/payment.controller').handleWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(mongoSanitize());

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: null, message: 'Server is running' });
});

// --- API routes ---
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/enquiries', require('./routes/enquiry.routes'));
app.use('/api/admin', require('./routes/admin.routes'));

// --- Central error handler (must be last) ---
app.use(errorHandler);

module.exports = app;
