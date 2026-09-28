/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */
const currentDateTime = require('../lib/current.date.time');
const logger = require('../middleware/winston.logger');

// What the client sees whenever the real error is not a developer-written string
const GENERIC_ERROR_MESSAGE = 'Something went wrong. Please try again later.';

/**
 * Turn any error value into one line for the server log.
 * Keeps the stack trace and, for HTTP client libraries such as SendGrid,
 * the upstream response body (headers are NOT logged).
 */
const describeError = (error) => {
  if (error instanceof Error) {
    const upstream = error.response && error.response.body
      ? ` | upstream response: ${JSON.stringify(error.response.body)}`
      : '';
    return `${error.stack || error.message}${upstream}`;
  }
  try {
    return JSON.stringify(error);
  } catch (e) {
    return String(error);
  }
};

/**
 * function to all API same formatted success response provider
 * @param {Number} resultCode API response defined custom result_code
 * @param {String} title API response title based on result_code
 * @param {String} message API response your defined message
 * @param {*} data Send any kind of data in API response
 * @param {*} maintenance API provide any kind of maintenance information
 * @returns success response return for all API's
 */
exports.successResponse = (resultCode, title, message, data, maintenance) => ({
  result_code: resultCode,
  time: currentDateTime(),
  maintenance_info: maintenance || null,
  result: {
    title, message, data
  }
});

/**
 * function to all API same formatted error response provider
 * SECURITY (OWASP A10 / CWE-209): only developer-written string messages are sent
 * to the client. Error objects and library errors (Mongoose, SendGrid, ...) are
 * logged in full on the server and replaced with a generic message.
 * @param {Number} resultCode API response defined custom result_code
 * @param {String} title API response title based on result_code
 * @param {*} error Developer-written message (string) or an error object
 * @param {*} maintenance API provide any kind of maintenance information
 * @returns error response return for all API's
 */
exports.errorResponse = (resultCode, title, error, maintenance) => {
  let clientError = error;

  if (typeof error !== 'string') {
    logger.error(`[${title}] ${describeError(error)}`);
    clientError = GENERIC_ERROR_MESSAGE;
  }

  return {
    result_code: resultCode,
    time: currentDateTime(),
    maintenance_info: maintenance || null,
    result: {
      title, error: clientError
    }
  };
};