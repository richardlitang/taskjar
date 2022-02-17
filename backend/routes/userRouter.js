const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  getMe,
  // getTasks,
  updateUserTasks
} = require('../controllers/userController')
const { requireAuth } = require('../middleware/authMiddleware')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/me').get(requireAuth, getMe)
router.route('/tasks').put(requireAuth, updateUserTasks)

module.exports = router