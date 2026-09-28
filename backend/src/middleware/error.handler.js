/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const { errorResponse } = require('../configs/app.response');
const logger = require('./winston.logger');

// 404 - not found error handler
// eslint-disable-next-line no-unused-vars
exports.notFoundRoute = (_req, res, _next) => {
  res.status(404).json(errorResponse(
    4,
    'UNKNOWN ACCESS',
    'Sorry! Your request url was not found.'
  ));
};

// Map an error to the correct HTTP status: client mistakes are 4xx, not 500
const getStatus = (err) => {
  if (err && err.name === 'MulterError') {
    return err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
  }
  const status = err && (err.status || err.statusCode);
  if (Number.isInteger(status) && status >= 400 && status < 600) {
    return status;
  }
  return 500;
};

// Fixed, safe messages for client errors - never the raw library/parser message
const getClientMessage = (err, status) => {
  if (err.type === 'entity.parse.failed') return 'Invalid JSON in request body.';
  if (status === 413) return 'Request body or uploaded file is too large.';
  if (err.name === 'MulterError') return 'Invalid file upload request.';
  if (err.expose === true && typeof err.message === 'string') return err.message;
  return 'Bad request.';
};

// Central error handler
// SECURITY (OWASP A10 / CWE-209): log full details on the server,
// send only a correct status code and a safe message to the client.
exports.errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next('Something went wrong. App server error.');
  }

  const status = getStatus(err);
  const where = `${req.method} ${req.originalUrl} from ${req.ip}`;

  if (status >= 500) {
    logger.error(`[${status}] ${where} - ${(err && (err.stack || err.message)) || err}`);
    return res.status(status).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      'Something went wrong. Please try again later.'
    ));
  }

  // 4xx: not a server bug, but may be an attack attempt - keep a record
  logger.warn(`[${status}] ${where} - ${err.message}`);
  return res.status(status).json(errorResponse(
    1,
    'FAILED',
    getClientMessage(err, status)
  ));
};