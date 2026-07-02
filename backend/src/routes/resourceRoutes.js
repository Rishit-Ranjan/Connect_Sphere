// resourceRoutes.js
import { Router } from 'express';
import { getResources, createResource, deleteResource, incrementDownloads } from '../controllers/resourceController';
import { protect } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', protect, getResources);
router.post('/', protect, createResource);
router.delete('/:resourceId', protect, deleteResource);
router.patch('/:resourceId/download', protect, incrementDownloads);

export default router;