import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workflowId: string }> }
) {
  try {
    const { workflowId } = await params;
    
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
    
    return NextResponse.json(productsWithParsedVariants);
  } catch (error) {
    console.error("Error in API route getProducts:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
} 