import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { getDashboard }    from '../controllers/dashboard.controller.js';
import { getCalendarItems } from '../controllers/calendar.controller.js';

const dashRouter = Router();
dashRouter.use(verifyAccessToken);
dashRouter.get('/', getDashboard);

const calRouter = Router();
calRouter.use(verifyAccessToken);
calRouter.get('/', getCalendarItems);

export { dashRouter, calRouter };
