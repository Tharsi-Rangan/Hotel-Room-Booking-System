/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const sgMail = require('@sendgrid/mail');
const { successResponse, errorResponse } = require('./app.response');
const logger = require('../middleware/winston.logger');

const sendEmail = async (res, user, url, subjects, message, title) => {
  sgMail.setApiKey(process.env.SEND_GRID_API_KEY);

  const msg = {
    to: user.email,
    from: process.env.SEND_SENDER_MAIL,
    subject: subjects,
    text: message,
    html: `<div>
      <h4>${title}</h4>
      <a href="${url}" target="_blank"> >>> Click Here</a>
    </div>`
  };

  await sgMail.send(msg).then(() => {
    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      'Email sent successfully. Please check your inbox.'
    ));
  }).catch(async (error) => {
    // SECURITY (OWASP A10 / CWE-209): log the real provider error on the server only.
    // Response headers are not logged; user is identified by id, not email (PII).
    const upstream = error.response && error.response.body
      ? ` | upstream response: ${JSON.stringify(error.response.body)}`
      : '';
    logger.error(`[SendGrid] email send failed for user ${user._id}: ${error.message}${upstream}`);

    // eslint-disable-next-line no-param-reassign
    user.resetPasswordToken = undefined;
    // eslint-disable-next-line no-param-reassign
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      'Unable to send email right now. Please try again later.'
    ));
  });
};

module.exports = sendEmail;