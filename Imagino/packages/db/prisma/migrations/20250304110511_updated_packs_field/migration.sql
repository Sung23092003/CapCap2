/*
  Warnings:

  - You are about to drop the `Pack` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PackPrompts" DROP CONSTRAINT "PackPrompts_packId_fkey";

-- AlterTable
ALTER TABLE "OutputImages" ALTER COLUMN "imageUrl" SET DEFAULT '';

-- DropTable
DROP TABLE "Pack";

-- CreateTable
CREATE TABLE "Packs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Packs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackPrompts" ADD CONSTRAINT "PackPrompts_packId_fkey" FOREIGN KEY ("packId") REFERENCES "Packs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
