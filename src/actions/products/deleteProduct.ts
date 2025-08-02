"use server";

import { prisma } from "@/lib/prisma";
// If you get a type error here, run `npx prisma generate` after migration.

export async function deleteProduct(id: string) {
  return prisma.product.delete({
    where: { id },
  });
} 