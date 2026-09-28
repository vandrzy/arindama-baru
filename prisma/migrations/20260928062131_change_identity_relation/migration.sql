-- DropForeignKey
ALTER TABLE `responden_identities` DROP FOREIGN KEY `responden_identities_submissionId_fkey`;

-- DropIndex
DROP INDEX `responden_identities_submissionId_key` ON `responden_identities`;

-- CreateIndex
CREATE INDEX `responden_identities_submissionId_idx` ON `responden_identities`(`submissionId`);

-- AddForeignKey
ALTER TABLE `responden_identities` ADD CONSTRAINT `responden_identities_submissionId_fkey` FOREIGN KEY (`submissionId`) REFERENCES `submissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
