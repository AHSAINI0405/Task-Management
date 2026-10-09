import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import * as auth from '../controllers/auth.controller.js';

const router = Router();

// Captcha challenge
router.get('/captcha', auth.getCaptcha);

// OTP-based registration
router.post('/send-register-otp', authLimiter, validate(auth.sendRegisterOtpSchema), auth.sendRegisterOtp);
router.post('/register',          authLimiter, validate(auth.registerSchema),          auth.register);

// OTP-based login
router.post('/send-login-otp',    authLimiter, validate(auth.sendLoginOtpSchema),    auth.sendLoginOtp);
router.post('/login-otp',         authLimiter, validate(auth.loginOtpSchema),         auth.loginOtp);

// Legacy password login (protected with captcha)
router.post('/login',             authLimiter, validate(auth.legacyLoginSchema),      auth.login);

// Session & password reset
router.post('/logout',                verifyAccessToken,                               auth.logout);
router.post('/refresh',               authLimiter,                                     auth.refresh);
router.post('/forgot-password',       authLimiter, validate(auth.forgotPasswordSchema), auth.forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(auth.resetPasswordSchema), auth.resetPassword);
router.get('/me',                     verifyAccessToken,                               auth.getMe);
router.get('/users',                  verifyAccessToken,                               auth.getUsers);

export default router;
