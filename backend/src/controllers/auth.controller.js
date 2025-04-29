import bcrypt from "bcryptjs";
import { db } from "../libs/db.js";
import { UserRole } from "../generated/prisma/index.js";
import jwt from "jsonwebtoken";


export const register = async (req, res) => {
    const { name, email, password } = req.body
    try {
        const existingUser = await db.user.findUnique({
            where: {
                email
            }
        })

        if (existingUser) {
            return res.status(400).json({
                error: "User already exists"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.USER
            }
        })

        const token = jwt.sign({id: newUser.id}, process.env.JWT_SECRET, {
            expiresIn: "5d"
        })

        res.cookie("jwt", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
            maxAge: 1000 * 60 * 60 * 24 * 5
        })

        res.status(201).json({
            message: "User created successfully",
            user: newUser
        })


    } catch (error) {
        console.log("error creating user:", error)
        res.status(500).json({
            error: "Error creating user"
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const curr_user = await db.user.findUnique({
            where: {
                email
            }
        })

        if(!curr_user){
            res.status(400).json({
                error: "user not found, please register."
            })
        }


        const passwordMatch = await bcrypt.compare(password, curr_user.password)


        if(passwordMatch){
            const token = jwt.sign({id: curr_user.id}, process.env.JWT_SECRET, {
                expiresIn: "5d"
            })
    
            res.cookie("jwt", token, {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV !== "development",
                maxAge: 1000 * 60 * 60 * 24 * 5
            })
    
            res.status(200).json({
                message: "User logged in successfully",
                user: curr_user
            })
        }
        else{
            res.status(404).json({
                message: "wrong credentials",
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "something went wrong while logging in.",
            error
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "strict",
            secure: process.env.NODE_ENV !== "development",
        })

        res.status(200).json({
            message: "User logged out successfully",
            success: true
        })
    } catch (error) {
        res.status(500).json({
            message: "error logging out",
            error
        })
    }
}

export const check = async (req, res) => {
}