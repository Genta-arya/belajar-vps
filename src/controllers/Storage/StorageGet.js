// routes/storage.js
import express from "express";

import path from "path";
import { getStorageInfo } from "../../../utils/Storage/Storage.js";

const router = express.Router();

// Konfigurasi batas ukuran total (40GB)
const MAX_TOTAL_SIZE = 40 * 1024 * 1024 * 1024; // 40GB

// Endpoint untuk memeriksa sisa ruang
router.get("/data", (req, res) => {
  try {
    const folderPath = path.join("uploads");
    const storageInfo = getStorageInfo(folderPath, MAX_TOTAL_SIZE);

    res.status(200).json({
      data: {
        message: "Available space retrieved successfully",
        totalSizes: storageInfo.totalSize,
        totalSize: storageInfo.totalSizeInGB + " GB",
        totalUsedSizes: storageInfo.totalUsedSize,
        totalUsedSize: storageInfo.totalUsedSizeInGB + " GB",
        availableSize: storageInfo.availableSize + " GB",
        availableSize: storageInfo.availableSizeInGB + " GB",
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
