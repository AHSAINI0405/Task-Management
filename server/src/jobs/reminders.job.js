import Reminder from '../models/Reminder.model.js';
import User     from '../models/User.model.js';
import { sendReminderEmail } from '../services/email.service.js';
import { sendPushToUser }    from '../services/push.service.js';

/**
 * Called by the scheduler every minute.
 * Finds all unsent reminders whose fireAt is <= now,
 * sends them, and marks them sent.
 */
export async function processReminders() {
  const now  = new Date();

  // Grab up to 100 due reminders per run to avoid flooding
  const reminders = await Reminder.find({
    sent:   false,
    fireAt: { $lte: now },
  })
    .limit(100)
    .populate('userId', 'name email timezone notifyByEmail notifyByPush pushSubscriptions');

  if (!reminders.length) return;

  console.log(`[reminders.job] Processing ${reminders.length} reminder(s)`);

  await Promise.allSettled(
    reminders.map((reminder) => deliverReminder(reminder)),
  );
}

async function deliverReminder(reminder) {
  const user = reminder.userId; // populated
  if (!user) {
    await markFailed(reminder, 'User not found');
    return;
  }

  const subject = reminder.message || 'You have a reminder';
  const errors  = [];

  // Email
  if ((reminder.channel === 'email' || reminder.channel === 'both') && user.notifyByEmail) {
    try {
      await sendReminderEmail(user, subject, reminder.message || subject);
    } catch (err) {
      errors.push(`email: ${err.message}`);
    }
  }

  // Push
  if ((reminder.channel === 'push' || reminder.channel === 'both') && user.notifyByPush) {
    try {
      await sendPushToUser(user, {
        title: 'MyTracker Reminder',
        body:  reminder.message || subject,
        url:   '/',
      });
    } catch (err) {
      errors.push(`push: ${err.message}`);
    }
  }

  if (errors.length) {
    await markFailed(reminder, errors.join('; '));
  } else {
    reminder.sent   = true;
    reminder.sentAt = new Date();
    await reminder.save();
  }
}

async function markFailed(reminder, reason) {
  reminder.failed    = true;
  reminder.failReason = reason;
  reminder.sent      = true; // mark sent to avoid infinite retry
  await reminder.save();
  console.error(`[reminders.job] Failed reminder ${reminder._id}: ${reason}`);
}
