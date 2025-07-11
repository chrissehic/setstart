import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";

// Schema for the final workflow project
const workflowGenerationSchema = z.object({
  name: z.string().describe("A clear, descriptive name for the project"),
  description: z.string().describe("A detailed description of what the project does"),
  tagline: z.string().describe("A simple tagline for the business"),
  tags: z.array(z.string()).max(10).describe("Relevant tags that categorize the project"),
  estimatedDuration: z.string().optional().describe("Estimated time to complete the business project"),
});

export async function POST(request: NextRequest) {
  try {
    const { prompt, workflowId } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Valid prompt is required" }, { status: 400 });
    }

    if (!workflowId || typeof workflowId !== "string") {
      return NextResponse.json({ error: "Valid workflow ID is required" }, { status: 400 });
    }

const validationPrompt = `
You are a business branding and strategy assistant.
The user has described their business idea or company focus.
Your task is to craft a clear, concise company overview for them — generating a brand name **only if none is provided.**

Input: "${prompt}"

Instructions:
1. If the input is a random string of characters, extremely vague, or completely unrelated to business, respond ONLY with:
   {"error": "OFF_TOPIC"}

2. If the input already includes a brand or company name, **use exactly that name as provided. Do not invent a different name or "project name".**

3. If the input is minimal but business-relevant, generate a reasonable business overview using defaults and creativity.

Respond only in *valid JSON*, matching this schema exactly:

{
  "name": "The name of the company — use exactly what the user provided if mentioned, otherwise generate a creative, relevant, and memorable name",
  "description": "A short, brand-friendly description of the company and its main product(s), focusing on benefits to customers",
  "tagline": "A memorable and catchy tagline for the company",
  "tags": ["No more than 10 relevant tags about the company, its industry, its product, and its strategy"]
}

⚠️ Output only valid JSON — no explanations, no markdown, no extra lines — just the JSON object.
`;


    // Validation schema
    const validationSchema = z.object({
      name: z.string(),
      description: z.string(),
      tagline: z.string(),
      tags: z.array(z.string()).max(10),
      error: z.enum(["OFF_TOPIC"]).optional(),
    });

    // Run validation
    const validationResult = await generateObject({
      model: google("gemini-1.5-pro-latest"),
      schema: validationSchema,
      prompt: validationPrompt,
    });

    console.log("Validated Response:", validationResult);

    // If validation flagged as OFF_TOPIC, return early
    if (validationResult.object.error === "OFF_TOPIC") {
      return NextResponse.json({ error: "Input is off-topic or too vague for business context" }, { status: 400 });
    }

    // Proceed to generate full business project
    const { object } = await generateObject({
      model: google("gemini-1.5-pro-latest"),
      schema: workflowGenerationSchema,
      prompt: `Generate a detailed business project based on this input: "${prompt}"`,
    });

    return NextResponse.json({
      ...object,
      id: workflowId, // Keep the provided workflow ID
    });
  } catch (error) {
    console.error("Error processing workflow prompt:", error);
    return NextResponse.json({ error: "Failed to process the prompt. Please try again." }, { status: 500 });
  }
}
