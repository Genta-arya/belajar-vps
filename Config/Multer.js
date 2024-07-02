import multer from "multer";
import path from "path";
import fs from "fs";

// Setup penyimpanan Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // Folder penyimpanan file
  },
  filename: (req, file, cb) => {
    // Ambil nama file asli dan ubah spasi menjadi tanda hubung
    const originalName = path.basename(
      file.originalname,
      path.extname(file.originalname)
    );
    const sanitizedFileName =
      originalName.replace(/\s+/g, "-") +
      path.extname(file.originalname).toLowerCase();
    cb(null, `${sanitizedFileName}`); // Nama file
  },
});

// Setup konfigurasi Multer
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // Batas ukuran file per file (100MB)
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
    req.files.forEach((file) =>
      fs.unlinkSync(path.join("uploads", file.filename))
    );
    return res
      .status(400)
      .json({ error: "Total file size exceeds the 40GB limit" });
  }

  next();
};

const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "Max file upload size is 100MB" });
    }
  }
  next(err);
};

// Ekspor modul dengan named exports
export { upload, checkTotalSize, handleMulterErrors };
