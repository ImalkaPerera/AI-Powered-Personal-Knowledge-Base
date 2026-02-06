import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import { s3Client, BUCKET_NAME } from "../config/s3";
import { aiClient } from "../config/openai";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { createRequire } from 'module';

// Create require function for CommonJS modules in ES module environment
const require = createRequire(import.meta.url);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const storage = multer.memoryStorage();
export const uploadMiddleware = multer({ storage: storage }).single("file");

export const uploadDocument = async (req: any, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const file = req.file;
    const userId = req.user.userId;
    const s3Key = `${userId}/${Date.now()}-${file.originalname}`;

    // 1. Extract Text
    let extractedText = "";
    console.log("Processing file:", file.originalname, "MIME type:", file.mimetype);
    
    if (file.mimetype === "application/pdf") {
      console.log("Attempting PDF text extraction...");
      try {
        // Check what packages are available
        console.log("Looking for PDF parsing packages...");
        
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: file.buffer });
        const result = await parser.getText();
        extractedText = result.text;
        await parser.destroy();
        
        console.log("PDF text extracted, length:", extractedText.length);
        console.log("First 200 chars:", extractedText.substring(0, 200));
      } catch (error: any) {
        console.error("PDF parsing failed:", error);
        console.error("Error stack:", error.stack);
        // Continue without text extraction
      }
    } else {
      console.log("Non-PDF file, skipping text extraction");
    }

    // 1.5. Generate Embeddings (if we have text)
    let embedding = null;
    if (extractedText.trim()) {
      try {
        console.log("Generating embeddings for text of length:", extractedText.length);
        const embeddingResponse = await aiClient.embeddings.create({
          model: process.env.AZURE_DEPLOYMENT_NAME || "text-embedding-3-small",
          input: extractedText.slice(0, 8000), // Limit to 8000 chars to avoid token limits
        });
        embedding = embeddingResponse.data[0].embedding;
        console.log("Generated embedding vector of length:", embedding.length);
      } catch (error: any) {
        console.error("Embedding generation failed:", error);
        // Continue without embedding
      }
    } else {
      console.log("No text extracted, skipping embedding generation");
    }

    // 2. Upload to S3
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    // 3. Save to Database
    console.log("Saving document to database:");
    console.log("- Name:", file.originalname);
    console.log("- Content length:", extractedText?.length || 0);
    console.log("- Has embedding:", !!embedding);
    
    const document = await prisma.document.create({
      data: {
        name: file.originalname,
        s3Key: s3Key,
        size: file.size,
        mimeType: file.mimetype,
        userId: userId,
        content: extractedText,
        embedding: embedding ? JSON.stringify(embedding) : null,
      },
    });

    console.log("Document saved with ID:", document.id);
    res.status(201).json(document);
  } catch (error: any) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

export const getDocuments = async (req: any, res: Response) => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(documents);
  } catch (error: any) {
    res.status(500).json({ message: "Failed to fetch documents" });
  }
};