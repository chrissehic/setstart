/*
  Warnings:

  - You are about to drop the `_PersonToWorkflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `role` on the `Person` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_PersonToWorkflow_B_index";

-- DropIndex
DROP INDEX "_PersonToWorkflow_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_PersonToWorkflow";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "RolesInWorkflow" (
    "workflowId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    PRIMARY KEY ("workflowId", "personId"),
    CONSTRAINT "RolesInWorkflow_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "Workflow" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RolesInWorkflow_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatarImage" TEXT
);
INSERT INTO "new_Person" ("id", "name") SELECT "id", "name" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
CREATE UNIQUE INDEX "Person_name_key" ON "Person"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
