const express = require("express")

const dotenv = require("dotenv")
dotenv.config()

console.log("JWT:", process.env.JWT_SECRET);
console.log("DB:", process.env.MONGODB_URI);


const connectDB = require("./config/db")


// const app = express()
// connectDB();

// app.use(express.json())

// //routes
// app.use("/auth", require("./routes/authRoutes"));
// app.use("/posts", require("./routes/postRoutes"));


const app = express()
connectDB();
app.use(express.json())

//routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/posts", require("./routes/postRoutes"));



app.listen(process.env.PORT, () => {
    console.log(`http://localhost:${process.env.PORT} is running`)
})