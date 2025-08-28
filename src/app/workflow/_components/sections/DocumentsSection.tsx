"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Ellipsis,
  ExternalLink,
  FileImage,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocuments, useDeleteDocument } from "@/hooks/useDocuments";
import { DocumentsModal } from "../modals/DocumentsModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentsSectionProps {
  workflowId: string;
}

export function DocumentsSection({ workflowId }: DocumentsSectionProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data: documents = [], isLoading } = useDocuments(workflowId);
  const deleteDocumentMutation = useDeleteDocument();

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="size-6 mt-1 stroke-muted-foreground stroke-1" />;
      case "image":
        return <FileImage className="size-6 mt-1 stroke-muted-foreground stroke-1" />;
      default:
        return <FileText className="size-6 mt-1 stroke-muted-foreground stroke-1" />;
    }
  };

  // Calculate document counts
  const documentCounts = useMemo(() => {
    const total = documents.length;
    const pdfs = documents.filter((d) => d.fileType === "pdf").length;
    const images = documents.filter((d) => d.fileType === "image").length;
    
    return { total, pdfs, images };
  }, [documents]);

  // Filter documents based on search and type filter
  const filteredDocuments = useMemo(() => {
    let filtered = documents;

    if (search) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((doc) => doc.fileType === typeFilter);
    }

    return filtered;
  }, [search, typeFilter, documents]);

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocumentMutation.mutateAsync({ documentId, workflowId });
    } catch {
      // Error handling is now done in the hook
    }
  };

  // Handle filter toggle
  const handleFilterToggle = (filterType: string) => {
    setTypeFilter(current => current === filterType ? "all" : filterType);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats skeleton */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-12" />
        </div>

        {/* Filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 flex-1" />
        </div>

        {/* Documents grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
            <p className="text-sm text-muted-foreground">
              Store and manage PDFs and images for your business
            </p>
          </div>
          <DocumentsModal workflowId={workflowId}>
            <Button>
              <Upload className="h-4 w-4" />
              Upload Document
            </Button>
          </DocumentsModal>
        </div>

        {/* Empty state */}
        <Card className="border-none">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <FileText className="size-8 stroke-muted-foreground stroke-1" />
            </div>
            <h3 className="text-lg font-medium mb-2">No documents yet</h3>  
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Start building your document library by uploading PDFs and images
              that are relevant to your business.
            </p>
            <DocumentsModal workflowId={workflowId}>
              <Button variant="outline">
                <Upload className="h-4 w-4" />
                Upload your first document
              </Button>
            </DocumentsModal>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
          <p className="text-sm text-muted-foreground">
            Store and manage PDFs and images for your business
          </p>
        </div>
        <DocumentsModal workflowId={workflowId}>
          <Button>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </DocumentsModal>
      </div>

      {/* Toggleable Filter Badges */}
      <div className="flex items-center gap-2">
        <Badge
          variant={typeFilter === "all" ? "default" : "secondary"}
          className={cn(
            "text-sm font-normal cursor-pointer transition-all duration-200",
            typeFilter === "all" 
              ? "bg-primary text-primary-foreground" 
              : "bg-accent text-accent-foreground hover:bg-accent/80"
          )}
          onClick={() => handleFilterToggle("all")}
        >
          {documentCounts.total} total document{documentCounts.total !== 1 ? "s" : ""}
        </Badge>
        
        {documentCounts.pdfs > 0 && (
          <Badge
            variant={typeFilter === "pdf" ? "default" : "outline"}
            className={cn(
              "text-sm font-normal cursor-pointer transition-all duration-200",
              typeFilter === "pdf" 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => handleFilterToggle("pdf")}
          >
            {documentCounts.pdfs} PDF{documentCounts.pdfs !== 1 ? "s" : ""}
          </Badge>
        )}
        
        {documentCounts.images > 0 && (
          <Badge
            variant={typeFilter === "image" ? "default" : "outline"}
            className={cn(
              "text-sm font-normal cursor-pointer transition-all duration-200",
              typeFilter === "image" 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={() => handleFilterToggle("image")}
          >
            {documentCounts.images} image{documentCounts.images !== 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((document) => (
          <Card
            key={document.id}
            className="hover:shadow-md col-span-1 w-full justify-between cursor-pointer group/document hover:bg-muted transition-all duration-300"
            onClick={() => window.open(document.fileUrl, "_blank")}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 w-full">
                  {getFileIcon(document.fileType)}
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base font-medium text-accent-foreground truncate overflow-hidden wrap-anywhere text-ellipsis line-clamp-2 group-hover/document:text-primary-foreground transition-colors">
                      {document.name}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground truncate">
                      {document.fileType.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Ellipsis className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(document.fileUrl, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Document
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(document.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                <span>
                  {document.fileType === "pdf" ? "PDF Document" : "Image File"}
                </span>
                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/document:opacity-100 transition-opacity" />
              </div>
            </CardContent>
          </Card> 
        ))}
      </div>
    </div>
  );
}
