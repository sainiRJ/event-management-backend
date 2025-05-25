/*
  Warnings:

  - You are about to drop the column `booking_requests` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the `booking_requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `booking_requests` DROP FOREIGN KEY `booking_requests_service_id_fkey`;

-- DropForeignKey
ALTER TABLE `booking_requests` DROP FOREIGN KEY `bookingrequest_ibfk_status`;

-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_booking_requests_fkey`;

-- DropIndex
DROP INDEX `bookings_booking_requests_key` ON `bookings`;

-- AlterTable
ALTER TABLE `bookings` DROP COLUMN `booking_requests`,
    ADD COLUMN `is_online_booking` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `events` ADD COLUMN `email` VARCHAR(100) NULL;

-- DropTable
DROP TABLE `booking_requests`;
