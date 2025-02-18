/*
  Warnings:

  - You are about to drop the `Telephones` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Telephones" DROP CONSTRAINT "Telephones_profilesId_fkey";

-- AlterTable
ALTER TABLE "Profiles" ADD COLUMN     "telephonesPhone" TEXT[],
ADD COLUMN     "telephonesWhatsapp" TEXT[];

-- DropTable
DROP TABLE "Telephones";
