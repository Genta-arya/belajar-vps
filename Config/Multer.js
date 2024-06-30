// src/config/multerConfig.js
import multer from 'multer';
import path from 'path';

// Validasi tipe file
const fileFilter = (req, file, cb) => {
  // Daftar ekstensi file yang diizinkan
  const allowedTypes = /jpeg|jpg|png|mp4/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('File type is not allowed'), false);
  }
};

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder tempat menyimpan gambar
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    cb(null, filename);
  },
});

// Inisialisasi Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter, // Validasi tipe file
});

export default upload;
