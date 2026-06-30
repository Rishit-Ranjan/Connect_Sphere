// noticeRoutes.js
const express = require('express');
const { getNotices, createNotice, deleteNotice } = require('../controllers/noticeController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', protect, getNotices);
router.post('/', protect, createNotice);
router.delete('/:noticeId', protect, deleteNotice);

module.exports = router;