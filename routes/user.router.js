// user.router.js
const express = require('express');
const bodyParser = require('body-parser');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// User login route
router.post('/login', userController.login);


router.post('/create',authMiddleware.verifyToken, userController.createUser);

router.get('/',authMiddleware.verifyToken, userController.allUsers);
// Get current user info
router.get('/me', authMiddleware.verifyToken, userController.getCurrentUser);

router.get('/logout', authMiddleware.verifyToken, userController.logout);

router.get('/:id',authMiddleware.verifyToken, userController.getUserById);
// Delete user
router.delete('/:id', authMiddleware.verifyToken, userController.deleteUser);

// Update user
router.put('/:id', authMiddleware.verifyToken, userController.updateUserById);


module.exports = router;
