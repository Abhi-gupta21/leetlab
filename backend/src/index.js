import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import executionRoutes from "./routes/executeCode.routes.js";
import cookieParser from "cookie-parser"

dotenv.config();

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))

app.get("/", (req, res) => {
    res.send("Hello guys welcome to leetlab!🔥")
})

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/problems", problemRoutes)
app.use("/api/v1/execute-code", executionRoutes)

app.listen(process.env.PORT, () => {
    console.log("server is running on",process.env.PORT)
})