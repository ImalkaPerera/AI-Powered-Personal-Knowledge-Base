import type { Request, Response } from 'express';
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';

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
        res.status(500).json({message:"Internal server error",error});
    }
}