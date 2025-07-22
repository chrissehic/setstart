import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SECTION_CLASS } from "@/lib/constants"

interface ProductTabProps {
  title: string
  value: string
}

export const ProductTab = ({ title, value }: ProductTabProps) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col justify-start gap-2 w-full">
      <h4 id={value} className="scroll-m-20 text-lg text-start font-medium">
        {title}
      </h4>
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-medium tracking-tight">Define your Product</h2>
        <p className="text-sm text-muted-foreground max-w-lg text-wrap">
          You haven&apos;t described your product yet. Outline the product, service, or combination you deliver to customers
          and align your team behind it.
        </p>
        <Button variant="link">
          Set it up
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  </section>
)
