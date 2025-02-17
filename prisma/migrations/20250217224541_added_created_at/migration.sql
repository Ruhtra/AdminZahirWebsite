/*
  Warnings:

  - Added the required column `createdAt` to the `Profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Profiles" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;
