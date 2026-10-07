import cron from 'node-cron';
import { processReminders }       from './reminders.job.js';
import { refreshBirthdayReminders } from './birthday.job.js';

let remindersTask;
let birthdayTask;

export function startScheduler() {
  // Every minute: check for due reminders
  remindersTask = cron.schedule('* * * * *', async () => {
    try {
      await processReminders();
    } catch (err) {
      console.error('[scheduler] reminders error:', err.message);
    }
  });

  // Every day at 00:05 UTC: refresh birthday/event next-occurrences & reminders
  birthdayTask = cron.schedule('5 0 * * *', async () => {
    try {
      await refreshBirthdayReminders();
    } catch (err) {
      console.error('[scheduler] birthday refresh error:', err.message);
    }
  });

  console.log('✅  Scheduler started (reminders: every minute | birthdays: 00:05 UTC)');
}

export function stopScheduler() {
  remindersTask?.stop();
  birthdayTask?.stop();
  console.log('Scheduler stopped');
}
