import { ApiError } from '../utils/ApiError.js';

/**
 * Returns Express middleware that validates req.body against a Zod schema.
 * On failure, throws a 422 ApiError with field-level messages.
 *
 * Usage:
 *   router.post('/login', validate(loginSchema), authController.login)
 */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (result.success) {
    req.body = result.data; // Use the parsed/coerced data
    return next();
  }
  const errors = result.error.errors.map(
    (e) => `${e.path.join('.')}: ${e.message}`,
  );
  next(new ApiError(422, 'Validation failed', errors));
};
