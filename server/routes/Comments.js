import express from "express";
import { postComment, deleteComment } from '../controllers/comments.js'; 

import auth from "../middleware/auth.js"; 

const router = express.Router();

router.post('/:postId', postComment); 
router.delete('/:id', deleteComment);

export default router;