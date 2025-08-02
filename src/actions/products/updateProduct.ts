"use server";

import { prisma } from "@/lib/prisma";
// If you get a type error here, run `npx prisma generate` after migration.

export async function updateProduct({
  id,
  name,
  description,
  type,
  image,
}: {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  image?: string;
}) {
  return prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(type !== undefined && { type }),
      ...(image !== undefined && { image }),
    },
  });
} 