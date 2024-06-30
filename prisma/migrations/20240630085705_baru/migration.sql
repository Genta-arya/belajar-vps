/*
  Warnings:

  - You are about to drop the column `mediaId` on the `gallery` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `gallery` DROP FOREIGN KEY `Gallery_mediaId_fkey`;

-- AlterTable
ALTER TABLE `gallery` DROP COLUMN `mediaId`;

-- CreateTable
CREATE TABLE `_GalleryMedia` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_GalleryMedia_AB_unique`(`A`, `B`),
    INDEX `_GalleryMedia_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_GalleryMedia` ADD CONSTRAINT `_GalleryMedia_A_fkey` FOREIGN KEY (`A`) REFERENCES `DataMedia`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_GalleryMedia` ADD CONSTRAINT `_GalleryMedia_B_fkey` FOREIGN KEY (`B`) REFERENCES `Gallery`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
