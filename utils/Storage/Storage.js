// utils/storageUtils.js
import fs from 'fs';
import path from 'path';

// Fungsi untuk menghitung total ukuran file di folder uploads
const getTotalUsedSize = (folderPath) => {
  let totalSize = 0;

  // Membaca isi folder
  const files = fs.readdirSync(folderPath);

  // Menghitung total ukuran file
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;
  });

  return totalSize;
};

// Fungsi untuk menghitung sisa ruang dan ukuran terpakai
export const getStorageInfo = (folderPath, maxSize) => {
  const totalUsedSize = getTotalUsedSize(folderPath);
  const availableSize = maxSize - totalUsedSize;

  return {
    totalSize: maxSize,
    totalUsedSize: totalUsedSize,
    availableSize: availableSize,
    totalSizeInGB: (maxSize / (1024 * 1024 * 1024)).toFixed(2),
    totalUsedSizeInGB: (totalUsedSize / (1024 * 1024 * 1024)).toFixed(2),
    availableSizeInGB: (availableSize / (1024 * 1024 * 1024)).toFixed(2),
  };
};
