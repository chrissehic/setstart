import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/competitors - Get all competitors for a workflow
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflowId");

    if (!workflowId) {
      return NextResponse.json({ error: "Workflow ID is required" }, { status: 400 });
    }

    // Verify the user has access to this workflow
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: userId,
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const competitors = await prisma.competitor.findMany({
      where: {
        workflowId: workflowId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(competitors);
  } catch (error) {
    console.error("Error fetching competitors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/competitors - Create a new competitor
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workflowId, name, description, website, logoImage, attributes } = body;

    if (!workflowId || !name) {
      return NextResponse.json(
        { error: "Workflow ID and name are required" },
        { status: 400 }
      );
    }

    // Verify the user has access to this workflow
    const workflow = await prisma.workflow.findFirst({
      where: {
        id: workflowId,
        userId: userId,
      },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const competitor = await prisma.competitor.create({
      data: {
        workflowId,
        name,
        description,
        website,
        logoImage,
        attributes: attributes ? JSON.stringify(attributes) : "{}",
      },
    });

    return NextResponse.json(competitor, { status: 201 });
  } catch (error) {
    console.error("Error creating competitor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
