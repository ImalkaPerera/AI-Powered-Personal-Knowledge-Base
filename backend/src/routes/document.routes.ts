import {Router} from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { uploadMiddleware, uploadDocument, getDocuments } from '../controllers/document.controller';

const router=Router();

router.post("/upload",authenticateToken,uploadMiddleware,uploadDocument);
router.get("/",authenticateToken,getDocuments);

export default router;