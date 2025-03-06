/*
  Warnings:

  - Added the required column `falAiRequestId` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ModelTrainingStatusEnum" AS ENUM ('Pending', 'Generated', 'Failed');

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "falAiRequestId" TEXT NOT NULL,
ADD COLUMN     "tensorPath" TEXT,
ADD COLUMN     "trainingStatus" "ModelTrainingStatusEnum" NOT NULL DEFAULT 'Pending',
ADD COLUMN     "triggerWord" TEXT;

-- AlterTable
ALTER TABLE "OutputImages" ADD COLUMN     "falAiRequestId" TEXT;
