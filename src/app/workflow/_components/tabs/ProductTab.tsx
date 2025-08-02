import { ArrowRight, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SECTION_CLASS } from "@/lib/constants"
import { Product } from "@/types/workflow"

interface ProductTabProps {
  title: string
  value: string
  products?: Product[]
}

export const ProductTab = ({ title, value, products = [] }: ProductTabProps) => (
  <section className={SECTION_CLASS}>
    <div className="flex flex-col justify-start gap-2 w-full">
      <h4 id={value} className="scroll-m-20 text-lg text-start font-medium">
        {title}
      </h4>
             {products.length === 0 ? (
         <div className="flex flex-col items-center justify-center text-center">
           <h2 className="text-xl font-medium tracking-tight">Define your Products</h2>
          <p className="text-sm text-muted-foreground max-w-lg text-wrap">
            Showcase your current services, products, or offerings. This helps your team understand what you&apos;re building and delivering to customers.
          </p>
          <Button variant="link">
            Set it up
            <ArrowRight className="size-4" />
          </Button>
        </div>
      ) : (
                 <div className="space-y-3">
           <div className="flex items-center gap-2">
             <Package className="h-4 w-4 text-muted-foreground" />
             <span className="text-sm font-medium">{products.length} product{products.length !== 1 ? 's' : ''}</span>
           </div>
          <div className="space-y-2">
            {products.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                <span className="text-sm font-medium truncate">{product.name}</span>
                {product.type && (
                  <Badge variant="secondary" className="text-xs">
                    {product.type}
                  </Badge>
                )}
              </div>
            ))}
            {products.length > 3 && (
              <div className="text-xs text-muted-foreground text-center">
                +{products.length - 3} more products
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  </section>
)
