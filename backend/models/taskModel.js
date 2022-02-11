const mongoose = require('mongoose')

const taskSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true
        },
        description: {
            type: String
        },
        duration: {
            type: Number
        },
        upvotes : {
            type: Number
        },
        tags: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Tag"
            }
        ]
    }
)

module.exports = mongoose.model('Task', taskSchema)