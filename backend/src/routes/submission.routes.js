import express from 'express'
import { authMiddleware } from '../middleware/auth.middleware.js'
import { getAllSubmissions, getSubmissionForProblem, getAllTheSubmissionsForProblem } from '../controllers/submission.controller.js'

const submissionRouter = express.Router()

submissionRouter.get('/get-all-submissions', authMiddleware, getAllSubmissions);
submissionRouter.get('/get-submission/:id', authMiddleware, getSubmissionForProblem);
submissionRouter.get('/get-submissions-count/:id', authMiddleware, getAllTheSubmissionsForProblem);

export default submissionRouter