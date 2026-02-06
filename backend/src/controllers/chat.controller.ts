import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { aiClient } from "../config/openai";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Cosine similarity function
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export const chatWithAI = async (req: any, res: Response) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId;

    if (!message) return res.status(400).json({ message: "Message is required" });

    console.log('Processing chat request for user:', userId);
    console.log('Message:', message);

    // 1. Convert User Question to Vector
    console.log('Generating embeddings...');
    const embeddingResponse = await aiClient.embeddings.create({
      model: process.env.AZURE_DEPLOYMENT_NAME || "text-embedding-3-small",
      input: message,
    });
    
    const vector = embeddingResponse.data[0].embedding;
    console.log('Generated embedding vector of length:', vector.length);

    // 2. Search for Similar Documents (Vector Search)
    console.log('Searching for relevant documents...');
    const documentsWithEmbeddings: any[] = await prisma.$queryRaw`
      SELECT id, content, embedding
      FROM "Document"
      WHERE "userId" = ${userId}
      AND content IS NOT NULL
      AND embedding IS NOT NULL;
    `;
    
    console.log('Found documents with embeddings:', documentsWithEmbeddings.length);

    if (documentsWithEmbeddings.length === 0) {
      return res.json({ 
        response: "I couldn't find any relevant documents to answer your question. Please make sure you have uploaded PDFs to the Knowledge Base." 
      });
    }

    // Calculate cosine similarity in JavaScript
    const documentsWithSimilarity = documentsWithEmbeddings.map(doc => {
      try {
        const docEmbedding = JSON.parse(doc.embedding);
        const similarity = cosineSimilarity(vector, docEmbedding);
        return {
          ...doc,
          similarity
        };
      } catch (error: any) {
        console.error('Error parsing embedding for document:', doc.id, error);
        return {
          ...doc,
          similarity: 0
        };
      }
    });

    // Sort by similarity and take top 3
    const results = documentsWithSimilarity
      .filter(doc => doc.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    console.log('Top 3 similar documents:', results.map(r => ({ id: r.id, similarity: r.similarity })));

    // 3. Construct the Context for AI
    const context = results.map((r) => r.content).join("\n\n---\n\n");
    console.log('Using context from', results.length, 'documents');

    if (!context.trim()) {
      return res.json({ 
        response: "I couldn't find any relevant content in your documents to answer this question." 
      });
    }

    // 4. Ask AI with document context
    console.log('Generating AI response with document context...');
    const chatResponse = await aiClient.chat.completions.create({
      model: process.env.AZURE_CHAT_DEPLOYMENT_NAME || "gpt-4o", 
      messages: [
        {
          role: "system",
          content: `You are a helpful AI assistant. Use the following pieces of context from the user's documents to answer their question. 
          If the answer is not in the context, say you don't know based on the provided documents. 
          Always be specific and reference the information from the documents when possible.
          
          Context from uploaded documents:
          ${context}`
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const aiAnswer = chatResponse.choices[0].message.content;
    console.log('Generated AI response successfully');

    res.json({ response: aiAnswer });

  } catch (error: any) {
    console.error("Chat Error:", error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      return res.status(500).json({ message: "OpenAI API configuration error. Please check your API keys." });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('billing')) {
      return res.status(500).json({ message: "OpenAI API quota exceeded. Please check your billing." });
    }
    
    if (error.message?.includes('model')) {
      return res.status(500).json({ message: "Model configuration error. Please check your deployment names." });
    }
    
    res.status(500).json({ 
      message: "Failed to generate response. Please try again.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};