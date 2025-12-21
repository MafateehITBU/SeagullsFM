import multer from 'multer';
import path from 'path';

// Configure multer for audio/video upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for audio and video files
const fileFilter = (req, file, cb) => {
  // Define allowed audio and video file types
  const allowedTypes = [
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/aac',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'audio/m4a',
    // Video
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // avi
    'video/webm',
    'video/ogg',
    'video/x-matroska', // mkv
    'video/3gpp',
    'video/x-flv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed! Allowed types: mp3, wav, aac, ogg, mp4, mov, avi, webm, mkv, 3gp, flv`), false);
  }
};

const uploadVideo = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for audio/video files
  }
});

export default uploadVideo;

