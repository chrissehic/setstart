"use server";

import { prisma } from "@/lib/prisma";
import { updateProductVariantSchema } from "@/../schema/product";
import { revalidatePath } from "next/cache";

export async function updateProductVariant(data: any) {
  try {
    const validatedData = updateProductVariantSchema.parse(data);
    
    const variant = await prisma.productVariant.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        attributes: validatedData.attributes ? JSON.stringify(validatedData.attributes) : null,
        price: validatedData.price,
        image: validatedData.image,
        isActive: validatedData.isActive,
      },
    });

    revalidatePath(`/workflow/editor/${variant.productId}`);
    return { success: true, data: variant };
  } catch (error) {
    console.error("Error updating product variant:", error);
    return { success: false, error: "Failed to update product variant" };
  }
} 