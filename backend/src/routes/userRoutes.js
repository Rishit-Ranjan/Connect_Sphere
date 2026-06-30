const express = require('express');
const { getMe, getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/me', protect, getMe);
router.get('/', protect, getUsers);
router.patch('/:userId/role', protect, updateUserRole);
router.delete('/:userId', protect, deleteUser);

module.exports = router;