import "dotenv/config";
import express from "express";
import authRoutes from "./src/routes/auth.routes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();
const PORT=3000;
app.use(cookieParser());
app.use(cors({
    origin:["http://localhost:5173", "http://localhost:5174"]
}))
app.use(express.json());
app.use("/api/auth",authRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});