import { Loader2 } from "lucide-react"

export const LoadingSpinner = () => (
  <main className="h-full w-full">
    <div className="flex items-center justify-center h-full">
      <Loader2 className="size-8 animate-spin text-transparent stroke-1 stroke-foreground" />
    </div>
  </main>
)
