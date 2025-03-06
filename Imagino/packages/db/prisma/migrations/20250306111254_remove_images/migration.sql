/*
  Warnings:

  - You are about to drop the `TrainingModel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `zipUrl` to the `Model` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TrainingModel" DROP CONSTRAINT "TrainingModel_modelId_fkey";

-- AlterTable
ALTER TABLE "Model" ADD COLUMN     "zipUrl" TEXT NOT NULL,
ALTER COLUMN "falAiRequestId" DROP NOT NULL;

-- DropTable
DROP TABLE "TrainingModel";

-- CreateIndex
CREATE INDEX "Model_falAiRequestId_idx" ON "Model"("falAiRequestId");

-- CreateIndex
CREATE INDEX "OutputImages_falAiRequestId_idx" ON "OutputImages"("falAiRequestId");
