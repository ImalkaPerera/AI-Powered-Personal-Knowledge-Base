import {Request,Response,NextFunction} from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken=(req:Request,res:Response,next:NextFunction)=>{
    try {
        const authHeader=req.headers['authorization'];
        const token=authHeader&&authHeader.split(' ')[1];

        if(!token){
            return res.status(401).json({message:"Access token is missing"});
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.status(403).json({message:"Invalid or expired access token"});
    }
}