"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, FileImage } from "lucide-react";
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
        return <FileText className="size-4 text-muted-foreground" />;
      case "image":
        return <FileImage className="size-4 text-muted-foreground" />;
      default:
        return <FileText className="size-4 text-muted-foreground" />;
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
      <div className="space-y-2 grid grid-cols-4 gap-1 items-center">
        {documents.slice(0, 4).map((document) => (
          <Card key={document.id} className="w-full p-0">
            <CardContent className="p-2 flex flex-row items-center gap-2 h-full">
              <div className="flex items-center gap-2 w-full">
                {getFileIcon(document.fileType)}
                <div className="flex min-w-0 flex-row items-center gap-1">
                  <div className="flex flex-col items-start justify-center w-full">
                    <p className="text-sm font-medium overflow-hidden text-ellipsis whitespace-nowrap line-clamp-1 w-full">
                      {document.name}
                    </p>
                    <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap line-clamp-1 w-full">
                      {document.fileType.toUpperCase()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {documents.length > 3 && (
          <div className="text-center absolute bottom-2 right-0 left-0">
            <Badge variant="outline" className="text-xs">
              +{documents.length - 3} more
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
