import {Router} from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { uploadMiddlware, uploadDocument, getDocuments } from '../controllers/document.controller';

const router=Router();

router.post("/upload",authenticateToken,uploadMiddlware,uploadDocument);
router.get("/",authenticateToken,getDocuments);

export default router;