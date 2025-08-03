import { Prisma, Tag } from "@/generated/prisma";
import { COMPANY_STAGES } from "./companyStages";

/**
 * Prisma Workflow payload with tags and people (without tasks)
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
 * Prisma Workflow payload with tags, people & tasks included
 */
export type WorkflowWithTasks = Prisma.WorkflowGetPayload<{
  include: {
    tags: true;
    people: {
      include: {
        person: true;
      };
    };
    tasks: {
      include: {
        assignedPeople: {
          include: {
            person: true;
          };
        };
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
  tasks?: Task[];
  products?: Product[];
  objectives?: Objective[],

  createdAt: Date;
  updatedAt: Date;
}

export interface Person {
  id: string;
  name: string;
  avatarImage?: string | undefined;

  workflows?: RolesInWorkflow[];
  tasks?: PersonOnTask[];
}

export interface RolesInWorkflow {
  workflowId: string;
  role: string;
}

export interface PersonOnTask {
  taskId: string;
}

export interface Objective {
  id: string;
  workflowId: string;

  title: string;
  description?: string | null;
  priority?: TaskPriority | null;

  tasks?: Task[]; // Tasks under this objective

  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  workflowId: string;
  objectiveId?: string | null;

  title: string;
  category: string; // e.g., "Photography", "Web Development", etc.
  description?: string | null;

  status: TaskStatus;
  responsibility: Responsibility;
  priority?: TaskPriority;

  dueDate?: Date | null;

  assignedPeople: {
    person: Person;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description?: string | null;
  attributes?: Record<string, string> | null;
  price?: number | null;
  image?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  workflowId: string;
  name: string;
  description?: string | null;
  type?: string | null;
  image?: string | null;
  variants?: ProductVariant[];
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETE = "COMPLETE",
}

export enum Responsibility {
  IN_HOUSE = "IN_HOUSE",
  OUTSOURCED = "OUTSOURCED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
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
export type Stage = {
  stageNumber: number;
  key: string; // unique slug for internal use
  title: string;
  description: string;
  challenges: string[];
  goals: string[];
  nextSteps: string[];
  checklist?: {
    id: string;
    title: string;
    description: string;
  }[];
};

export type CompanyStage = (typeof COMPANY_STAGES)[number]["key"];

