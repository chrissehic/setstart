"use server";

import { prisma } from "@/lib/prisma";
// If you get a type error here, run `npx prisma generate` after migration.

export async function addProduct({
  workflowId,
  name,
  description,
  type,
  image,
}: {
  workflowId: string;
  name: string;
  description?: string;
  type?: string;
  image?: string;
}) {
  console.log("Server action - addProduct called with:", { workflowId, name, description, type, image });
  
  try {
    const result = await prisma.product.create({
      data: {
        workflowId,
        name,
        description,
        type,
        image,
      },
    });
    console.log("Server action - Product created successfully:", result);
    return result;
  } catch (error) {
    console.error("Server action - Error creating product:", error);
    throw error;
  }
} 