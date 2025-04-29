import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import {db} from "../libs/db.js"
dotenv.config()

export const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            res.status(401).json({
                message: "user not authenticated",
                success: false
            })
        }
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET)
        } catch (error) {
            return res.status(500).json({
                message: "something went wrong while verifying the jwt token",
                success: false
            })
        }
        const user = await db.user.findUnique({
            where:{
                id: decoded.id
            }
        })

        if(!user){
            res.status(401).json({
                message: "user not found",
                success: false
            })
        }

        req.user = user

        res.status(20).json({
            message: "user authenticated",
            success: true,
            user
        })

        next()

    } catch (error) {
        res.status(500).json({
            message: "user not authenticated",
            success: false
        })
    }
}