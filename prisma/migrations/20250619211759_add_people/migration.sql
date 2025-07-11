-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_PersonToWorkflow" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PersonToWorkflow_A_fkey" FOREIGN KEY ("A") REFERENCES "Person" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PersonToWorkflow_B_fkey" FOREIGN KEY ("B") REFERENCES "Workflow" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Person_name_key" ON "Person"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_PersonToWorkflow_AB_unique" ON "_PersonToWorkflow"("A", "B");

-- CreateIndex
CREATE INDEX "_PersonToWorkflow_B_index" ON "_PersonToWorkflow"("B");
