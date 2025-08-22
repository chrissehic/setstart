import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/competitors/[id] - Get a specific competitor
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const competitor = await prisma.competitor.findFirst({
      where: {
        id: params.id,
        workflow: {
          userId: userId,
        },
      },
    });

    if (!competitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    return NextResponse.json(competitor);
  } catch (error) {
    console.error("Error fetching competitor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/competitors/[id] - Update a competitor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, website, logoImage, strengths, weaknesses, marketShare, pricing, features, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    // Verify the user has access to this competitor's workflow
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id: params.id,
        workflow: {
          userId: userId,
        },
      },
    });

    if (!existingCompetitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    const updatedCompetitor = await prisma.competitor.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
        website,
        logoImage,
        strengths: strengths ? JSON.stringify(strengths) : null,
        weaknesses: weaknesses ? JSON.stringify(weaknesses) : null,
        marketShare,
        pricing,
        features: features ? JSON.stringify(features) : null,
        notes,
      },
    });

    return NextResponse.json(updatedCompetitor);
  } catch (error) {
    console.error("Error updating competitor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/competitors/[id] - Delete a competitor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user has access to this competitor's workflow
    const existingCompetitor = await prisma.competitor.findFirst({
      where: {
        id: params.id,
        workflow: {
          userId: userId,
        },
      },
    });

    if (!existingCompetitor) {
      return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
    }

    await prisma.competitor.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Competitor deleted successfully" });
  } catch (error) {
    console.error("Error deleting competitor:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
