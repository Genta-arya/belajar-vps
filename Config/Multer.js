import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Setup penyimpanan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // Folder penyimpanan file
  },
  filename: (req, file, cb) => {
    // Tambahkan UUID ke nama file untuk memastikan unik
    const uniqueSuffix = uuidv4() + path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}`); // Nama file
  },
});

// Setup konfigurasi Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 * 1024 }, // Batas ukuran file per file (1GB)
});

// Middleware untuk memeriksa batas ukuran total file
const checkTotalSize = (req, res, next) => {
  if (!req.files) {
    return next();
  }

  // Hitung total ukuran file
  const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);

  // Batas ukuran total (40GB)
  const MAX_TOTAL_SIZE = 40 * 1024 * 1024 * 1024; // 40GB

  if (totalSize > MAX_TOTAL_SIZE) {
    // Hapus file yang telah diupload jika melebihi batas
    req.files.forEach(file => fs.unlinkSync(path.join('uploads', file.filename)));
    return res.status(400).json({ error: 'Total file size exceeds the 40GB limit' });
  }

  next();
};

// Ekspor modul dengan named exports
export { upload, checkTotalSize };
