"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useDocuments } from "@/hooks/useDocuments";

interface DocumentsPreviewProps {
  workflowId: string;
}

export function DocumentsPreview({ workflowId }: DocumentsPreviewProps) {
  const { data: documents = [], isLoading } = useDocuments(workflowId);

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="size-5" />;
      case "image":
        return <ImageIcon className="size-5" />;
      default:
        return <FileText className="size-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-40 rounded" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center">
        <h2 className="text-base font-medium tracking-tight">
          Add documents to your workflow
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg text-wrap">
          Start building your document library by uploading PDFs and images
          that are relevant to your business.
        </p>
        <Button variant="link" className="no-underline font-normal">
          Upload your first document
          <ArrowRight className="size-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Stats */}
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {documents.length} total
        </Badge>
        <Badge variant="outline" className="text-xs">
          {documents.filter((d) => d.fileType === "pdf").length} PDFs
        </Badge>
      </div>

      {/* Document List */}
      <div className="space-y-2 flex flex-wrap gap-2 items-center">
        {documents.slice(0, 3).map((document) => (
          <Card key={document.id} className="w-fit p-0">
            <CardContent className="p-2 flex flex-row items-center gap-2 h-full">
              <div className="flex items-center gap-2 flex-1">
                {getFileIcon(document.fileType)}
                <div className="flex min-w-0 flex-row items-center gap-1">
                  <div className="flex flex-col items-start justify-center">
                    <p className="text-sm font-medium truncate max-w-[120px]">
                      {document.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {document.fileType.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {documents.length > 3 && (
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              +{documents.length - 3} more
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
