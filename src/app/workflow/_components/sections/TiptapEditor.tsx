import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BubbleMenu } from "@tiptap/react/menus";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { cn } from "@/lib/utils";
import EditorToolbar from "./EditorToolbar";
import { useTiptapEditor } from "@/hooks/useTiptapEditor";
import {
  BulletList,
  OrderedList,
  TaskItem,
  TaskList,
} from "@tiptap/extension-list";
import Heading from "@tiptap/extension-heading";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

// load all languages with "all" or common languages with "common"
import { all, createLowlight } from "lowlight";

// create a lowlight instance with all languages loaded
const lowlight = createLowlight(all);

interface TiptapEditorProps {
  content: string;
  onUpdate: (value: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave?: (content: string) => void;
  placeholder?: string;
  debounceMs?: number;
  onSaveStateChange?: (saving: boolean, saved: boolean, lastSaved: Date | null, hasUnsavedChanges: boolean) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  content,
  onUpdate,
  isEditing,
  onStartEdit,
  onSave,
  placeholder = "Describe the task and involvement...",
  debounceMs = 600,
  onSaveStateChange,
}) => {
  // Single Tiptap editor instance
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https"],
        isAllowedUri: (url, ctx) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);

            // use default validation
            if (!ctx.defaultValidate(parsedUrl.href)) {
              return false;
            }

            // disallowed protocols
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");

            if (disallowedProtocols.includes(protocol)) {
              return false;
            }

            // only allow protocols specified in ctx.protocols
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme
            );

            if (!allowedProtocols.includes(protocol)) {
              return false;
            }

            // disallowed domains
            const disallowedDomains = [
              "example-phishing.com",
              "malicious-site.net",
            ];
            const domain = parsedUrl.hostname;

            if (disallowedDomains.includes(domain)) {
              return false;
            }

            // all checks have passed
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            // construct URL
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);

            // only auto-link if the domain is not in the disallowed list
            const disallowedDomains = [
              "example-no-autolink.com",
              "another-no-autolink.com",
            ];
            const domain = parsedUrl.hostname;

            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal",
        },
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc",
        },
      }),
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: {
          class: "font-bold",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable: isEditing,

    editorProps: {
      attributes: {
        class:
          "prose max-w-none text-base flex-1 min-h-[100px] h-full bg-transparent outline-none border border-transparent rounded-md transition-all resize-none",
        tabIndex: "0",
        style: "cursor: text; height: 100%;",
      },
      handlePaste() {
        return false;
      },
    },
  });

  // Use centralized editor hook
  const { saving, saved, lastSaved, hasUnsavedChanges } = useTiptapEditor({
    editor,
    content,
    isEditing,
    onUpdate,
    onSave,
    debounceMs,
    getContent: (editor) => editor.getHTML(),
    setContent: (editor, content) => editor.commands.setContent(content),
  });

  // Notify parent of save state changes
  React.useEffect(() => {
    if (onSaveStateChange) {
      onSaveStateChange(saving, saved, lastSaved, hasUnsavedChanges);
    }
  }, [saving, saved, lastSaved, hasUnsavedChanges, onSaveStateChange]);

  // Focus editor when entering edit mode, especially when empty
  React.useEffect(() => {
    if (editor && isEditing) {
      // Use setTimeout to ensure the editor is fully rendered
      setTimeout(() => {
        const isEmpty = !content || content.trim() === "" || content === "<p></p>";
        if (isEmpty) {
          // For empty content, focus and place cursor at the start
          editor.commands.focus();
          editor.commands.setTextSelection(0);
        } else {
          // For existing content, focus naturally (click position is preserved)
          editor.commands.focus();
        }
      }, 0);
    }
  }, [editor, isEditing, content]);

  // Helper to check if content is empty
  const isEmptyContent = React.useMemo(() => {
    if (!content || content.trim() === "") return true;
    if (content === "<p></p>" || content === "<p><br></p>") return true;
    
    // Check if it's block format JSON that's effectively empty
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        const hasText = parsed.some((block: { content?: { text?: string }; children?: unknown[] }) => {
          if (block.content?.text && block.content.text.trim() !== "") return true;
          if (block.children && block.children.length > 0) return true;
          return false;
        });
        return !hasText;
      }
    } catch {
      // Not JSON, continue with HTML check
    }
    
    // Check editor content if available (more reliable)
    if (editor) {
      const editorHTML = editor.getHTML();
      const editorText = editor.getText();
      if (!editorText.trim() || editorHTML === "<p></p>" || editorHTML === "<p><br></p>") {
        return true;
      }
    }
    
    return false;
  }, [content, editor]);

  if (!editor) return null;

  if (isEditing) {
    return (
      <div className="relative h-full w-full">
        <EditorContent
          editor={editor}
          onClick={onStartEdit}
          className="cursor-text h-full w-full"
        />
        {/* BubbleMenu for formatting */}
        <BubbleMenu
          editor={editor}
          options={{ placement: "bottom", offset: 8 }}
        >
          <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-1.5">
            <EditorToolbar editor={editor} />
          </div>
        </BubbleMenu>
      </div>
    );
  }

  // Read-only display mode
  return (
    <div
      className={cn(
        "prose max-w-none text-base flex-1 min-h-[100px] h-full bg-transparent border border-transparent rounded-md cursor-text",
        isEmptyContent && "text-muted-foreground"
      )}
      tabIndex={0}
      role="textbox"
      aria-label="Task description"
      onClick={onStartEdit}
    >
      {isEmptyContent ? (
        "Click to start writing..."
      ) : (
        <EditorContent editor={editor} className="h-full" />
      )}
    </div>
  );
};

export default TiptapEditor;
