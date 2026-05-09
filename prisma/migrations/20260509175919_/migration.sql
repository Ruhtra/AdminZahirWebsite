/*
  Warnings:

  - You are about to drop the `HomePage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "HomePage" DROP CONSTRAINT "HomePage_profileId_fkey";

-- AlterTable
ALTER TABLE "Promotion" ADD COLUMN     "isHighlight" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "validUntil" TIMESTAMP(3);

-- DropTable
DROP TABLE "HomePage";
