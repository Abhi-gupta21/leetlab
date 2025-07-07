import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { executeCode } from '../controllers/executeCode.controller.js'

const executionRouter = express.Router()

executionRouter.post('/', authMiddleware, executeCode)

export default executionRouter