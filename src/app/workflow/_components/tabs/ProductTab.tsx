import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SECTION_CLASS, PRODUCT_TYPE_ICONS } from "@/lib/constants";
import { getProductDisplayImage } from "@/lib/utils";
import { Product } from "@/types/workflow";
import { Card } from "@/components/ui/card";
import Image from "next/image";

interface ProductTabProps {
  title: string;
  value: string;
  products?: Product[];
}

export const ProductTab = ({
  title,
  value,
  products = [],
}: ProductTabProps) => {
  // Helper function to get the appropriate icon for a product type
  const getProductIcon = (productType: string) => {
    const IconComponent =
      PRODUCT_TYPE_ICONS[productType] || PRODUCT_TYPE_ICONS["Other"];
    return <IconComponent className="size-10 stroke-1 text-muted-foreground" />;
  };

  return (
    <section className={SECTION_CLASS}>
      <div className="flex flex-col justify-start gap-2 w-full">
        <h4 id={value} className="scroll-m-20 text-lg text-start font-medium">
          {title}
        </h4>
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center">
            <h2 className="text-base font-medium tracking-tight">
              Define your Offering
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg text-wrap">
              Showcase your current offering (product, service, etc.). This
              helps your team understand what you&apos;re building and
              delivering to customers.
            </p>
            <Button variant="link" className="no-underline font-normal">
              Set up your offering
              <ArrowRight className="size-3 -rotate-45" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {products.length} product{products.length !== 1 ? "s" : ""}
              </span>
            </div> */}
            <div className="flex flex-col gap-2 relative mb-2">
              {products.slice(0, 3).map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden group p-0 hover:shadow-md transition-shadow"
                >
                  <div className="cursor-pointer">
                    <div className="flex h-full">
                      {/* Product Image or Icon Placeholder */}
                      <div className="relative flex-1 aspect-video bg-accent flex items-center justify-center">
                        {(() => {
                          const displayImage = getProductDisplayImage(product);
                          if (displayImage) {
                            return (
                              <Image
                                src={displayImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            );
                          }
                          return (
                            <div className="flex flex-col items-center justify-center gap-1 text-center p-2">
                              {getProductIcon(product.type || "Other")}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Product Information */}
                      <div className="flex-3 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 space-y-1">
                            {product.type && (
                              <span className="text-xs flex-shrink-0">
                                {product.type}
                              </span>
                            )}
                            <h3 className="text-base font-semibold text-foreground truncate">
                              {product.name}
                            </h3>
                          </div>
                        </div>

                        {product.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 text-wrap text-start text-ellipsis w-full">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {products.length > 3 && (
                <div className="absolute flex flex-row w-full items-center justify-center bg-transparent -bottom-2">
                  <Badge variant="inverse" className="text-xs opacity-70">
                    <span className="text-accent px-2">
                      +{products.length - 3} more
                    </span>
                  </Badge>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
