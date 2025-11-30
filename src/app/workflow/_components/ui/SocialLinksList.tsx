"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Edit,
  Trash2,
  Globe,
  Facebook,
  Youtube,
  Github,
  MessageCircle,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { SocialLinkModal } from "../modals/SocialLinkModal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DeleteSocialLink } from "@/actions/workflows/deleteSocialLink";
import { toast } from "sonner";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SocialLink {
  id: string;
  name: string;
  url: string;
  handle?: string | null;
  icon?: string | null;
}

interface SocialLinksListProps {
  workflowId: string;
  socialLinks: SocialLink[];
}

export default function SocialLinksList({
  workflowId,
  socialLinks,
}: SocialLinksListProps) {
  const [editingSocialLink, setEditingSocialLink] = useState<SocialLink | null>(
    null
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState<{ open: boolean; socialLinkId: string | null; socialLinkName: string | null }>({ open: false, socialLinkId: null, socialLinkName: null });
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: DeleteSocialLink,
    onSuccess: (deletedSocialLink) => {
      toast.success("Social link deleted successfully");
      // Update the React Query cache by removing the deleted social link
      const currentWorkflow = queryClient.getQueryData(["workflow", workflowId]);
      if (currentWorkflow && typeof currentWorkflow === "object" && "socialLinks" in currentWorkflow) {
        const updatedWorkflow = {
          ...currentWorkflow,
          socialLinks: (currentWorkflow.socialLinks as SocialLink[]).filter(
            link => link.id !== deletedSocialLink.id
          )
        };
        queryClient.setQueryData(["workflow", workflowId], updatedWorkflow);
      }
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete social link"
      );
    },
  });

  const handleDelete = (socialLinkId: string) => {
    deleteMutation.mutate(socialLinkId);
  };

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return Globe;

    // Map common icon names to Lucide icons
    const iconMap: Record<string, React.ElementType> = {
      globe: Globe,
      linkedin: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      twitter: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
        </svg>
      ),
      instagram: () => (
        <svg className="size-5" viewBox="0 0 32 32" fill="currentColor">
          <path d="M20.445 5h-8.891A6.559 6.559 0 0 0 5 11.554v8.891A6.559 6.559 0 0 0 11.554 27h8.891a6.56 6.56 0 0 0 6.554-6.555v-8.891A6.557 6.557 0 0 0 20.445 5zm4.342 15.445a4.343 4.343 0 0 1-4.342 4.342h-8.891a4.341 4.341 0 0 1-4.341-4.342v-8.891a4.34 4.34 0 0 1 4.341-4.341h8.891a4.342 4.342 0 0 1 4.341 4.341l.001 8.891z"></path>
          <path d="M16 10.312c-3.138 0-5.688 2.551-5.688 5.688s2.551 5.688 5.688 5.688 5.688-2.551 5.688-5.688-2.55-5.688-5.688-5.688zm0 9.163a3.475 3.475 0 1 1-.001-6.95 3.475 3.475 0 0 1 .001 6.95zM21.7 8.991a1.363 1.363 0 1 1-1.364 1.364c0-.752.51-1.364 1.364-1.364z"></path>
        </svg>
      ),
      facebook: Facebook,
      youtube: Youtube,
      github: Github,
      discord: MessageCircle,
      tiktok: () => (
        <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      ),
    };

    return iconMap[iconName.toLowerCase()] || Globe;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="uppercase text-xs font-semibold text-muted-foreground">
          Social Links
        </span>
        <SocialLinkModal workflowId={workflowId}>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Link
          </Button>
        </SocialLinkModal>
      </div>

      {socialLinks.length === 0 ? (
        <div className="text-center py-2 text-muted-foreground">
          <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No social links added yet</p>
          <p className="text-xs">
            Add your social media profiles and website links
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-3">
          {socialLinks.map((socialLink) => {
            const IconComponent = getIconComponent(socialLink.icon);

            return (
              <Link
                key={socialLink.id}
                href={socialLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/linkcard"
              >
                <Card className="group p-0 relative hover:bg-accent/50 transition-colors duration-200 cursor-pointer">
                  <div className="p-4">
                    <CardHeader className="p-0">
                      <CardTitle>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4 shrink-0" />
                          <span>{socialLink.name}</span>
                        </div>
                      </CardTitle>
                      {socialLink.handle && (
                        <CardDescription>{socialLink.handle}</CardDescription>
                      )}
                    </CardHeader>
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover/linkcard:opacity-100 transition-opacity duration-200">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <SocialLinkModal
                          workflowId={workflowId}
                          socialLink={socialLink}
                          open={!!editingSocialLink}
                          onOpenChange={(open) => !open && setEditingSocialLink(null)}
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingSocialLink(socialLink);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Link
                          </DropdownMenuItem>
                        </SocialLinkModal>
                                                 <DropdownMenuSeparator />
                         <DropdownMenuItem
                           onClick={(e) => {
                             e.stopPropagation();
                             setShowDeleteDialog({ open: true, socialLinkId: socialLink.id, socialLinkName: socialLink.name });
                           }}
                           className="text-destructive focus:text-destructive"
                         >
                           <Trash2 className="h-4 w-4 mr-2" />
                           Delete Link
                         </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editingSocialLink && (
        <SocialLinkModal
          workflowId={workflowId}
          socialLink={editingSocialLink}
          open={!!editingSocialLink}
          onOpenChange={(open) => !open && setEditingSocialLink(null)}
        >
          <div />
        </SocialLinkModal>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={showDeleteDialog.open} 
        onOpenChange={(open) => setShowDeleteDialog({ ...showDeleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{showDeleteDialog.socialLinkName}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setShowDeleteDialog({ open: false, socialLinkId: null, socialLinkName: null })}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (showDeleteDialog.socialLinkId) {
                  handleDelete(showDeleteDialog.socialLinkId);
                  setShowDeleteDialog({ open: false, socialLinkId: null, socialLinkName: null });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
