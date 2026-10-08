import { Router } from 'express';
import { validate } from '../middleware/validate.js';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import * as profile from '../controllers/profile.controller.js';

const router = Router();

// All profile routes require authentication
router.use(verifyAccessToken);

router.put('/',         validate(profile.updateProfileSchema),  profile.updateProfile);
router.put('/password', validate(profile.changePasswordSchema), profile.changePassword);

export default router;
