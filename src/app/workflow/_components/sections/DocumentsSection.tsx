"use client";

import { useState, useMemo } from "react";
import {
  FileText,
  ImageIcon,
  Upload,
  Search,
  Trash2,
  Ellipsis,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useDocuments, useDeleteDocument } from "@/hooks/useDocuments";
import { DocumentsModal } from "../modals/DocumentsModal";
import { Button } from "@/components/ui/button";

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
        return <ImageIcon className="size-6 mt-1 stroke-muted-foreground stroke-1" />;
      default:
        return <FileText className="size-6 mt-1 stroke-muted-foreground stroke-1" />;
    }
  };

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
      toast.success("Document deleted successfully");
    } catch {
      toast.error("Failed to delete document");
    }
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
          <Skeleton className="h-10 w-32" />
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
              <FileText className="h-8 w-8 stroke-muted-foreground stroke-1" />
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

      {/* Stats */}
      <div className="flex items-center gap-2">
        {documents.length > 0 && (
          <Badge
            variant="secondary"
            className="text-xs bg-accent text-primary-foreground border-foreground/20"
          >
            {documents.length} total document
            {documents.length !== 1 ? "s" : ""}
          </Badge>
        )}
        {documents.filter((d) => d.fileType === "pdf").length > 0 && (
          <Badge variant="outline" className="text-xs">
            {documents.filter((d) => d.fileType === "pdf").length} PDFs
          </Badge>
        )}
        {documents.filter((d) => d.fileType === "image").length > 0 && (
          <Badge variant="outline" className="text-xs">
            {documents.filter((d) => d.fileType === "image").length} Images
          </Badge>
        )}
      </div>

      {/* Filters */}
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
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="pdf">PDFs</SelectItem>
            <SelectItem value="image">Images</SelectItem>
          </SelectContent>
        </Select>
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
