import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { type NextRequest, NextResponse } from "next/server";

// Enhanced schema for the final workflow project
const workflowGenerationSchema = z.object({
  name: z.string().describe("A catchy, memorable business name that's short and brandable"),
  description: z.string().describe("A concise, professional business description focusing on what the company does and its value proposition"),
  tagline: z.string().describe("A short, memorable tagline that captures the brand essence"),
  tags: z.array(z.string()).max(15).describe("10-15 specific, industry-relevant tags covering business model, target market, product features, industry trends, competitive advantages, and growth strategy"),
  estimatedDuration: z.string().optional().describe("Estimated time to reach operational stage"),
  objectives: z.array(z.object({
    title: z.string().describe("Clear, actionable objective title with specific metrics"),
    description: z.string().describe("Detailed description of what this objective aims to achieve with success criteria"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Priority level for this objective")
  })).max(6).describe("4-6 key business objectives to get started"),
  tasks: z.array(z.object({
    title: z.string().describe("Specific, actionable task title with measurable outcomes"),
    description: z.string().describe("Detailed description of the task with clear deliverables"),
    category: z.string().describe("Task category using ONLY the defined constants: Operations, Strategy, Product Development, Marketing, Sales, Partnerships, Customer Support, Finance, Legal, Fundraising & Investment, Web Development, Team Development, Research & Innovation, Quality Assurance"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]).describe("Task priority level"),
    responsibility: z.enum(["IN_HOUSE", "OUTSOURCED"]).describe("Whether to handle in-house or outsource"),
    dueDate: z.string().optional().describe("Realistic due date for the task")
  })).max(12).describe("8-12 practical tasks to achieve the objectives"),
  product: z.object({
    name: z.string().describe("Name of the main product or service"),
    description: z.string().describe("Detailed description including key features, benefits, target audience, and competitive differentiation"),
    type: z.string().describe("Product type that aligns with the business model")
  }).describe("The main product or service to start with")
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
      tags: z.array(z.string()).max(15),
      estimatedDuration: z.string().optional(),
      objectives: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional()
      })).max(6).optional(),
      tasks: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string(),
        priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
        responsibility: z.enum(["IN_HOUSE", "OUTSOURCED"]).optional(),
        dueDate: z.string().optional()
      })).max(12).optional(),
      product: z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.string().optional()
      }).optional(),
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

    // Enhanced prompt for comprehensive business setup
    const enhancedPrompt = `You are an expert business strategist and startup consultant. Based on this business idea: "${prompt}", create a comprehensive business setup that includes:

BUSINESS FUNDAMENTALS:
- A catchy, memorable business name (use exactly what the user provided if mentioned)
- A professional, benefit-focused business description
- A short, impactful tagline that captures the brand essence
- 10-15 specific, industry-relevant tags covering: business model, target market, product features, industry trends, competitive advantages, and growth strategy

BUSINESS OBJECTIVES (4-6 objectives):
Create realistic, actionable objectives that align with getting a new business operational. Each objective should be:
- Specific and measurable (e.g., "Validate market demand through 25 customer interviews and 100 survey responses" not "Research market")
- Realistic for a startup stage
- Focus on: Market validation, Product development, Legal setup, Marketing strategy, Financial planning, Team building
- Prioritized by business impact (HIGH = critical for launch, MEDIUM = important for growth, LOW = nice to have)
- Clear success metrics and timelines

TASKS (8-12 specific tasks):
Create practical, actionable tasks that help achieve the objectives. Each task should be:
- Specific and measurable (e.g., "Conduct 25 customer interviews with target demographic" not "Talk to customers")
- Realistic timeframe and scope for a startup
- Categorized using ONLY these exact categories: Operations, Strategy, Product Development, Marketing, Sales, Partnerships, Customer Support, Finance, Legal, Fundraising & Investment, Web Development, Team Development, Research & Innovation, Quality Assurance
- Prioritized based on business impact and dependencies
- Clear responsibility (IN_HOUSE = founder can do, OUTSOURCED = requires specialist)
- Assigned to relevant objectives based on logical relationships
- Include realistic due dates and descriptions

INITIAL PRODUCT:
Create one main product or service that makes sense as a starting point for this business. Focus on:
- A minimum viable product (MVP) approach with clear scope
- Detailed description including key features, benefits, and target audience
- Product type that aligns with the business model
- Realistic pricing strategy and positioning
- Clear value proposition and competitive differentiation

Make everything realistic, actionable, and tailored to the specific business type. Avoid generic business jargon - be specific and practical. Use concrete examples and measurable outcomes. Ensure tasks are properly categorized and logically linked to objectives.`;

    // Proceed to generate comprehensive business project
    const { object } = await generateObject({
      model: google("gemini-1.5-pro-latest"),
      schema: workflowGenerationSchema,
      prompt: enhancedPrompt,
    });

    // Validate that we have the essential data
    if (!object.name || !object.description || !object.tagline || !object.tags) {
      return NextResponse.json({ 
        error: "AI response incomplete. Please try again with a more specific business description." 
      }, { status: 400 });
    }

    // Validate objectives, tasks, and product if they exist
    if (object.objectives && (!Array.isArray(object.objectives) || object.objectives.length === 0)) {
      return NextResponse.json({ 
        error: "AI failed to generate objectives. Please try again." 
      }, { status: 400 });
    }

    if (object.tasks && (!Array.isArray(object.tasks) || object.tasks.length === 0)) {
      return NextResponse.json({ 
        error: "AI failed to generate tasks. Please try again." 
      }, { status: 400 });
    }

    // Validate task categories match defined constants
    if (object.tasks) {
      const validCategories = [
        "Operations", "Strategy", "Product Development", "Marketing", "Sales", 
        "Partnerships", "Customer Support", "Finance", "Legal", 
        "Fundraising & Investment", "Web Development", "Team Development", 
        "Research & Innovation", "Quality Assurance"
      ];
      
      const invalidCategories = object.tasks
        .map(task => task.category)
        .filter(category => !validCategories.includes(category));
      
      if (invalidCategories.length > 0) {
        return NextResponse.json({ 
          error: `AI generated invalid task categories: ${invalidCategories.join(', ')}. Please try again.` 
        }, { status: 400 });
      }
    }

    if (object.product && (!object.product.name || !object.product.description)) {
      return NextResponse.json({ 
        error: "AI failed to generate product details. Please try again." 
      }, { status: 400 });
    }

    return NextResponse.json({
      ...object,
      id: workflowId, // Keep the provided workflow ID
    });
  } catch (error) {
    console.error("Error processing workflow prompt:", error);
    return NextResponse.json({ error: "Failed to process the prompt. Please try again." }, { status: 500 });
  }
}
