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
  tagline?: string | undefined;
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

export const COMPANY_STAGES = [
  {
    stageNumber: 1,
    key: "existence",
    title: "Existence",
    description:
      "At this stage, your company is focused on proving your idea works. You’re finding customers, building your first product, and figuring out if you can deliver what you promise while staying afloat.",
    challenges: [
      "Struggling to find and keep early customers",
      "Delivering consistently with very limited resources",
      "Deciding what features and markets matter most",
    ],
    goals: [
      "Achieve product–market fit (customers pay and come back)",
      "Acquire your first paying customers and learn from them",
      "Build simple but reliable operations to deliver your offer",
    ],
    nextSteps: [
      "Talk to at least 10–20 customers this month to validate your assumptions",
      "Create a one–page checklist for how you deliver your product or service",
      "Read: *The Mom Test* by Rob Fitzpatrick",
    ],
    checklist: [
      {
        id: "existence-1",
        title: "You have paying customers",
        description:
          "You’ve moved beyond interest or free trials — real customers are paying for what you offer.",
      },
      {
        id: "existence-2",
        title: "You can deliver consistently",
        description:
          "You’re able to fulfill your promise to customers reliably, even if still manually or imperfectly.",
      },
      {
        id: "existence-3",
        title: "You understand what customers value",
        description:
          "You’ve identified the core need your product solves and what matters most to early customers.",
      },
    ],
  },
  {
    stageNumber: 2,
    key: "survival",
    title: "Survival",
    description:
      "You’ve proven your concept works — now you need to make it sustainable. This stage is about generating enough consistent revenue to cover costs and figuring out if you can scale beyond just getting by.",
    challenges: [
      "Cash flow management and keeping up with expenses",
      "Balancing growth and quality as demand grows",
      "Deciding whether to reinvest profits or seek outside funding",
    ],
    goals: [
      "Reach break-even or profitability",
      "Build a small, dependable customer base",
      "Hire or outsource to cover the most critical roles",
    ],
    nextSteps: [
      "Review your finances weekly and create a simple cash flow forecast",
      "Define your ideal customer and double down on reaching them",
      "Read: *Profit First* by Mike Michalowicz",
    ],
    checklist: [
      {
        id: "survival-1",
        title: "You cover your costs",
        description:
          "Your business earns enough to cover expenses consistently, without emergency funding.",
      },
      {
        id: "survival-2",
        title: "You have repeat customers",
        description:
          "You’re building a base of customers who come back and refer others — not just one-off sales.",
      },
      {
        id: "survival-3",
        title: "You track cash flow",
        description:
          "You have a clear picture of when money comes in and goes out, and you plan ahead for gaps.",
      },
    ],
  },
  {
    stageNumber: 3,
    key: "success",
    title: "Success",
    description:
      "You’ve built a stable business that earns a profit — congratulations! Now it’s time to decide: will you maintain this steady company, or will you grow it into something much bigger?",
    challenges: [
      "Choosing between staying stable or taking big growth risks",
      "Delegating leadership as the team grows",
      "Maintaining company culture with more people involved",
      "Avoiding complacency in a comfortable position",
    ],
    goals: [
      "Clarify your vision: lifestyle business or high–growth",
      "Professionalize management and operations",
      "Build a team that can operate without you at the center of everything",
    ],
    nextSteps: [
      "Write down a 3–year vision: where do you want to take this?",
      "Start documenting your key processes and systems",
      "Read: *E–Myth Revisited* by Michael Gerber",
    ],
    checklist: [
      {
        id: "success-1",
        title: "You generate healthy profit",
        description:
          "Your business earns enough profit to sustain itself and provide a cushion for decisions.",
      },
      {
        id: "success-2",
        title: "You’re not in every decision",
        description:
          "Trusted employees and documented processes keep the business running without your constant oversight.",
      },
      {
        id: "success-3",
        title: "You have a clear vision",
        description:
          "You’ve decided whether you want to maintain stability or pursue big growth.",
      },
    ],
  },
  {
    stageNumber: 4,
    key: "takeoff",
    title: "Take–off",
    description:
      "You’ve decided to grow — and now things move fast. This stage is about scaling quickly and effectively while keeping control over quality, finances, and strategy.",
    challenges: [
      "Finding and training enough people to keep up with growth",
      "Funding rapid expansion without overleveraging",
      "Staying focused on your core strengths while exploring new markets",
    ],
    goals: [
      "Build a scalable organizational structure",
      "Secure funding or reinvestment for growth",
      "Empower leaders in key departments",
    ],
    nextSteps: [
      "Create a simple org chart for what your company needs in 12–24 months",
      "Start building a leadership team you can trust",
      "Read: *Scaling Up* by Verne Harnish",
    ],
    checklist: [
      {
        id: "takeoff-1",
        title: "You can handle growth",
        description:
          "Your team and systems can support more customers and more work without breaking down.",
      },
      {
        id: "takeoff-2",
        title: "You have growth resources",
        description:
          "You’ve secured the money, people, and partners you need to expand safely.",
      },
      {
        id: "takeoff-3",
        title: "You stay focused",
        description:
          "You’re keeping your core offering strong, even as you test new opportunities.",
      },
    ],
  },
  {
    stageNumber: 5,
    key: "maturity",
    title: "Maturity",
    description:
      "Your company is established, with steady revenue, strong operations, and a reputation in the market. At this stage, the focus shifts to staying innovative, defending your market position, and possibly planning an exit or reinvention.",
    challenges: [
      "Avoiding stagnation or loss of competitive edge",
      "Keeping employees motivated and engaged",
      "Planning for succession, sale, or reinvention of the business",
    ],
    goals: [
      "Strengthen your market position through innovation or acquisition",
      "Streamline processes and eliminate inefficiencies",
      "Develop and retain strong leadership beyond the founder",
    ],
    nextSteps: [
      "Audit your processes to cut waste and improve agility",
      "Start developing your next generation of leaders",
      "Read: *Built to Last* by Jim Collins",
    ],
    checklist: [
      {
        id: "maturity-1",
        title: "You keep improving",
        description:
          "You continue innovating and refining your business to stay competitive and relevant.",
      },
      {
        id: "maturity-2",
        title: "Your team is strong and motivated",
        description:
          "You have capable leaders and engaged employees who can carry the business forward.",
      },
      {
        id: "maturity-3",
        title: "You have a future plan",
        description:
          "You’ve thought about what comes next: expansion, reinvention, or a planned exit.",
      },
    ],
  },
];





