-- CreateTable
CREATE TABLE `booking_requests` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(15) NOT NULL,
    `date` TIMESTAMP(0) NOT NULL,
    `service_id` CHAR(36) NOT NULL,
    `location` VARCHAR(255) NOT NULL,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `service_id`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `booking_requests` ADD CONSTRAINT `booking_requests_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
