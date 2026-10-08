import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { getDashboard } from '../controllers/dashboard.controller.js';

const dashRouter = Router();
dashRouter.use(verifyAccessToken);
dashRouter.get('/', getDashboard);

export default dashRouter;
