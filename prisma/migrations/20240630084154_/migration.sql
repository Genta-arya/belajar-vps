/*
  Warnings:

  - You are about to drop the column `image` on the `gallery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `gallery` DROP COLUMN `image`,
    ADD COLUMN `mediaId` INTEGER NULL;

-- CreateTable
CREATE TABLE `DataMedia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `mimetype` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Gallery` ADD CONSTRAINT `Gallery_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `DataMedia`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
