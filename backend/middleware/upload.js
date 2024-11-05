// middleware/upload.js
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/awsConfig');
const path = require('path');

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Invalid file type, only images are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read', // Adjust according to your needs
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      cb(null, `products/${Date.now().toString()}${path.extname(file.originalname)}`);
    },
  }),
});

module.exports = upload;
