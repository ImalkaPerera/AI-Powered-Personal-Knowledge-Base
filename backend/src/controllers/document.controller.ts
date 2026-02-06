import { Request,Response } from "express";
import {PrismaClient} from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {s3Client,BUCKET_NAME} from "../config/s3.js";
import multer from "multer";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const storage=multer.memoryStorage();
export const uploadMiddlware=multer({storage:storage}).single("file");

export const uploadDocument=async(req:Request & { user?: { userId: string } },res:Response)=>{
    try{
        if(!req.file){
            return res.status(400).json({message:"No file uploaded"});
        }
        const file=req.file;
        const userId=(req as any).user.userId;
        const s3Key=`${userId}/${Date.now()}-${file.originalname}`;

        await s3Client.send(new PutObjectCommand({
            Bucket:BUCKET_NAME,
            Key:s3Key,
            Body:file.buffer,
            ContentType:file.mimetype,
        }));

        const document=await prisma.document.create({
            data:{
                name:file.originalname,
                s3Key:s3Key,
                size:file.size,
                mimeType:file.mimetype,
                userId:userId,
            },
        })
        res.status(201).json(document);
    }catch(error){
        console.error("Upload Error:", error);
    res.status(500).json({ message: "Failed to upload document" });
    }
}

export const getDocuments = async (req: Request & { user?: { userId: string } }, res: Response) => {
    try {
        const documents = await prisma.document.findMany({
            where: { userId: (req as any).user.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch documents" });
    }
};