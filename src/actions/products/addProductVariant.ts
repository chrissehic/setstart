"use server";

import { prisma } from "@/lib/prisma";
import { addProductVariantSchema } from "@/../schema/product";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function addProductVariant(data: z.infer<typeof addProductVariantSchema>) {
  try {
    const validatedData = addProductVariantSchema.parse(data);
    
    const variant = await prisma.productVariant.create({
      data: {
        productId: validatedData.productId,
        name: validatedData.name,
        description: validatedData.description,
        attributes: validatedData.attributes ? JSON.stringify(validatedData.attributes) : "",
        price: validatedData.price,
        image: validatedData.image,
      },
    });

    revalidatePath(`/workflow/editor/${variant.productId}`);
    revalidatePath(`/project/${variant.productId}`);
    return { success: true, data: variant };
  } catch (error) {
    console.error("Error adding product variant:", error);
    return { success: false, error: "Failed to add product variant" };
  }
} 