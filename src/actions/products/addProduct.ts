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
  return prisma.product.create({
    data: {
      workflowId,
      name,
      description,
      type,
      image,
    },
  });
} 