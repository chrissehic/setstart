import { prisma } from "@/lib/prisma";
// If you get a type error here, run `npx prisma generate` after migration.

export async function getProducts(workflowId: string) {
  return prisma.product.findMany({
    where: { workflowId },
    orderBy: { createdAt: "desc" },
  });
} 