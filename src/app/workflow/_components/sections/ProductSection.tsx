"use client"

import { Plus, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Product } from "@/types/workflow"
import { ProductModal } from "../modals/ProductModal"
import Image from "next/image"

interface ProductSectionProps {
  workflowId: string
  products: Product[]
}

export function ProductSection({ workflowId, products }: ProductSectionProps) {

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <ProductModal workflowId={workflowId}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </ProductModal>
        </div>
        
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Layers className="h-12 w-12 stroke-muted-foreground stroke-1 mb-4" />
            <h3 className="text-lg font-medium mb-2">No products yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Showcase your current services, products, or offerings. This helps your team understand what you&apos;re building and delivering to customers.
            </p>
            <ProductModal workflowId={workflowId}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add your first product
              </Button>
            </ProductModal>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
        <ProductModal workflowId={workflowId}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </ProductModal>
      </div>
      
              <div className="space-y-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <ProductModal workflowId={workflowId} product={product}>
                <div className="cursor-pointer">
                  <div className="flex">
                    {/* Product Image */}
                    {product.image && (
                      <div className="w-32 h-24 relative flex-shrink-0">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Product Information */}
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-foreground truncate">
                            {product.name}
                          </h3>
                        </div>
                        {product.type && (
                          <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                            {product.type}
                          </Badge>
                        )}
                      </div>
                      
                      {product.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </ProductModal>
            </Card>
          ))}
        </div>
    </div>
  )
} 