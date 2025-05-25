-- CreateTable
CREATE TABLE `assigned_employees` (
    `id` VARCHAR(191) NOT NULL,
    `bookingId` VARCHAR(191) NOT NULL,
    `employeeId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,

    INDEX `assigned_employees_bookingId_idx`(`bookingId`),
    INDEX `assigned_employees_employeeId_idx`(`employeeId`),
    INDEX `assigned_employees_serviceId_idx`(`serviceId`),
    UNIQUE INDEX `assigned_employees_bookingId_employeeId_serviceId_key`(`bookingId`, `employeeId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `assigned_employees` ADD CONSTRAINT `assigned_employees_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assigned_employees` ADD CONSTRAINT `assigned_employees_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `assigned_employees` ADD CONSTRAINT `assigned_employees_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
