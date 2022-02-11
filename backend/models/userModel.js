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
        tasks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Task"
            }
        ]
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('User', userSchema)