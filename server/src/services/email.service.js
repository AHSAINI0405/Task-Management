import emailjs from '@emailjs/nodejs';
import { env } from '../config/env.js';

/**
 * Send an email via EmailJS Node SDK.
 * Fully compatible with your template variables:
 * - {{email}} (To Email)
 * - {{from_name}} (From Name)
 * - {{otp}} (OTP code in body)
 * - {{time}} (Expiry time in body)
 * - {{subject}} (Subject line)
 * - {{{message_html}}} (Raw HTML fallback)
 */
export async function sendEmail({
  toEmail,
  toName = 'User',
  subject,
  otp = '',
  htmlContent,
  plainText = '',
  link = '',
  templateId,
}) {
  if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_PUBLIC_KEY) {
    console.warn('[email.service] EmailJS credentials not set in .env. Skipping email delivery.');
    return null;
  }

  const tid = templateId || env.EMAILJS_TEMPLATE_ID;
  if (!tid) {
    console.warn('[email.service] EMAILJS_TEMPLATE_ID not configured. Skipping email.');
    return null;
  }

  // Calculate friendly expiration time (e.g. "2:45 PM")
  const expireDate = new Date(Date.now() + 15 * 60 * 1000);
  const timeFormatted = expireDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Styled HTML container
  const message_html = htmlContent || `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 22px; font-weight: 700; color: #2563eb;">MyTracker</span>
      </div>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">${plainText}</p>
      ${otp ? `
        <div style="margin: 24px 0; text-align: center; background-color: #eff6ff; padding: 18px; border-radius: 10px; border: 1px dashed #3b82f6;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1d4ed8; font-family: monospace;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #64748b;">Valid for 15 minutes until ${timeFormatted}</p>
      ` : ''}
      ${link ? `
        <div style="margin: 24px 0;">
          <a href="${link}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
            Open in MyTracker
          </a>
        </div>
      ` : ''}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Secured with MyTracker · Life Management System</p>
    </div>
  `;

  // Matches all variables across your template
  const templateParams = {
    // 1. Exact variable for To Email in your template: {{email}}
    email: toEmail,
    to_email: toEmail,

    // 2. Exact variable for OTP in your template: {{otp}}
    otp: otp,

    // 3. Exact variable for expiry time in your template: {{time}}
    time: timeFormatted,

    // 4. Exact variable for From Name in your template: {{from_name}}
    from_name: 'MyTracker',

    // 5. Subject & Names
    subject: subject,
    to_name: toName,
    name: toName,

    // 6. Generic HTML & Message fallbacks
    message_html: message_html,
    message: plainText || `Your OTP is: ${otp}`,
    link: link,
  };

  try {
    const options = {
      publicKey: env.EMAILJS_PUBLIC_KEY,
      ...(env.EMAILJS_PRIVATE_KEY && { privateKey: env.EMAILJS_PRIVATE_KEY }),
    };

    const response = await emailjs.send(env.EMAILJS_SERVICE_ID, tid, templateParams, options);
    console.log(`[email.service] Email successfully sent to ${toEmail} (status: ${response.status})`);
    return response;
  } catch (err) {
    console.error('[email.service] Failed to send email via EmailJS:', err?.text || err?.message || err);
    throw err;
  }
}

// ── Pre-built email triggers ──────────────────────────────────────────

export function sendWelcomeEmail(user) {
  return sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: 'Welcome to MyTracker 🎉',
    plainText: `Hi ${user.name}, welcome aboard! Your MyTracker account is ready. Start tracking your tasks, deadlines, job applications, and birthdays today.`,
    link: env.CLIENT_URL,
  });
}

export function sendPasswordResetEmail(user, resetToken) {
  const link = `${env.CLIENT_URL}/reset-password/${resetToken}`;
  return sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: 'Reset your MyTracker password',
    plainText: `Hi ${user.name}, you requested a password reset. Click the button below to set a new password. This link expires in 1 hour.`,
    link: link,
  });
}

export function sendReminderEmail(user, subject, body) {
  return sendEmail({
    toEmail: user.email,
    toName: user.name,
    subject: `⏰ Reminder: ${subject}`,
    plainText: `Hi ${user.name},<br/><br/>${body}`,
    link: env.CLIENT_URL,
  });
}

export function sendOtpEmail(email, name, otp, purpose = 'register') {
  const isLogin = purpose === 'login';
  const actionText = isLogin ? 'log in to' : 'verify your registration for';

  return sendEmail({
    toEmail: email,
    toName: name || 'User',
    otp: otp,
    subject: `Your Verification Code: ${otp}`,
    plainText: `Hi ${name || 'there'},<br/><br/>Your 6-digit OTP to ${actionText} MyTracker is: <strong>${otp}</strong>.`,
  });
}
