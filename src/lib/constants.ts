import {
  Presentation, ListTodo, Layers, UsersRound, Eclipse,
  BookOpen, FileText, SquareDashedBottomCode, Smartphone,
  Puzzle, Brain, Cpu, Utensils, Store, Calendar,
  Users, UserCheck,
  Tv,
  Watch,
  Amphora,
  FileKey2,
  Trophy,
} from "lucide-react"


export const WORKSPACE_ITEMS = [
  {
    title: "Overview",
    url: "#overview",
    value: "overview",
    icon: Presentation,
  },
  {
    title: "Masterbrief",
    url: "#masterbrief",
    value: "masterbrief",
    icon: FileKey2,
  },
  {
    title: "Taskboard",
    url: "#taskboard",
    value: "taskboard",
    icon: ListTodo,
  },
  {
    title: "Offering",
    url: "#offering",
    value: "offering",
    icon: Layers,
  }, {
    title: "Documents",
    url: "#documents",
    value: "documents",
    icon: FileText,
  },
  {
    title: "Competitors",
    url: "#competitors",
    value: "competitors",
    icon: Trophy,
  },
  {
    title: "Social Insights",
    url: "#reference-hub",
    value: "reference-hub",
    icon: BookOpen,
  },

  {
    title: "Roles",
    url: "#roles",
    value: "roles",
    icon: UsersRound,
  },
  {
    title: "Growth stage",
    url: "#growth-stage",
    value: "growth-stage",
    icon: Eclipse,
  },

]

export const SECTION_CLASS =
  "relative w-full flex flex-col justify-start items-start rounded-sm p-1 border border-transparent h-full"

export const CARD_CLASS = "flex h-full overflow-y-scroll! flex-col bg-accent w-full rounded-2xl group border bg-card"

export const PRODUCT_TYPES = [
  { value: "SaaS / Web Platform", label: "SaaS / Web Platform" },
  { value: "Mobile App", label: "Mobile App" },
  { value: "AI / Data Tool", label: "AI / Data Tool" },
  { value: "Plugin / Extension", label: "Plugin / Extension" },
  { value: "Media & Content", label: "Media & Content" },
  { value: "Consumer Goods", label: "Consumer Goods" },
  { value: "Wearables & Apparel", label: "Wearables & Apparel" },
  { value: "Hardware / Devices", label: "Hardware / Devices" },
  { value: "Health & Wellness", label: "Health & Wellness" },
  { value: "Hospitality & Retail", label: "Hospitality & Retail" },
  { value: "Consulting & Freelance", label: "Consulting & Freelance" },
  { value: "On-Demand Services", label: "On-Demand Services" },
  { value: "Other", label: "Other" },
];


export const PRODUCT_TYPE_ICONS: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  "SaaS / Web Platform": SquareDashedBottomCode,
  "Mobile App": Smartphone,
  "AI / Data Tool": Brain,
  "Plugin / Extension": Puzzle,
  "Media & Content": Tv,
  "Consumer Goods": Amphora,
  "Wearables & Apparel": Watch,
  "Hardware / Devices": Cpu,
  "Health & Wellness": Utensils,
  "Hospitality & Retail": Store,
  "Consulting & Freelance": Calendar,
  "On-Demand Services": Users,
  "Other": UserCheck,
};

