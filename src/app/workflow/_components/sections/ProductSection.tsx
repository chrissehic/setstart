"use client";

import { useState } from "react";
import { Plus, Layers, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductModal } from "../modals/ProductModal";
import { ProductDetails } from "../products/ProductDetails";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Product } from "@/types/workflow";
import { PRODUCT_TYPE_ICONS } from "@/lib/constants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ProductSectionProps {
  workflowId: string;
}

export function ProductSection({ workflowId }: ProductSectionProps) {
  const { data: products = [], isLoading, error } = useProducts(workflowId);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Helper function to get the appropriate icon for a product type
  const getProductIcon = (productType: string) => {
    const IconComponent = PRODUCT_TYPE_ICONS[productType] || Layers;
    return <IconComponent className="size-20 stroke-1 text-muted-foreground" />;
  };

  // Handle product selection
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  // Handle going back to product list
  const handleBackToList = () => {
    setSelectedProduct(null);
  };

  // Handle edit mode
  const handleEditProduct = () => {
    // This will be handled by the ProductDetails component
  };

  // If a product is selected, show the details view
  if (selectedProduct) {
    return (
      <ProductDetails
        product={selectedProduct}
        workflowId={workflowId}
        onBack={handleBackToList}
        onEdit={handleEditProduct}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Offering</h2>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Offering</h2>
        </div>

         <div className="min-h-screen flex items-start justify-start p-4 w-full">
                <Alert variant="destructive" className="">
                  <AlertCircleIcon />
                  <AlertTitle>Error loading offering</AlertTitle>
                  <AlertDescription>
                    <p>{"Offering not found"}</p>
                  </AlertDescription>
                </Alert>
              </div>
      </div>
    );
  }
  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">Offering</h2>
          <ProductModal 
            workflowId={workflowId}
            onProductCreated={(newProduct) => setSelectedProduct(newProduct)}
          >
            <Button>
              <Plus className="h-4 w-4" />
              Add offering
            </Button>
          </ProductModal>
        </div>

        <Card className="border-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Layers className="size-8 stroke-muted-foreground stroke-1" />
            </div>
            <h3 className="text-lg font-medium mb-2">No offering yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Showcase your current offering (product, service, etc.). This helps
              your team understand what you&apos;re building and delivering to
              customers.
            </p>
            <ProductModal 
              workflowId={workflowId}
              onProductCreated={(newProduct) => setSelectedProduct(newProduct)}
            >
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                Add your first offering
              </Button>
            </ProductModal>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Offering</h2>
        <ProductModal 
          workflowId={workflowId}
          onProductCreated={(newProduct) => setSelectedProduct(newProduct)}
        >
          <Button>
            <Plus className="h-4 w-4" />
            Add offering
          </Button>
        </ProductModal>
      </div>

      <div className="space-y-4">
        {products.map((product: Product) => (
          <Card
            key={product.id}
            className="overflow-hidden group p-0 hover:shadow-md hover:bg-muted/50 transition-all duration-200 ease-in-out cursor-pointer"
            onClick={() => handleProductSelect(product)}
          >
            <div className="flex h-full">
              {/* Product Image or Icon Placeholder */}
              <div className="relative flex-1 aspect-video bg-accent flex items-center justify-center">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
                    {getProductIcon(product.type || "Other")}
                  </div>
                )}
              </div>

              {/* Product Information */}
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-1">
                    {product.type && (
                      <Badge
                        variant="secondary"
                        className="text-xs flex-shrink-0"
                      >
                        {product.type}
                      </Badge>
                    )}
                    <h3 className="text-2xl font-semibold text-foreground truncate">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
