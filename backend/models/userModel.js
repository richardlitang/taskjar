const mongoose = require('mongoose')

const userSchema = mongoose.Schema(
    {
        name: {
            type: String
        },
        email: {
            type: String, 
            require: true
        },
        password: {
            type: String,
            require: true
        },
        isAdmin: {
            type: Boolean,
            default: false,
            require: true
        },
        isPremium: {
            type: Boolean,
            default: false,
            require: true
        },
        isBlocked: {
            type: Boolean,
            default: false,
            require: true
        },
        tasks: [
            {
                type: String
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('User', userSchema)