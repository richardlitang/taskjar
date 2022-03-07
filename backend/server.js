const express = require('express')
const dotenv = require('dotenv').config()
const PORT = process.env.PORT
const connectDB = require('./config/db')
const cors = require('cors');

connectDB()

const app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/tasks', require('./routes/taskRouter'))
app.use('/api/tags', require('./routes/tagRouter'))
app.use('/api/user', require('./routes/userRouter'))

// app.get('/', (req, res) => {
//     res.send("Hello world")
// })

app.listen(PORT, () => {
    console.log("I'm listening bitch")
})
