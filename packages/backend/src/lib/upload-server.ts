import cors from 'cors';
import express from 'express';
import fs from 'fs/promises';
import multer from 'multer';
import path from 'path';
import { db } from './db.js';
import { auth } from './firebase.js';
import { FileUpload } from './schemas.js';

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.com'] // Replace with your actual frontend domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
await fs.mkdir(uploadsDir, { recursive: true });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images, documents, and other common file types
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/json',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

// Middleware to verify Firebase token
async function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.slice(7);
    const decodedToken = await auth.verifyIdToken(token);

    // Attach user info to request
    (req as any).user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Upload endpoint
app.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const user = (req as any).user;
    const now = new Date().toISOString();
    const fileId = `file_upload:${crypto.randomUUID()}`;

    // Save file metadata to SurrealDB
    const [fileRecord] = await db.create<FileUpload>(fileId, {
      id: fileId,
      userId: `user:${user.uid}`,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
      createdAt: now,
    });

    res.json({
      success: true,
      file: fileRecord,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

export function startUploadServer(port: number = 3003) {
  return new Promise<void>((resolve) => {
    app.listen(port, () => {
      console.log(`📁 Upload server running on http://localhost:${port}`);
      resolve();
    });
  });
}
