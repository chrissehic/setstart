import type { Task } from "@/types";
import { Responsibility, TaskPriority, TaskStatus } from "@/types/workflow";

export const mockTasks: Task[] = [
  {
    id: "task-4",
    workflowId: "workflow-123",
    title: "Organize Product Photography",
    category: "Marketing",
    description: "Schedule and manage product photoshoot for the first batch of Uplift Bars.",
    responsibility: Responsibility.IN_HOUSE,
    status: TaskStatus.NOT_STARTED,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-07-10"),
    assignedPeople: [
      {
        person: {
          id: "person-4",
          name: "Dana Lee",
          avatarImage: "https://randomuser.me/api/portraits/women/68.jpg",
          workflows: [],
          tasks: [],
        },
      },
    ],
    createdAt: new Date("2025-06-22"),
    updatedAt: new Date("2025-06-22"),
  },
  {
    id: "task-5",
    workflowId: "workflow-123",
    title: "Website Creation & Launch",
    category: "Web Development",
    description: "Develop and launch the official Uplift High Fibre Bars website.",
    responsibility: Responsibility.IN_HOUSE,
    status: TaskStatus.COMPLETED,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-07-31"),
    assignedPeople: [
      {
        person: {
          id: "person-1",
          name: "Alice Johnson",
          avatarImage: "https://randomuser.me/api/portraits/women/44.jpg",
          workflows: [],
          tasks: [],
        },
      },
    ],
    createdAt: new Date("2025-06-10"),
    updatedAt: new Date("2025-06-25"),
  },
  {
    id: "task-6",
    workflowId: "workflow-123",
    title: "Contact Production Factories",
    category: "Operations",
    description: "Reach out to potential production factories to negotiate manufacturing contracts.",
    responsibility: Responsibility.OUTSOURCED,
    status: TaskStatus.NOT_STARTED,
    priority: TaskPriority.HIGH,
    dueDate: new Date("2025-07-15"),
    assignedPeople: [
      {
        person: {
          id: "person-5",
          name: "Ethan Carter",
          avatarImage: "https://randomuser.me/api/portraits/men/33.jpg",
          workflows: [],
          tasks: [],
        },

      }, {
        person: {
          id: "person-1",
          name: "Alice Johnson",
          avatarImage: "https://randomuser.me/api/portraits/women/44.jpg",
          workflows: [],
          tasks: [],
        }
      },
    ],
    createdAt: new Date("2025-06-12"),
    updatedAt: new Date("2025-06-12"),
  },
  {
    id: "task-7",
    workflowId: "workflow-123",
    title: "Test Home Cooking Recipes",
    category: "Product Development",
    description: "Experiment with home cooking recipes to develop the base formula for the bars.",
    responsibility: Responsibility.IN_HOUSE,
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-07-05"),
    assignedPeople: [
      {
        person: {
          id: "person-2",
          name: "Bob Smith",
          avatarImage: "https://randomuser.me/api/portraits/men/46.jpg",
          workflows: [],
          tasks: [],
        },
      },
    ],
    createdAt: new Date("2025-06-20"),
    updatedAt: new Date("2025-06-23"),
  },
  {
    id: "task-8",
    workflowId: "workflow-123",
    title: "Create Social Media Strategy",
    category: "Marketing",
    description: "Plan social media content and campaigns for product launch.",
    responsibility: Responsibility.IN_HOUSE,
    status: TaskStatus.NOT_STARTED,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date("2025-07-20"),
    assignedPeople: [
      {
        person: {
          id: "person-4",
          name: "Dana Lee",
          avatarImage: "https://randomuser.me/api/portraits/women/68.jpg",
          workflows: [],
          tasks: [],
        },
      },
    ],
    createdAt: new Date("2025-06-18"),
    updatedAt: new Date("2025-06-18"),
  },
];