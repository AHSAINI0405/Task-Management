import Event    from '../models/Event.model.js';
import Reminder from '../models/Reminder.model.js';
import { getNextYearlyOccurrence, addDays } from '../utils/timezone.js';

/**
 * Called nightly by the scheduler.
 * For every repeating event, recomputes nextOccurrence and
 * upserts the 3 reminder documents (7d, 1d, 0d before).
 *
 * Safe to run multiple times — unique index on Reminder prevents duplicates.
 */
export async function refreshBirthdayReminders() {
  const events = await Event.find({ repeatsYearly: true });
  console.log(`[birthday.job] Refreshing reminders for ${events.length} yearly event(s)`);

  let updated = 0;

  for (const event of events) {
    try {
      const next = getNextYearlyOccurrence(event.date, 'UTC');

      // Persist nextOccurrence so queries can filter on it
      if (!event.nextOccurrence || event.nextOccurrence.getTime() !== next.getTime()) {
        event.nextOccurrence = next;
        await event.save();
      }

      // Upsert the 3 reminders (7 days, 1 day, day-of)
      const offsets = [
        { days: 7, label: '7 days'  },
        { days: 1, label: '1 day'   },
        { days: 0, label: 'today'   },
      ];

      for (const { days, label } of offsets) {
        const fireAt  = addDays(next, -days);
        const message = `${event.title} is ${label === 'today' ? 'today' : `in ${label}`}! 🎉`;

        await Reminder.findOneAndUpdate(
          {
            userId:  event.userId,
            refType: 'Event',
            refId:   event._id,
            fireAt,
          },
          {
            $setOnInsert: {
              userId:  event.userId,
              refType: 'Event',
              refId:   event._id,
              fireAt,
              message,
              channel: 'both',
              sent:    false,
            },
          },
          { upsert: true },
        );
      }

      // Remove old sent reminders from past years to keep the collection lean
      await Reminder.deleteMany({
        refId:  event._id,
        refType: 'Event',
        sent:   true,
        fireAt: { $lt: addDays(next, -8) },
      });

      updated++;
    } catch (err) {
      console.error(`[birthday.job] Error on event ${event._id}: ${err.message}`);
    }
  }

  console.log(`[birthday.job] Done — ${updated}/${events.length} events refreshed`);
}
