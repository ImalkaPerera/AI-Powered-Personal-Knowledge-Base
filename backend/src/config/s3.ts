import { S3Client } from "@aws-sdk/client-s3";

// Use environment variables for flexibility between LocalStack and Azure
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.AWS_ENDPOINT || "http://localhost:4566", 
  forcePathStyle: true, // Crucial for LocalStack to treat the URL correctly
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "test",
  },
});

export const BUCKET_NAME = process.env.S3_BUCKET_NAME || "knowledge-base-bucket";