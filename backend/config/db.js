const mongoose = require('mongoose')

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        if (process.env.NODE_ENVIRONMENT === 'development') {
            console.log(`MongoDB connected: ${conn.connection.host}`)
        }
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

module.exports = connectDB