import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import User from '../models/User.model.js';
import { env } from '../config/env.js';

export const verifyAccessToken = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer ', '');

  if (!token) throw new ApiError(401, 'Unauthorised — no token provided');

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Unauthorised — invalid or expired token');
  }

  const user = await User.findById(decoded._id).select('-passwordHash -refreshTokenHash -passwordResetToken');
  if (!user || !user.isActive) throw new ApiError(401, 'Unauthorised — user not found');

  req.user = user;
  next();
});
