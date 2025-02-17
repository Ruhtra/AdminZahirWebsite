-- CreateEnum
CREATE TYPE "TelephoneType" AS ENUM ('whatsapp', 'phone');

-- CreateTable
CREATE TABLE "Profiles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "resume" TEXT,
    "imageUrl" TEXT,
    "informations" TEXT,
    "movie" TEXT,
    "promotionActive" BOOLEAN NOT NULL,
    "type" TEXT[],
    "categories" TEXT[],

    CONSTRAINT "Profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Telephones" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "type" "TelephoneType" NOT NULL,
    "profilesId" TEXT,

    CONSTRAINT "Telephones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "profilesId" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "profilesId" TEXT,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomePage" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "HomePage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Address_profilesId_key" ON "Address"("profilesId");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_profilesId_key" ON "Promotion"("profilesId");

-- AddForeignKey
ALTER TABLE "Telephones" ADD CONSTRAINT "Telephones_profilesId_fkey" FOREIGN KEY ("profilesId") REFERENCES "Profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_profilesId_fkey" FOREIGN KEY ("profilesId") REFERENCES "Profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion" ADD CONSTRAINT "Promotion_profilesId_fkey" FOREIGN KEY ("profilesId") REFERENCES "Profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
