import type { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const register=async(req:Request,res:Response)=>{
    const {email,password}=req.body;
    try{
        const hashedPassword=await bcrypt.hash(password,10);

        const user=await prisma.user.create({
            data:{
                email,
                password:hashedPassword,
                role:"USER",
            },
        });
        res.status(201).json({message:"User registered successfully",userId:user.id});
    }catch(error){
        console.error("Register error:", error);
        res.status(500).json({message:"Internal server error",error});
    }
}

export const login=async(req:Request,res:Response)=>{
    const {email,password}=req.body;
    try{
        const user=await prisma.user.findUnique({
            where:{email},
        });
        if(!user||!(await bcrypt.compare(password,user.password))){
            return res.status(401).json({message:"Invalid email or password"});
        }
        const token=jwt.sign(
            {userId:user.id,role:user.role},
            process.env.JWT_SECRET||"secret",
            {expiresIn:"24h"}
        )
        res.json({
            token,
            user:{
                id: user.id,
                email:user.email,
                role:user.role
            }
        });
    }catch(error){
        console.error("Login error:", error);
        res.status(500).json({message:"Internal server error",error});
    }
}

// backend/src/controllers/auth.controller.ts

export const getProfile = async (req: any, res: Response) => {
  try {
    // 1. Get the ID from the token (attached by middleware)
    const userId = req.user.userId;

    // 2. Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        email: true, 
        role: true, 
        createdAt: true 
      } // Never return the password
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Send the clean user data back
    res.json(user);
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// backend/src/controllers/auth.controller.ts

export const refresh = async (req: Request, res: Response) => {
    // 1. Get token from cookies (requires cookie-parser)
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Refresh token missing" });
    }

    try {
        // 2. Verify the token
        const decoded = jwt.verify(
            refreshToken, 
            process.env.REFRESH_SECRET || "refresh_secret"
        ) as { userId: string };

        // 3. (Optional but Recommended) Check if user still exists in DB
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user) {
            return res.status(403).json({ message: "User no longer exists" });
        }

        // 4. Generate a new Access Token (15 minutes)
        const accessToken = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET || "access_secret",
            { expiresIn: "15m" }
        );

        // 5. Send only the new access token to the frontend
        res.json({ accessToken });
    } catch (error) {
        console.error("Refresh Error:", error);
        // If token is expired or tampered with
        res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};


export const logout = async (req: Request, res: Response) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
    res.json({ message: "Logged out successfully" });
};