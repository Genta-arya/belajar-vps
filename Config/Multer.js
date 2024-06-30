// src/config/multerConfig.js
import multer from "multer";
import path from "path";

// Validasi tipe file

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Folder tempat menyimpan gambar
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
});

export default upload;

