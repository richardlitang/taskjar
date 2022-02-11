const asyncHandler = require('express-async-handler')

const Task = require('../models/taskModel')

const getTask = asyncHandler(async (req, res) => {
    const tasks = await Task.find()

    res.status(200).json(tasks)
})

const addTask = asyncHandler(async (req, res) => {
    if (!req.body.name) {
        res.status(400)
        throw new Error("Can't add an empty Task.")
    }

    const task = await Task.create({
        name: req.body.name,
        description: req.body.description,
        duration: req.body.duration,
        upvotes: 0,
        tags: [req.body.tags]
    })

    const addTag = await 

    res.status(200).json(task)
})

// const updateTask = asyncHandler(async (req, res) => {
//     const task = await Task.findById(req.params.id)
  
//     if (!task) {
//       res.status(400)
//       throw new Error('Task not found')
//     }
  
//     const user = await User.findById(req.user.id)

//     if (!user) {
//       res.status(401)
//       throw new Error('User not found')
//     }
  
//     if (task.user.toString() !== user.id) {
//       res.status(401)
//       throw new Error('User not authorized')
//     }
  
//     const updatedTask = await task.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//     })
  
//     res.status(200).json(updatedTask)
//   })



module.exports = {
    getTask,
    addTask
}