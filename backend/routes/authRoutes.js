const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register,
  login,
  getUserProfile,
  updateUserProfile
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

module.exports = router;