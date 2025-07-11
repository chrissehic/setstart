/*
  Warnings:

  - Added the required column `role` to the `Person` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL
);
INSERT INTO "new_Person" ("id", "name") SELECT "id", "name" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
CREATE UNIQUE INDEX "Person_name_key" ON "Person"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
