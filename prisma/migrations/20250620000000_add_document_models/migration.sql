-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workflowId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logoImage" TEXT,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "marketShare" TEXT,
    "pricing" TEXT,
    "features" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("workflowId") REFERENCES "Workflow"("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "Competitor_workflowId_idx" ON "Competitor"("workflowId");
