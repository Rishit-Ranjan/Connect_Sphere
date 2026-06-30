// resourceRoutes.js
const express = require('express');
const {
  getResources,
  createResource,
  deleteResource,
  incrementDownloads
} = require('../controllers/resourceController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getResources);
router.post('/', protect, createResource);
router.delete('/:resourceId', protect, deleteResource);
router.patch('/:resourceId/download', protect, incrementDownloads);

module.exports = router;