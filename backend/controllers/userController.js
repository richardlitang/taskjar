const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const getToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: '30d'
  })
}

const loginUser = asyncHandler(async(req, res) => {
  const {email, password} = req.body

  const user = await User.findOne({email})

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: getToken(user._id)
    })
  } else {
    res.status(400) 
    throw new Error('Invalid email or password')
  }
})

const registerUser = asyncHandler(async(req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400)
    throw new Error('Incomplete credentials')
  }

  const existingUser = await User.findOne({email})

  if (existingUser) {
    res.status(400) 
    throw new Error('Email is already registered')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(password, salt)

  const newUser = await User.create({
    email,
    password: hashedPassword
  })

  if (newUser) {
    res.status(200).json({
      _id: newUser.id,
      email: newUser.email,
      token: getToken(newUser._id)
    })
  } else {
    res.status(400)
    throw new Error('Invalid data')
  }
})

//Does not work yet
const getMe = asyncHandler(async(req, res) => {
  const {_id, email} = await User.findById(req.user.id)

  res.status(200).json({
    id: _id,
    email
  })

  throw new Error(`${req.user}`)
  
})

const getTasks = asyncHandler(async(req,res) => {
  const {_id, tasks} = await User.findById(req.user.id)

  res.status(200).json({
    tasks: tasks
  })
})

const addTask = asyncHandler(async(req,res) => {
  const {newTasks} = req.body
  const {_id, tasks} = await User.findById(req.user.id)

  res.status(200).json({
    tasks: [...tasks, newTasks]
  })
})


module.exports = {
  getMe,
  loginUser,
  registerUser
}