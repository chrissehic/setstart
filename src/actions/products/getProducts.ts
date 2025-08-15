"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getProducts(workflowId: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthenticated");
  }

  try {
    const products = await prisma.product.findMany({
      where: { workflowId },
      orderBy: { createdAt: "desc" },
      include: {
        variants: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // Parse attributes from JSON string to object
    const productsWithParsedVariants = products.map(product => ({
      ...product,
      variants: product.variants.map(variant => ({
        ...variant,
        attributes: variant.attributes && variant.attributes.trim() !== "" ? JSON.parse(variant.attributes) : null,
      })),
    }));
    
    return productsWithParsedVariants;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products");
  }
}
