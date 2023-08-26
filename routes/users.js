const router = require('express').Router();
const {
  getUsers, getCurrentUser, getUserById, updateUser, updateUserAvatar,
} = require('../controllers/users');
const { validateUserId, validateUserUpdate, validateUpdateUserAvatar } = require('../utils/validation/requestValidation');

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:userId', validateUserId, getUserById);

router.patch('/me', validateUserUpdate, updateUser);
router.patch('/me/avatar', updateUserAvatar, validateUpdateUserAvatar);

module.exports = router;
