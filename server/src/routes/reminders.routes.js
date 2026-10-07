import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import * as reminders from '../controllers/reminders.controller.js';

const router = Router();

router.use(verifyAccessToken);

router.get('/',    reminders.getReminders);
router.post('/',   validate(reminders.createReminderSchema), reminders.createReminder);
router.put('/:id', validate(reminders.updateReminderSchema), reminders.updateReminder);
router.delete('/:id',                                        reminders.deleteReminder);

export default router;
