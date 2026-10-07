export class ApiResponse {
  /**
   * @param {number} statusCode
   * @param {*}      data
   * @param {string} message
   */
  constructor(statusCode = 200, data = null, message = 'Success') {
    this.statusCode = statusCode;
    this.success    = statusCode < 400;
    this.message    = message;
    this.data       = data;
  }
}
