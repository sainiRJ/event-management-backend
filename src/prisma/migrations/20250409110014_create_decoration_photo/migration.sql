-- CreateTable
CREATE TABLE `decoration_photos` (
    `id` CHAR(36) NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `title` VARCHAR(100) NULL,
    `service_id` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `service_id`(`service_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `decoration_photos` ADD CONSTRAINT `decoration_photos_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
