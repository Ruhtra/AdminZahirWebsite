-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_profilesId_fkey";

-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_profilesId_fkey";

-- DropEnum
DROP TYPE "TelephoneType";

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_profilesId_fkey" FOREIGN KEY ("profilesId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_profilesId_fkey" FOREIGN KEY ("profilesId") REFERENCES "Profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
