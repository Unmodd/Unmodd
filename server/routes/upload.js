
import express from 'express';
import multer from 'multer';
import { storage } from '../config/cloudinary.js';

const upload = multer({ storage });
const router = express.Router();

router.post('/file', upload.single('file'), (req, res) => {
  try {
    const fileUrl = req.file?.path;
    const resourceType = req.file?.mimetype?.split('/')[0]; 

    res.status(200).json({ url: fileUrl, type: resourceType });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

export default router;

