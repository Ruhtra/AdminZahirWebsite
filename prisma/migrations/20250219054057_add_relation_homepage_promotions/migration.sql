/*
  Warnings:

  - Added the required column `profileId` to the `HomePage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HomePage" ADD COLUMN     "profileId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "HomePage" ADD CONSTRAINT "HomePage_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
