import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  List,
  ListOrdered,
  Code,
  Strikethrough,
  ListChecks,
  TextQuote,
  SquareCode,
  Unlink,
} from "lucide-react";
import { Editor } from "@tiptap/react";
import { useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null;

  // Get active formats - check each one individually
  // We check editor.state.selection and editor.state.doc to ensure re-renders on changes
  const activeFormats = useMemo(() => {
    const formats: string[] = [];
    if (editor.isActive("bold")) formats.push("bold");
    if (editor.isActive("italic")) formats.push("italic");
    if (editor.isActive("underline")) formats.push("underline");
    if (editor.isActive("strikethrough")) formats.push("strikethrough");
    if (editor.isActive("code")) formats.push("code");
    if (editor.isActive("codeBlock")) formats.push("codeBlock");
    if (editor.isActive("bulletList")) formats.push("bulletList");
    if (editor.isActive("orderedList")) formats.push("orderedList");
    if (editor.isActive("taskList")) formats.push("checklist");
    if (editor.isActive("blockquote")) formats.push("blockquote");
    return formats;
  }, [editor.state.selection, editor.state.doc]);

  const isLinkActive = editor.isActive("link");

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // update link
    try {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Invalid URL");
    }
  }, [editor]);

  const unsetLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleToggle = useCallback((format: string) => {
    if (!editor) return;

    const formatActions: Record<string, () => void> = {
      bold: () => editor.chain().focus().toggleBold().run(),
      italic: () => editor.chain().focus().toggleItalic().run(),
      underline: () => editor.chain().focus().toggleUnderline().run(),
      strikethrough: () => editor.chain().focus().toggleStrike().run(),
      code: () => editor.chain().focus().toggleCode().run(),
      codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
      bulletList: () => editor.chain().focus().toggleBulletList().run(),
      orderedList: () => editor.chain().focus().toggleOrderedList().run(),
      checklist: () => editor.chain().focus().toggleTaskList().run(),
      blockquote: () => editor.chain().focus().toggleBlockquote().run(),
    };

    formatActions[format]?.();
  }, [editor]);

  return (
    <div className="flex items-center gap-1">
      {/* Text Formatting Group */}
      <ToggleGroup
        type="multiple"
        variant="outline"
        value={activeFormats.filter((f) => ["bold", "italic", "underline", "strikethrough"].includes(f))}
        onValueChange={(values) => {
          // Get current active formats in this group
          const currentGroupFormats = activeFormats.filter((f) =>
            ["bold", "italic", "underline", "strikethrough"].includes(f)
          );
          
          // Find what changed
          const added = values.filter((v) => !currentGroupFormats.includes(v));
          const removed = currentGroupFormats.filter((v) => !values.includes(v));
          
          // Toggle the changed formats
          [...added, ...removed].forEach((format) => handleToggle(format));
        }}
      >
        <ToggleGroupItem value="bold" aria-label="Toggle bold" title="Bold (Ctrl+B)">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic" title="Italic (Ctrl+I)">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Toggle underline" title="Underline (Ctrl+U)">
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough" title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Divider */}
      <div className="h-6 w-px bg-border mx-0.5" />

      {/* Lists Group */}
      <ToggleGroup
        type="multiple"
        variant="outline"
        value={activeFormats.filter((f) => ["bulletList", "orderedList", "checklist"].includes(f))}
        onValueChange={(values) => {
          const currentGroupFormats = activeFormats.filter((f) =>
            ["bulletList", "orderedList", "checklist"].includes(f)
          );
          
          const added = values.filter((v) => !currentGroupFormats.includes(v));
          const removed = currentGroupFormats.filter((v) => !values.includes(v));
          
          [...added, ...removed].forEach((format) => handleToggle(format));
        }}
      >
        <ToggleGroupItem value="bulletList" aria-label="Toggle bullet list" title="Bullet List">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="orderedList" aria-label="Toggle ordered list" title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="checklist" aria-label="Toggle checklist" title="Checklist">
          <ListChecks className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Divider */}
      <div className="h-6 w-px bg-border mx-0.5" />

      {/* Code Group */}
      <ToggleGroup
        type="multiple"
        variant="outline"
        value={activeFormats.filter((f) => ["code", "codeBlock"].includes(f))}
        onValueChange={(values) => {
          const currentGroupFormats = activeFormats.filter((f) =>
            ["code", "codeBlock"].includes(f)
          );
          
          const added = values.filter((v) => !currentGroupFormats.includes(v));
          const removed = currentGroupFormats.filter((v) => !values.includes(v));
          
          [...added, ...removed].forEach((format) => handleToggle(format));
        }}
      >
        <ToggleGroupItem value="code" aria-label="Toggle code" title="Inline Code">
          <Code className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="codeBlock" aria-label="Toggle code block" title="Code Block">
          <SquareCode className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Divider */}
      <div className="h-6 w-px bg-border mx-0.5" />

      {/* Block Quote */}
      <ToggleGroup
        type="multiple"
        variant="outline"
        value={activeFormats.filter((f) => f === "blockquote")}
        onValueChange={(values) => {
          const isCurrentlyActive = activeFormats.includes("blockquote");
          const shouldBeActive = values.includes("blockquote");
          
          if (isCurrentlyActive !== shouldBeActive) {
            handleToggle("blockquote");
          }
        }}
      >
        <ToggleGroupItem value="blockquote" aria-label="Toggle blockquote" title="Blockquote">
          <TextQuote className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      {/* Divider */}
      <div className="h-6 w-px bg-border mx-0.5" />

      {/* Links - Inline buttons matching ToggleGroup style */}
      <div className="flex items-center gap-0 rounded-md border border-input bg-transparent shadow-xs">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-9 px-2 rounded-r-none border-r border-input rounded-l-md shadow-none hover:bg-accent hover:text-accent-foreground",
            isLinkActive && "bg-primary/60 text-accent-foreground"
          )}
          onClick={setLink}
          title="Set Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-2 rounded-l-none rounded-r-md shadow-none hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
          onClick={unsetLink}
          disabled={!isLinkActive}
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;
