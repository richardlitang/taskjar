const express = require('express')
const router = express.Router()
const {
  registerUser,
  loginUser,
  getMe,
  getTasks,
  updateTasks
} = require('../controllers/userController')
// const { protect } = require('../middleware/authMiddleware')

router.route('/register').post(registerUser)
router.route('/login').post(loginUser)
router.route('/me').get(getMe)
router.route('/:id/goals').put(updateUser)

module.exports = router