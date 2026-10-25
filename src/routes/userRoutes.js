const express = require('express');
const router = express.Router();

const {
    registerUser,
    loginUser,
    getUserProfile,
    getAllUsers,
    updatePassword,
    updateUserRole
} = require('../controllers/userController');

const {
    protect,
    adminOnly
} = require('../middlewares/authMiddleware');

// Public authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected profile route
router.get('/profile', protect, getUserProfile);

// Admin-only route
router.get('/', protect, adminOnly, getAllUsers);
router.put('/update-password', protect, updatePassword);
router.put('/:id/role', protect, adminOnly, updateUserRole);
module.exports = router;