-- CreateTable
CREATE TABLE "followers" (
    "id" TEXT NOT NULL,
    "instagram" INTEGER NOT NULL,
    "tiktok" INTEGER NOT NULL,
    "youtube" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("id")
);
