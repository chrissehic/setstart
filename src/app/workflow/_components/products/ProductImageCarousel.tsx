"use client";

import { useState, useEffect } from "react";
import { Layers } from "lucide-react";
import Image from "next/image";
import { Product, ProductVariant } from "@/types/workflow";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

interface ProductImageCarouselProps {
  product: Product;
  className?: string;
}

export function ProductImageCarousel({ product, className }: ProductImageCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();

  // Collect all images: main product image + variant images
  const allImages = () => {
    const images: Array<{ src: string; alt: string; type: 'main' | 'variant'; name?: string }> = [];
    
    // Add main product image if it exists
    if (product.image) {
      images.push({
        src: product.image,
        alt: product.name,
        type: 'main',
        name: product.name
      });
    }
    
    // Add variant images if they exist
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach((variant: ProductVariant) => {
        if (variant.image) {
          images.push({
            src: variant.image,
            alt: `${variant.name} variant`,
            type: 'variant',
            name: variant.name
          });
        }
      });
    }
    
    return images;
  };

  const images = allImages();

  // Listen for carousel selection changes
  useEffect(() => {
    if (!api) return;
    
    const onSelect = () => {
      setSelectedIndex(api.selectedScrollSnap());
    };
    
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  // If no images, show placeholder
  if (images.length === 0) {
    return (
      <div className={`aspect-video relative rounded-lg overflow-hidden border bg-accent flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
          <Layers className="size-20 stroke-1 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No images available</p>
        </div>
      </div>
    );
  }



  return (
    <div className={`relative ${className} flex flex-col items-center `}>
      <Carousel
        opts={{
          loop: true,
        }}
        className="w-full group/carousel max-w-2xl rounded-md overflow-hidden"
        setApi={setApi}
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="group/imagecard">
              <div className="aspect-video relative ">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                {/* Image overlay with type indicator */}
                <div className="absolute top-3 left-3">
                  <Badge className={`
                    text-xs font-medium text-foreground
                    ${image.type === 'main' 
                      ? 'bg-primary/90' 
                      : 'bg-secondary/60'
                    }
                  `}>
                    {image.type === 'main' ? 'Main' : 'Variant'}
                  </Badge>
                </div>
                {/* Image name overlay */}
                {image.name && (
                  <div className="absolute bottom-3 left-3 w-fit opacity-0 transition-all duration-300 group-hover/imagecard:opacity-100">
                    <Badge className="bg-background/60 text-foreground text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                      {image.name}
                    </Badge>
                  </div>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <div className="opacity-0 group-hover/carousel:opacity-100 transition-all duration-300">
            <CarouselPrevious className="bg-accent/60 hover:bg-accent/80 absolute left-3 top-1/2 -translate-y-1/2" variant="ghost"/>
            <CarouselNext className="bg-accent/60 hover:bg-accent/80 absolute right-3 top-1/2 -translate-y-1/2" variant="ghost"/>
          </div>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <Badge className="opacity-0 group-hover/carousel:opacity-100 transition-all duration-300 absolute py-2 bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-background/60">
            {images.map((_, index) => (
              <button
                key={index}
                className={`w-1.5 h-1.5 cursor-pointer rounded-full transition-all ${
                  index === selectedIndex
                    ? 'bg-foreground scale-110'
                    : 'bg-foreground/50 hover:bg-foreground/75'
                }`}
                onClick={() => {
                  if (api) {
                    api.scrollTo(index);
                  }
                }}
              />
            ))}
          </Badge>
        )}

 
      </Carousel>
    </div>
  );
}
