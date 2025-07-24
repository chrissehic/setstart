import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the first available project for the user
  const firstProject = await prisma.workflow.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (firstProject) {
    redirect(`/project/${firstProject.id}`);
  } else {
    // If no projects exist, show empty state or redirect to create project
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No Projects Found</h1>
          <p className="text-muted-foreground">Create your first project to get started.</p>
        </div>
      </div>
    );
  }
}
