import { Prisma, Tag } from "@/generated/prisma";

/**
 * Prisma Workflow payload with tags and people included
 */
export type WorkflowWithDetails = Prisma.WorkflowGetPayload<{
  include: {
    tags: true;
    people: {
      include: {
        person: true;
      };
    };
  };
}>;

/**
 * Editable / consumable Workflow DTO
 */
export interface WorkflowData {
  id: string;
  name: string;
  tagline?: string | null;
  description?: string | null;
  vision?: string | null;
  mission?: string | null;
  logoImage?: string | null;
  backgroundImage?: string | null;
  estimatedDuration?: string | null;
  stage: CompanyStage;
  status: WorkflowStatus;
  tags?: Tag[];
  people?: WorkflowWithDetails["people"];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Workflow status states
 */
export enum WorkflowStatus {
  BLUEPRINT = "BLUEPRINT",
  OPERATIONAL = "OPERATIONAL"
}

/**
 * HBR Company Growth Stages
 */
export const COMPANY_STAGES = [
  "Existence",
  "Survival",
  "Success",
  "Take-off",
  "Resource Maturity"
] as const;

export type CompanyStage = typeof COMPANY_STAGES[number];
