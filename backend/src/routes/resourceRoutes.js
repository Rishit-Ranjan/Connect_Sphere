// resourceRoutes.js
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { Router } from 'express';
import multer from 'multer';
import resourceController from '../controllers/resourceController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { UPLOADS_DIR } from '../config/uploads.js';

const router = Router();
const allowedTypes = {
  '.pdf': new Set(['application/pdf']),
  '.zip': new Set(['application/zip', 'application/x-zip-compressed']),
  '.epub': new Set(['application/epub+zip', 'application/zip']),
  '.pptx': new Set(['application/vnd.openxmlformats-officedocument.presentationml.presentation']),
  '.docx': new Set(['application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
};
const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
    }
  }),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const extension = extname(file.originalname).toLowerCase();
    const supportedMimeTypes = allowedTypes[extension];
    if (!supportedMimeTypes || !supportedMimeTypes.has(file.mimetype.toLowerCase())) {
      const error = new Error('Choose a supported PDF, ZIP, EPUB, PPTX, or DOCX file.');
      error.statusCode = 400;
      callback(error);
      return;
    }
    callback(null, true);
  }
});

const handleUpload = (req, res, next) => {
  upload.single('file')(req, res, (error) => {
    if (error?.code === 'LIMIT_FILE_SIZE') {
      error.statusCode = 413;
    }
    next(error);
  });
};

router.get('/', protect, resourceController.getResources);
router.post('/', protect, handleUpload, resourceController.createResource);
router.delete('/:resourceId', protect, resourceController.deleteResource);
router.get('/:resourceId/file', protect, resourceController.downloadResource);

export default router;