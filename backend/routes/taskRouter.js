const express = require('express')
const router = express.Router()
const {
  getTasks,
  addTask,
  getOneTask,
  // updateTask,
  // deleteTask,
} = require('../controllers/taskController')
const { requireAuth } = require('../middleware/authMiddleware')

router.route('/all').get(getTasks)
router.route('/').get(getOneTask).post(addTask)

module.exports = router