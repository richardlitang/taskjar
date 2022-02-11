const express = require('express')
const router = express.Router()
const {
  getTask,
  addTask,
  // updateTask,
  // deleteTask,
} = require('../controllers/taskController')

router.route('/').get(getTask).post(addTask)

module.exports = router