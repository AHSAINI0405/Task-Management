import emailjs from '@emailjs/nodejs';
import { env } from '../config/env.js';

/**
 * Send an email via EmailJS Node SDK using your existing universal template.
 * Matches your template variables: {{subject}}, {{to_email}}, and {{{message_html}}}
 */
export async function sendEmail({ toEmail, toName = 'User', subject, htmlContent, plainText = '', link = '', templateId }) {
  if (!env.EMAILJS_SERVICE_ID || !env.EMAILJS_PUBLIC_KEY) {
    console.warn('[email.service] EmailJS credentials not set in .env. Skipping email delivery.');
    return null;
  }

  const tid = templateId || env.EMAILJS_TEMPLATE_ID;
  if (!tid) {
    console.warn('[email.service] EMAILJS_TEMPLATE_ID not configured. Skipping email.');
    return null;
  }

  // Generates styled HTML wrapped in a clean container
  const message_html = htmlContent || `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="margin-bottom: 20px;">
        <span style="font-size: 20px; font-weight: 700; color: #2563eb;">MyTracker</span>
      </div>
      <p style="font-size: 15px; color: #334155; line-height: 1.6;">${plainText}</p>
      ${link ? `
        <div style="margin: 24px 0;">
          <a href="${link}" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600; display: inline-block;">
            Open in MyTracker
          </a>
        </div>
      ` : ''}
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">This email was sent by your personal MyTracker life planner.</p>
    </div>
  `;

  const templateParams = {
    to_email: toEmail,
    to_name: toName,
    subject: subject,
    // Exact variable used in your EmailJS template (Image 1: {{{message_html}}})
    message_html: message_html,
    // Fallback variables in case template is configured differently
    message: plainText || htmlContent,
    link: link,
    from_name: 'MyTracker',
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
    plainText: `Hi ${user.name}, you requested a password reset. Click the button below to set a new password. This link expires in 1 hour. If you did not request this, you can safely ignore this email.`,
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
