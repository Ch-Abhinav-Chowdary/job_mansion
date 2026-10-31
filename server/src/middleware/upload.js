const multer = require('multer');
const ApiError = require('../utils/apiError');

// Memory storage keeps file buffer in memory for direct Cloudinary upload
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPG, PNG, and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter,
});

// Wrapper to handle Multer errors cleanly and return friendly JSON
const handleSingleUpload = (fieldName = 'image') => {
  const single = upload.single(fieldName);
  return (req, res, next) => {
    single(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'Image file size exceeds the 2 MB limit'));
        }
        return next(new ApiError(400, `Upload error: ${err.message}`));
      }
      if (err) {
        return next(err);
      }
      next();
    });
  };
};

module.exports = {
  upload,
  handleSingleUpload,
};
