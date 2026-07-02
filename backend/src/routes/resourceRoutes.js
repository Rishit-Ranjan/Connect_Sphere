// resourceRoutes.js
import { Router } from 'express';
import resourceController from '../controllers/resourceController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', protect, resourceController.getResources);
router.post('/', protect, resourceController.createResource);
router.delete('/:resourceId', protect, resourceController.deleteResource);
router.patch('/:resourceId/download', protect, resourceController.incrementDownloads);

export default router;