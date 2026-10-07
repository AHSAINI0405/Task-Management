import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import * as auth from '../controllers/auth.controller.js';

const router = Router();

router.post('/register',              authLimiter, validate(auth.registerSchema),      auth.register);
router.post('/login',                 authLimiter, validate(auth.loginSchema),         auth.login);
router.post('/logout',                verifyAccessToken,                               auth.logout);
router.post('/refresh',               authLimiter,                                     auth.refresh);
router.post('/forgot-password',       authLimiter, validate(auth.forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(auth.resetPasswordSchema), auth.resetPassword);
router.get('/me',                     verifyAccessToken,                               auth.getMe);
router.get('/users',                  verifyAccessToken,                               auth.getUsers);

export default router;
