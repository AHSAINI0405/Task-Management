import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import * as events from '../controllers/events.controller.js';

const router = Router();

router.use(verifyAccessToken);

router.get('/upcoming', events.getUpcomingEvents);

router.get('/',    events.getEvents);
router.post('/',   validate(events.createEventSchema), events.createEvent);
router.get('/:id', events.getEvent);
router.put('/:id', validate(events.updateEventSchema), events.updateEvent);
router.delete('/:id',                                  events.deleteEvent);

export default router;
