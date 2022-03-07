const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  getMe,
  getUserTasks,
  updateUserTasks
} = require('../controllers/userController')
const { requireAuth } = require('../middleware/authMiddleware')

//test
router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/me').get(requireAuth, getMe)
router.route('/tasks').put(requireAuth, updateUserTasks).get(requireAuth, getUserTasks)

module.exports = router