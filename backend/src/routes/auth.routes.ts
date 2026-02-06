import {Router} from "express";
import {refresh,logout,register,login, getProfile} from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router=Router();

router.post("/register",register);
router.post("/login",login);

router.get("/me", authenticateToken, getProfile);
router.post('/refresh', refresh);
router.post("/logout", logout);
export default router;
