const express = require('express')
const router = express.Router()
const {
  getTag,
  addTag,
  // updateTag,
  // deleteTag,
} = require('../controllers/tagController')

router.route('/').get(getTag).post(addTag)

module.exports = router