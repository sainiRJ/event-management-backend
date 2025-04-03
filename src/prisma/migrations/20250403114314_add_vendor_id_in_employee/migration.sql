/*
  Warnings:

  - Added the required column `vendor_id` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor_id` to the `employees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendor_id` to the `services` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `vendor_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `employees` ADD COLUMN `vendor_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `services` ADD COLUMN `vendor_id` CHAR(36) NOT NULL;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `is_vendor` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `vendor_id` ON `bookings`(`vendor_id`);

-- CreateIndex
CREATE INDEX `vendor_id` ON `employees`(`vendor_id`);

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_6` FOREIGN KEY (`vendor_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `employees_ibfk_3` FOREIGN KEY (`vendor_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `services` ADD CONSTRAINT `services_vendor_id_fkey` FOREIGN KEY (`vendor_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
