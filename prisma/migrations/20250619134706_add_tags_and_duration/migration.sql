/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Workflow_name_userId_key";

-- AlterTable
ALTER TABLE "Workflow" ADD COLUMN "estimatedDuration" TEXT;
ALTER TABLE "Workflow" ADD COLUMN "tags" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_name_key" ON "Workflow"("name");
