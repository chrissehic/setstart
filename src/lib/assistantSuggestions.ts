export interface AssistantSuggestion {
  title: string;
  prompt: string;
}

export type SectionValue = 
  | "overview"
  | "taskboard"
  | "offering"
  | "documents"
  | "competitors"
  | "reference-hub"
  | "roles"
  | "growth-stage"
  | "default";

export const ASSISTANT_SUGGESTIONS: Record<SectionValue, AssistantSuggestion[]> = {
  overview: [
    {
      title: "Project Summary",
      prompt: "Give me a comprehensive summary of this project, including key objectives and current status.",
    },
    {
      title: "Improve Description",
      prompt: "Help me improve the project description to make it more compelling and clear.",
    },
    {
      title: "Next Steps",
      prompt: "What are the most important next steps I should focus on for this project?",
    },
    {
      title: "Project Vision",
      prompt: "Help me refine the vision and mission for this project.",
    },
  ],
  taskboard: [
    {
      title: "Prioritize Tasks",
      prompt: "Help me prioritize my tasks based on importance and dependencies.",
    },
    {
      title: "Create Task Plan",
      prompt: "Suggest a task breakdown for achieving my main objectives.",
    },
    {
      title: "Task Analysis",
      prompt: "Analyze my current tasks and suggest improvements or identify bottlenecks.",
    },
    {
      title: "Progress Review",
      prompt: "Review my task progress and suggest what to focus on next.",
    },
  ],
  offering: [
    {
      title: "Product Strategy",
      prompt: "Help me develop a better product strategy and positioning.",
    },
    {
      title: "Feature Ideas",
      prompt: "Suggest innovative features that would enhance my product offering.",
    },
    {
      title: "Product Description",
      prompt: "Help me write a compelling product description that highlights key benefits.",
    },
    {
      title: "Market Fit",
      prompt: "Analyze my product offering and suggest ways to improve market fit.",
    },
  ],
  documents: [
    {
      title: "Document Organization",
      prompt: "Help me organize my documents better and suggest a filing structure.",
    },
    {
      title: "Document Analysis",
      prompt: "Analyze my documents and extract key insights or action items.",
    },
    {
      title: "Create Summary",
      prompt: "Create a summary of the most important documents in my project.",
    },
    {
      title: "Document Gaps",
      prompt: "Identify what important documents might be missing from my project.",
    },
  ],
  competitors: [
    {
      title: "Competitive Analysis",
      prompt: "Analyze my competitors and help me identify key differentiators.",
    },
    {
      title: "Market Position",
      prompt: "Help me understand my position in the market compared to competitors.",
    },
    {
      title: "Competitive Strategy",
      prompt: "Suggest strategies to gain a competitive advantage.",
    },
    {
      title: "Gap Analysis",
      prompt: "Identify gaps in my offering compared to my competitors.",
    },
  ],
  "reference-hub": [
    {
      title: "Research Insights",
      prompt: "Extract key insights from my reference materials and research.",
    },
    {
      title: "Trend Analysis",
      prompt: "Analyze trends from my references and suggest how to apply them.",
    },
    {
      title: "Reference Summary",
      prompt: "Summarize the most valuable information from my reference hub.",
    },
    {
      title: "Apply Learnings",
      prompt: "Help me apply insights from my references to improve my project.",
    },
  ],
  roles: [
    {
      title: "Team Structure",
      prompt: "Help me optimize my team structure and role assignments.",
    },
    {
      title: "Role Gaps",
      prompt: "Identify what roles or skills might be missing from my team.",
    },
    {
      title: "Team Analysis",
      prompt: "Analyze my current team composition and suggest improvements.",
    },
    {
      title: "Hiring Strategy",
      prompt: "Suggest what roles I should prioritize hiring for next.",
    },
  ],
  "growth-stage": [
    {
      title: "Stage Assessment",
      prompt: "Assess my current growth stage and what I need to focus on.",
    },
    {
      title: "Stage Challenges",
      prompt: "Help me understand and overcome challenges specific to my current stage.",
    },
    {
      title: "Next Stage Prep",
      prompt: "What should I prepare to advance to the next growth stage?",
    },
    {
      title: "Stage Goals",
      prompt: "Help me set and prioritize goals for my current growth stage.",
    },
  ],
  default: [
    {
      title: "Project Goals",
      prompt: "What are the main objectives for this project and how can I achieve them?",
    },
    {
      title: "Progress Analysis",
      prompt: "Analyze the current progress and suggest next steps for improvement.",
    },
    {
      title: "Ideas & Innovation",
      prompt: "What innovative approaches could I take to enhance this project?",
    },
    {
      title: "Optimization",
      prompt: "How can I optimize the workflow and make it more efficient?",
    },
  ],
};

/**
 * Get assistant suggestions for a specific section
 */
export function getAssistantSuggestions(section: SectionValue | string): AssistantSuggestion[] {
  // Validate section and return appropriate suggestions
  const validSection = Object.keys(ASSISTANT_SUGGESTIONS).includes(section)
    ? (section as SectionValue)
    : "default";
  
  return ASSISTANT_SUGGESTIONS[validSection] || ASSISTANT_SUGGESTIONS.default;
}

