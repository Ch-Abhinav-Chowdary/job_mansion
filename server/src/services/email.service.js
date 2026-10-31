const nodemailer = require('nodemailer');
const { EMAIL_USER, EMAIL_PASS } = require('../config/env');

let transporter = null;

if (EMAIL_USER && EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });
}

/**
 * Send a password reset email or log the reset link to console if email is not configured.
 */
const sendPasswordResetEmail = async (to, resetUrl) => {
  if (!transporter) {
    console.log('\n========================================');
    console.log('[EMAIL SERVICE - DEV/LOG MODE]');
    console.log(`To:         ${to}`);
    console.log(`Subject:    Password Reset Request — Job Mansion`);
    console.log(`Reset URL:  ${resetUrl}`);
    console.log('Valid for:  30 minutes');
    console.log('========================================\n');
    return { sent: false, loggedToConsole: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Job Mansion" <${EMAIL_USER}>`,
      to,
      subject: 'Password Reset Request — Job Mansion',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Job Mansion Password Reset</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to choose a new password. This link is valid for <strong>30 minutes</strong>.</p>
          <div style="margin: 25px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this URL into your browser: <br/><a href="${resetUrl}">${resetUrl}</a></p>
        </div>
      `,
    });

    console.log(`Password reset email sent to ${to}: ${info.messageId}`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email via SMTP, logging link instead:', error.message);
    console.log(`[FALLBACK RESET URL for ${to}]: ${resetUrl}`);
    return { sent: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
};
