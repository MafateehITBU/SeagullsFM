import multer from 'multer';
import path from 'path';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for FileCenter - accepts various file types
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedFileTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
    
    // Spreadsheets
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    
    // Presentations
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/svg+xml',
    'image/webp',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/x-tar',
    'application/gzip',
    
    // Code files
    'text/javascript',
    'application/javascript',
    'text/typescript',
    'text/x-python',
    'text/x-java-source',
    'text/x-c++src',
    'text/x-csrc',
    'text/html',
    'text/css',
    'application/json',
    'application/xml',
    
    // Media files
    'video/mp4',
    'audio/mpeg',
    'audio/wav',
    'video/avi',
    'video/quicktime'
  ];

  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed!`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

export default upload; 