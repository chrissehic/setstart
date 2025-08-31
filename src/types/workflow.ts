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
    tasks: true;
  };
}>;

export interface SocialLink {
  id: string;
  workflowId: string;
  name: string;
  url: string;
  handle?: string | null;
  icon?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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
  mainLogo?: string | null;
  logoIcon?: string | null;
  additionalAssets?: string[] | null;
  estimatedDuration?: string | null;
  stage: CompanyStage;
  status: WorkflowStatus;

  tags?: Tag[];
  people?: WorkflowWithDetails["people"];
  tasks?: Task[];
  products?: Product[];
  objectives?: Objective[];
  socialLinks?: SocialLink[]
  competitors?: Competitor[];
  competitorTableColumns?: CompetitorTableColumn[];
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
  category: string;
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

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  description?: string | null;
  attributes: string;
  price?: number | null;
  image?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reference {
  id: string;
  workflowId: string;
  title: string;
  sourcePlatform: string;
  url: string;
  tags: string[]; // Parsed from JSON string
  description?: string | null;
  relatedProductId?: string | null;
  addedBy?: string | null;
  dateAdded: Date;
  thumbnailUrl?: string | null;
  durationSeconds: number;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// New dynamic competitor types
export interface Competitor {
  id: string;
  workflowId: string;
  name: string; // Required
  description?: string | null; // Optional
  website?: string | null; // Optional
  logoImage?: string | null; // Optional
  attributes: Record<string, any>; // Dynamic attributes (key-value pairs)
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorTableColumn {
  id: string;
  workflowId: string;
  name: string; // Column name (e.g., "Customer Segment", "Technology Stack")
  type: 'text' | 'number' | 'select' | 'boolean' | 'date'; // Column type
  required: boolean; // Whether this column is required
  options?: string[]; // Options for select type columns
  order: number; // Display order
  isActive: boolean; // Whether this column is active
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorFormData {
  name: string;
  description?: string;
  website?: string;
  logoImage?: string;
  attributes: Record<string, any>;
}

export interface CompetitorTableColumnFormData {
  name: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date';
  required: boolean;
  options?: string[];
  order: number;
}

// Enums
export enum CompanyStage {
  EXISTENCE = "existence",
  SURVIVAL = "survival",
  SUCCESS = "success",
  TAKEOFF = "takeoff",
  RESOURCE_MATURITY = "resource_maturity",
}

export enum WorkflowStatus {
  BLUEPRINT = "BLUEPRINT",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED",
}

export enum TaskStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
  CANCELLED = "CANCELLED",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT",
}

export enum Responsibility {
  IN_HOUSE = "IN_HOUSE",
  OUTSOURCED = "OUTSOURCED",
}

