/*
  Warnings:

  - You are about to drop the column `salary` on the `employees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `employees` DROP COLUMN `salary`;

-- CreateTable
CREATE TABLE `service_rates` (
    `id` CHAR(36) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NULL,
    `charge` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `service_rates_service_id_employee_id_key`(`service_id`, `employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `service_rates` ADD CONSTRAINT `service_rates_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `service_rates` ADD CONSTRAINT `service_rates_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
