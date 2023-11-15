-- CreateTable
CREATE TABLE `Wallet` (
    `addressId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Wallet_addressId_key`(`addressId`),
    PRIMARY KEY (`addressId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SenderAssets` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `iconPng` VARCHAR(191) NOT NULL,
    `iconSvg` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `SenderAssets_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transactions` (
    `hash` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NOT NULL,
    `data` LONGTEXT NULL,
    `status` VARCHAR(191) NOT NULL,
    `sourceShard` INTEGER NOT NULL,
    `destinationShard` INTEGER NOT NULL,
    `nonce` INTEGER NOT NULL,
    `previousTransactionHash` VARCHAR(191) NULL,
    `originalTransactionHash` VARCHAR(191) NULL,
    `gasPrice` INTEGER NULL DEFAULT 0,
    `gasLimit` INTEGER NULL DEFAULT 0,
    `coin` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `senderId` VARCHAR(191) NOT NULL,
    `receiverId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Transactions_hash_key`(`hash`),
    PRIMARY KEY (`hash`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SenderAssets` ADD CONSTRAINT `SenderAssets_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `Transactions`(`hash`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transactions` ADD CONSTRAINT `Transactions_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `Wallet`(`addressId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transactions` ADD CONSTRAINT `Transactions_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `Wallet`(`addressId`) ON DELETE RESTRICT ON UPDATE CASCADE;
