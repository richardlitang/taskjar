const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const requireAuth = asyncHandler(async (req, res, next) => {
    const auth = req.headers.authorization

    if (auth && (auth.startsWith('Bearer'))) {
        try {
            const token = auth.split(' ')[1]

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.user = await User.findById(decoded._id).select('-password')

            next()
        } catch (error) {
            res.status(401)
            throw new Error('You are unauthorized')
        }
    }

    if (!auth) {
        res.status(401)
        throw new Error('You are unauthorized, please log-in.')
    }
})

module.exports = { requireAuth }