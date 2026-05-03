"use client";

import { useState, useRef, useEffect } from "react";
// import { Send, Bot, User, Sparkles, Lightbulb, Target, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WorkflowData } from "@/types/workflow";
// import { AssistantInput } from "./AssistantInput";
import SetIcon from "@/components/SetIcon";
import MultiPurposeInput from "@/components/AIInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getAssistantSuggestions,
  type SectionValue,
} from "@/lib/assistantSuggestions";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface AssistantPaneProps {
  data: WorkflowData;
  currentSection?: SectionValue | string;
}

export const AssistantPane = ({ data, currentSection }: AssistantPaneProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get section-specific suggestions
  const suggestedPrompts = getAssistantSuggestions(currentSection || "default");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about "${content.trim()}" regarding your ${
          data.name
        } project. This is a simulated response - in a real implementation, this would connect to an AI service to provide intelligent assistance based on your project data and context.`,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 5000);
  };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   handleSendMessage(inputValue);
  // };

  // const handleSuggestedPrompt = (prompt: string) => {
  //   setInputValue(prompt);
  //   inputRef.current?.focus();
  // };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      {/* <div className="flex-shrink-0 p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">AI Assistant</h2>
            <p className="text-sm text-muted-foreground">
              Get help with your {data.name} project
            </p>
          </div>
        </div>
      </div> */}

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
            <div className="flex flex-col items-center justify-center gap-4">
              <SetIcon className="size-20 text-primary" animated={true} />
              <div className="flex flex-col items-center justify-center gap-1">
                <h3 className="text-lg font-semibold text-foreground">
                  Talk to your project
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Let&apos;s work on anything from project planning to document
                  analysis, suggestions, and answering questions about your
                  business.
                </p>
              </div>
            </div>

            {/* Suggested Prompts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
              {suggestedPrompts.map((suggestion, index) => (
                <Card
                  key={index}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => setInputValue(suggestion.prompt)}
                >
                  <CardHeader>
                    <CardTitle>{suggestion.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">
                      {suggestion.prompt}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Input Area */}
            <div className="flex-shrink-0 relative w-full">
              <MultiPurposeInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={() => handleSendMessage(inputValue)}
                placeholder="Ask me anything about your project..."
                disabled={isLoading}
                isLoading={isLoading}
                showButton={true}
                maxLength={500}
                useAbsolutePosition={true}
                containerClassName="w-full"
              />

              {/* Info Section */}
              <div className="flex justify-center items-center pointer-events-none">
                <div className="bg-background/95 backdrop-blur-sm max-w-4xl mx-auto">
                  <p className="text-xs text-muted-foreground text-center">
                    AI powered by your project context • Press Enter to send
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-sm px-3 py-2",
                      message.role === "user"
                        ? "max-w-[80%] bg-accent text-accent-foreground"
                        : "text-foreground"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <SetIcon
                    className="size-8 text-primary"
                    loading={isLoading}
                    animated={false}
                  />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
