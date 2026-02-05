import {Router} from "express";
import {register,login} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router=Router();

router.post("/register",register);
router.post("/login",login);

router.get("/me", authenticateToken, (req,res)=>{
    res.json({message:"This is a protected profile route",user:(req as any).user});
});
export default router;
