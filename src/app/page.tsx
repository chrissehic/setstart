import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OnboardingStartPage } from "@/components/OnboardingStartPage";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check if user has any existing projects
  const existingWorkflows = await prisma.workflow.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If user has projects, redirect to the first one
  if (existingWorkflows.length > 0) {
    redirect(`/project/${existingWorkflows[0].id}`);
  }

  // No projects exist, show onboarding start page
  return <OnboardingStartPage />;
}
