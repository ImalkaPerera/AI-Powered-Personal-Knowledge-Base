import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { chatWithAI } from '../controllers/chat.controller';

const router = Router();

router.post("/", authenticateToken, chatWithAI);

export default router;