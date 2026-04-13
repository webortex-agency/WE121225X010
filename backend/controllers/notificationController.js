const nodemailer = require('nodemailer');

/**
 * Create a reusable transporter from environment variables.
 * Supports SendGrid, Gmail, or any SMTP provider.
 */
const createTransporter = () => {
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      service: 'SendGrid',
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
    });
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const FROM = process.env.SMTP_FROM || '"WE Distribution" <no-reply@we-distribution.com>';

/**
 * Send an email notification. Silently fails if email is not configured.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER && !process.env.SENDGRID_API_KEY) {
    console.log(`[Email] Not configured — would send to ${to}: ${subject}`);
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.sendMail({ from: FROM, to, subject, html });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[Email] Failed to send to ${to}:`, err.message);
  }
};

// ── Email Templates ──────────────────────────────────────────────────────────

const collectionSubmittedEmail = (exhibitorName, movieId, date, netCollection) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
  <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #3b82f6;">
    <h2 style="color: #1e293b; margin-top: 0;">Collection Submitted</h2>
    <p style="color: #475569;">A new daily collection has been submitted and is awaiting your approval.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; color: #64748b;">Theater:</td><td style="padding: 8px; font-weight: 600;">${exhibitorName}</td></tr>
      <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b;">Movie ID:</td><td style="padding: 8px; font-weight: 600;">${movieId}</td></tr>
      <tr><td style="padding: 8px; color: #64748b;">Date:</td><td style="padding: 8px; font-weight: 600;">${date}</td></tr>
      <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b;">Net Collection:</td><td style="padding: 8px; font-weight: 600; color: #16a34a;">₹${netCollection?.toLocaleString('en-IN')}</td></tr>
    </table>
    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">WE Movie Distribution Platform — Automated Notification</p>
  </div>
</div>`;

const collectionApprovedEmail = (exhibitorName, movieId, date, netCollection) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
  <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #16a34a;">
    <h2 style="color: #1e293b; margin-top: 0;">✅ Collection Approved</h2>
    <p style="color: #475569;">Your collection submission has been <strong style="color: #16a34a;">approved</strong> and your ledger has been updated.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; color: #64748b;">Movie ID:</td><td style="padding: 8px; font-weight: 600;">${movieId}</td></tr>
      <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b;">Collection Date:</td><td style="padding: 8px; font-weight: 600;">${date}</td></tr>
      <tr><td style="padding: 8px; color: #64748b;">Net Amount Credited:</td><td style="padding: 8px; font-weight: 600; color: #16a34a;">₹${netCollection?.toLocaleString('en-IN')}</td></tr>
    </table>
    <p style="color: #64748b; font-size: 13px;">Login to your portal to view your updated ledger balance.</p>
    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">WE Movie Distribution Platform — Automated Notification</p>
  </div>
</div>`;

const collectionRejectedEmail = (exhibitorName, movieId, date, reason) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9;">
  <div style="background: white; border-radius: 8px; padding: 24px; border-left: 4px solid #dc2626;">
    <h2 style="color: #1e293b; margin-top: 0;">❌ Collection Rejected</h2>
    <p style="color: #475569;">Your collection submission has been <strong style="color: #dc2626;">rejected</strong>. Please review the reason and resubmit.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="padding: 8px; color: #64748b;">Movie ID:</td><td style="padding: 8px; font-weight: 600;">${movieId}</td></tr>
      <tr style="background: #f8fafc;"><td style="padding: 8px; color: #64748b;">Collection Date:</td><td style="padding: 8px; font-weight: 600;">${date}</td></tr>
      <tr><td style="padding: 8px; color: #64748b; vertical-align: top;">Rejection Reason:</td><td style="padding: 8px; font-weight: 600; color: #dc2626;">${reason}</td></tr>
    </table>
    <p style="color: #64748b; font-size: 13px;">Please correct the issue and submit a new collection entry for this date.</p>
    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">WE Movie Distribution Platform — Automated Notification</p>
  </div>
</div>`;

// ── API Handlers ─────────────────────────────────────────────────────────────

// @desc    Send test email
// @route   POST /api/notifications/test
// @access  Private (Admin)
const sendTestEmail = async (req, res) => {
  try {
    const { to } = req.body;
    if (!to) return res.status(400).json({ message: 'Recipient email is required' });

    await sendEmail({
      to,
      subject: 'Test Email — WE Distribution Platform',
      html: `<p>This is a test email from the WE Movie Distribution Platform. Email notifications are working correctly.</p>`,
    });

    res.json({ message: `Test email sent to ${to}` });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  sendEmail,
  collectionSubmittedEmail,
  collectionApprovedEmail,
  collectionRejectedEmail,
  sendTestEmail,
};
