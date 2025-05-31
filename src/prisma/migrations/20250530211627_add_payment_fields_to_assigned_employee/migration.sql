-- AlterTable
ALTER TABLE `assigned_employees` ADD COLUMN `is_paid` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paid_at` TIMESTAMP(0) NULL;

-- AlterTable
ALTER TABLE `employees` ADD COLUMN `extra_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `total_paid` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `total_remaining` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `employee_payment_history` (
    `id` CHAR(36) NOT NULL,
    `employee_id` CHAR(36) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `paid_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `employee_payment_history_employee_id_idx`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employee_payment_history` ADD CONSTRAINT `employee_payment_history_employee_id_fkey` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
