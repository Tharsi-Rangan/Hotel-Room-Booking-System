/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const multer = require('multer');
const appRoot = require('app-root-path');
const { imageDiskStorage, isAllowedImage } = require('../lib/image.upload.storage');

const storage = imageDiskStorage(`${appRoot}/public/uploads/users`);

// prepare the final multer upload object
const avatarUpload = multer({
  storage,
  limits: {
    fileSize: 1000000 // 1MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'avatar') {
      if (isAllowedImage(file)) {
        cb(null, true);
      } else {
        cb(new Error('Only .jpg, .png or .jpeg format allowed!'));
      }
    } else {
      cb(new Error('There was an unknown error!'));
    }
  }
});

module.exports = avatarUpload;
