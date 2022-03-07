const mongoose = require('mongoose')

const tagSchema = mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            unique: true
        },
        slug: {
            type: String,
            unique: true
        }
    }
)

module.exports = mongoose.model('Tag', tagSchema)