import { Presentation, ListTodo, Layers, UsersRound, Eclipse } from "lucide-react"

export const WORKSPACE_ITEMS = [
  {
    title: "Overview",
    url: "#overview",
    value: "overview",
    icon: Presentation,
  },
  {
    title: "Taskboard",
    url: "#taskboard",
    value: "taskboard",
    icon: ListTodo,
  },
  {
    title: "Product",
    url: "#product",
    value: "product",
    icon: Layers,
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
  { value: "SaaS", label: "SaaS" },
  { value: "Mobile App", label: "Mobile App" },
  { value: "Web App", label: "Web App" },
  { value: "Plugin / Extension", label: "Plugin / Extension" },
  { value: "AI Tool", label: "AI Tool" },
  { value: "Packaged Goods", label: "Packaged Goods" },
  { value: "Wearables / Apparel", label: "Wearables / Apparel" },
  { value: "Health / Wellness Product", label: "Health / Wellness Product" },
  { value: "Hardware Device", label: "Hardware Device" },
  { value: "Restaurant / Cafe", label: "Restaurant / Cafe" },
  { value: "Retail Space", label: "Retail Space" },
  { value: "Pop-up / Event", label: "Pop-up / Event" },
  { value: "Consulting", label: "Consulting" },
  { value: "Freelance Service", label: "Freelance Service" },
  { value: "On-Demand Service", label: "On-Demand Service" },
  { value: "Course / Educational Content", label: "Course / Educational Content" },
  { value: "Podcast / Video Series", label: "Podcast / Video Series" },
  { value: "Newsletter / Blog", label: "Newsletter / Blog" },
  { value: "Internal Tool", label: "Internal Tool" },
  { value: "Hybrid", label: "Hybrid (Physical + Digital)" },
  { value: "Other", label: "Other" },
];

