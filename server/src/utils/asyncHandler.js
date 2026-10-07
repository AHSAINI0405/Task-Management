/**
 * Wraps an async Express route handler and forwards any rejected
 * promise to the next() error-handling middleware.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
