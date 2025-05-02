/*
  Warnings:

  - A unique constraint covering the columns `[booking_requests]` on the table `bookings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status_id` to the `booking_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking_requests` ADD COLUMN `status_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `booking_requests` CHAR(36) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `bookings_booking_requests_key` ON `bookings`(`booking_requests`);

-- AddForeignKey
ALTER TABLE `booking_requests` ADD CONSTRAINT `bookingrequest_ibfk_status` FOREIGN KEY (`status_id`) REFERENCES `statuses`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_booking_requests_fkey` FOREIGN KEY (`booking_requests`) REFERENCES `booking_requests`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
