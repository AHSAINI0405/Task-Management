export class ApiError extends Error {
  /**
   * @param {number}   statusCode  HTTP status code
   * @param {string}   message     Human-readable message
   * @param {string[]} errors      Validation / field errors
   */
  constructor(statusCode = 500, message = 'Something went wrong', errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.message    = message;
    this.errors     = errors;
    this.success    = false;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}
