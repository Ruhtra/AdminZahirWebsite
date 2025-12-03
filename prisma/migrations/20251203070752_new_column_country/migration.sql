/*
 Warnings:
 
 - You are about to drop the column `lat` on the `Address` table. All the data in the column will be lost.
 - You are about to drop the column `lng` on the `Address` table. All the data in the column will be lost.
 - Added the required column `country` to the `Address` table without a default value. This is not possible if the table is not empty.
 
 */
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "lat",
  DROP COLUMN "lng",
  ADD COLUMN "country" TEXT;
UPDATE "Address"
SET "country" = 'BR' -- ou outro valor padrão que faça sentido
WHERE "country" IS NULL;
ALTER TABLE "Address"
ALTER COLUMN "country"
SET NOT NULL;