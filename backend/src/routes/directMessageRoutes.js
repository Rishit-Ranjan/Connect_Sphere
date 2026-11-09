// routes/directMessageRoutes.js
import { Router } from 'express';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import multer from 'multer';
import directMessageController from '../controllers/directMessageController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { MESSAGE_MEDIA_DIR } from '../config/uploads.js';

const router = Router();
const allowedMediaTypes = {
  '.jpg': new Set(['image/jpeg']),
  '.jpeg': new Set(['image/jpeg']),
  '.png': new Set(['image/png']),
  '.webp': new Set(['image/webp']),
  '.gif': new Set(['image/gif']),
  '.mp4': new Set(['video/mp4']),
  '.webm': new Set(['video/webm', 'audio/webm']),
  '.mov': new Set(['video/quicktime']),
  '.mp3': new Set(['audio/mpeg']),
  '.wav': new Set(['audio/wav', 'audio/x-wav']),
  '.ogg': new Set(['audio/ogg', 'application/ogg']),
  '.oga': new Set(['audio/ogg', 'application/ogg']),
  '.m4a': new Set(['audio/mp4', 'audio/x-m4a']),
  '.aac': new Set(['audio/aac'])
};
const mediaUpload = multer({
  storage: multer.diskStorage({
    destination: MESSAGE_MEDIA_DIR,
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    }
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    const supportedMimeTypes = allowedMediaTypes[extension];
    const mimeType = file.mimetype.toLowerCase().split(';', 1)[0].trim();
    if (!supportedMimeTypes?.has(mimeType)) {
      const error = new Error('Choose a supported image, video, or audio file.');
      error.statusCode = 400;
      callback(error);
      return;
    }
    file.mimetype = mimeType;
    callback(null, true);
  }
});
const handleMediaUpload = (req, res, next) => {
  mediaUpload.single('attachment')(req, res, (error) => {
    if (error?.code === 'LIMIT_FILE_SIZE') error.statusCode = 413;
    next(error);
  });
};

router.get('/', protect, directMessageController.getDirectMessages);
router.get('/:messageId/media', protect, directMessageController.getDirectMessageMedia);
router.post('/', protect, handleMediaUpload, directMessageController.createDirectMessage);

export default router;