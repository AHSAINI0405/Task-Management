import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage engine
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  },
});

// File filter accepting images, PDFs, office documents, text files, archives, etc.
const fileFilter = (_req, file, cb) => {
  // Allow common safe file types
  const allowedExtensions = /jpeg|jpg|png|gif|svg|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv|zip|rar|7z|json|md/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  
  if (allowedExtensions.test(ext)) {
    cb(null, true);
  } else {
    // Also allow common mimetypes as fallback
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('text/') || 
        file.mimetype.includes('pdf') || 
        file.mimetype.includes('document') ||
        file.mimetype.includes('sheet') ||
        file.mimetype.includes('presentation') ||
        file.mimetype.includes('zip')) {
      cb(null, true);
    } else {
      cb(new Error(`File type .${ext} is not supported. Please upload images, PDFs, or documents.`));
    }
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max size per file
    files: 10, // Max 10 files per request
  },
  fileFilter,
});

export { uploadDir };
