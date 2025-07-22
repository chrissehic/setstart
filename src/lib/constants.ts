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
