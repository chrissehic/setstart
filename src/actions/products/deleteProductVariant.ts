"use server";

import { prisma } from "@/lib/prisma";
import { deleteProductVariantSchema } from "@/../schema/product";
import { revalidatePath } from "next/cache";

export async function deleteProductVariant(data: any) {
  try {
    const validatedData = deleteProductVariantSchema.parse(data);
    
    const variant = await prisma.productVariant.delete({
      where: { id: validatedData.id },
    });

    revalidatePath(`/workflow/editor/${variant.productId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting product variant:", error);
    return { success: false, error: "Failed to delete product variant" };
  }
} 