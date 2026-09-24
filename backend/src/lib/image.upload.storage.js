const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['image/jpg', 'image/jpeg', 'image/png'];

// file signatures (magic bytes) of the allowed image types
const IMAGE_SIGNATURES = [
  { ext: '.jpg', bytes: [0xff, 0xd8, 0xff] },
  { ext: '.png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }
];

const detectImageExtension = (buffer) => {
  const match = IMAGE_SIGNATURES.find(({ bytes }) => bytes.every((byte, i) => buffer[i] === byte));
  return match ? match.ext : null;
};

// first check on the client-supplied name and MIME type, before the file is read
const isAllowedImage = (file) => ALLOWED_EXTENSIONS.includes(path.extname(file.originalname).toLowerCase())
  && ALLOWED_MIME_TYPES.includes(file.mimetype);

// multer storage engine that saves a file only if its real content is a JPEG or PNG image
const imageDiskStorage = (folder) => ({
  _handleFile(_req, file, cb) {
    const chunks = [];

    file.stream.on('data', (chunk) => chunks.push(chunk));
    file.stream.on('error', cb);
    file.stream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const fileExt = detectImageExtension(buffer);

      if (!fileExt) {
        return cb(new Error('Only .jpg, .png or .jpeg format allowed!'));
      }

      // the server names the file, so the client cannot choose its name or extension
      const filename = `${crypto.randomUUID()}${fileExt}`;
      const filePath = path.join(folder, filename);

      fs.mkdirSync(folder, { recursive: true });
      fs.writeFile(filePath, buffer, { flag: 'wx' }, (err) => {
        if (err) { return cb(err); }
        cb(null, {
          destination: folder, filename, path: filePath, size: buffer.length
        });
      });
    });
  },

  _removeFile(_req, file, cb) {
    fs.unlink(file.path, cb);
  }
});

module.exports = { imageDiskStorage, isAllowedImage };
