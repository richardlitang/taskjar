const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      isAdmin: user.isAdmin,
      isPremium: user.isPremium
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: '30d'
    }
  )
}

const loginUser = asyncHandler(async(req, res) => {
  const {email, password} = req.body

  const user = await User.findOne({email})

  if (user && (await bcrypt.compare(password, user.password))) {
    res.status(200).json({
      _id: user._id,
      email: user.email,
      token: generateToken(user._id, user.isAdmin, user.isPremium)
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
      token: generateToken(newUser._id)
    })
  } else {
    res.status(400)
    throw new Error('Invalid data')
  }
})

const getMe = asyncHandler(async(req, res) => {
  const {_id, email, isAdmin, isPremium, tasks} = await User.findById(req.user.id)

  res.status(200).json({
    id: _id,
    email,
    isAdmin,
    isPremium,
    tasks
  })
})

// const getTasks = asyncHandler(async(req,res) => {
//   const {_id, tasks} = await User.findById(req.user.id)

//   res.status(200).json({
//     tasks: tasks
//   })
// })


//add some error catching
const updateUserTasks = asyncHandler(async(req,res) => {
  const user = await User.findById(req.user.id)
  
  const newTasks = [...user.tasks, req.body.tasks]

  user.tasks = newTasks
  
  const updatedUser = await User.findByIdAndUpdate(user._id, user, {new: true})

  res.status(200).json({
    message: updatedUser.tasks
  })
})

const getUserTasks = asyncHandler(async(req,res) => {
  const user = await User.findById(req.user.id)
  
  const tasks = await user.tasks

  res.status(200).json({
    tasks
  })
})

module.exports = {
  getMe,
  loginUser,
  registerUser,
  getUserTasks,
  updateUserTasks
}