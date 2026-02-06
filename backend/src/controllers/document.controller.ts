import { Request,Response } from "express";
import {PrismaClient} from "@prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {s3Client,BUCKET_NAME} from "../config/s3";
import multer from "multer";

const pdf = require("pdf-parse");

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const storage=multer.memoryStorage();
export const uploadMiddleware=multer({storage:storage}).single("file");

export const uploadDocument=async(req:Request & { user?: { userId: string } },res:Response)=>{
    try{
        if(!req.file){
            return res.status(400).json({message:"No file uploaded"});
        }
        const file=req.file;
        const userId=(req as any).user.userId;
        const s3Key=`${userId}/${Date.now()}-${file.originalname}`;

        // 1. Extract Text from PDF Buffer
        let extractedText = "";
        if (file.mimetype === "application/pdf") {
            const data = await pdf(file.buffer);
            extractedText = data.text;
        }

        // 2. Upload to LocalStack S3 (The file itself)
        await s3Client.send(new PutObjectCommand({
            Bucket:BUCKET_NAME,
            Key:s3Key,
            Body:file.buffer,
            ContentType:file.mimetype,
        }));

        // 3. Save Metadata AND Content to Database
        const document=await prisma.document.create({
            data:{
                name:file.originalname,
                s3Key:s3Key,
                size:file.size,
                mimeType:file.mimetype,
                userId:userId,
                content:extractedText, // <--- Saving the text here
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