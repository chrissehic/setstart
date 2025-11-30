import React, { useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import {
  BulletList,
  OrderedList,
  TaskItem,
  TaskList,
} from "@tiptap/extension-list";
import Heading from "@tiptap/extension-heading";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { all, createLowlight } from "lowlight";
import { cn } from "@/lib/utils";
import { useTiptapEditor } from "@/hooks/useTiptapEditor";
import EditorToolbar from "../sections/EditorToolbar";

const lowlight = createLowlight(all);

// Block structure type
export interface Block {
  id: string;
  type: string;
  content: any;
  children?: Block[];
}

interface BlockEditorProps {
  content: string; // JSON string of blocks
  onUpdate: (value: string) => void;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave?: (content: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const BlockEditor: React.FC<BlockEditorProps> = ({
  content,
  onUpdate,
  isEditing,
  onStartEdit,
  onSave,
  placeholder = "Start writing...",
  debounceMs = 600,
}) => {
  // Parse content from JSON string to blocks
  const parseContent = (contentStr: string): Block[] => {
    if (!contentStr || contentStr.trim() === "") {
      return [{ id: "1", type: "paragraph", content: { text: "" } }];
    }
    try {
      const parsed = JSON.parse(contentStr);
      return Array.isArray(parsed) ? parsed : [{ id: "1", type: "paragraph", content: { text: "" } }];
    } catch {
      // If parsing fails, create a default block
      return [{ id: "1", type: "paragraph", content: { text: contentStr } }];
    }
  };

  // Convert blocks to HTML for Tiptap
  const blocksToHTML = (blocks: Block[]): string => {
    return blocks
      .map((block) => {
        switch (block.type) {
          case "heading":
            const level = block.content.level || 1;
            return `<h${level}>${block.content.text || ""}</h${level}>`;
          case "paragraph":
            return `<p>${block.content.text || ""}</p>`;
          case "bulletList":
            return `<ul>${(block.children || [])
              .map((child) => `<li>${child.content?.text || ""}</li>`)
              .join("")}</ul>`;
          case "orderedList":
            return `<ol>${(block.children || [])
              .map((child) => `<li>${child.content?.text || ""}</li>`)
              .join("")}</ol>`;
          default:
            return `<p>${block.content?.text || ""}</p>`;
        }
      })
      .join("");
  };

  // Convert Tiptap HTML to blocks
  const htmlToBlocks = (html: string): Block[] => {
    // Simple conversion - in production, you'd want a more robust parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const blocks: Block[] = [];
    let idCounter = 1;

    const processNode = (node: Node): Block | null => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim();
        if (text) {
          return { id: String(idCounter++), type: "paragraph", content: { text } };
        }
        return null;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();

        if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
          const level = parseInt(tagName.charAt(1));
          return {
            id: String(idCounter++),
            type: "heading",
            content: { level, text: element.textContent || "" },
          };
        }

        if (tagName === "p") {
          return {
            id: String(idCounter++),
            type: "paragraph",
            content: { text: element.textContent || "" },
          };
        }

        if (tagName === "ul" || tagName === "ol") {
          const children: Block[] = [];
          Array.from(element.children).forEach((li) => {
            const child = processNode(li);
            if (child) children.push(child);
          });
          return {
            id: String(idCounter++),
            type: tagName === "ul" ? "bulletList" : "orderedList",
            content: {},
            children,
          };
        }
      }

      return null;
    };

    Array.from(doc.body.childNodes).forEach((node) => {
      const block = processNode(node);
      if (block) blocks.push(block);
    });

    return blocks.length > 0 ? blocks : [{ id: "1", type: "paragraph", content: { text: "" } }];
  };

  // Convert content to HTML for editor initialization
  const initialBlocks = useMemo(() => parseContent(content), [content]);
  const initialHTML = useMemo(() => blocksToHTML(initialBlocks), [initialBlocks]);

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
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`${ctx.defaultProtocol}://${url}`);
            if (!ctx.defaultValidate(parsedUrl.href)) return false;
            const disallowedProtocols = ["ftp", "file", "mailto"];
            const protocol = parsedUrl.protocol.replace(":", "");
            if (disallowedProtocols.includes(protocol)) return false;
            const allowedProtocols = ctx.protocols.map((p) =>
              typeof p === "string" ? p : p.scheme
            );
            if (!allowedProtocols.includes(protocol)) return false;
            const disallowedDomains = ["example-phishing.com", "malicious-site.net"];
            const domain = parsedUrl.hostname;
            if (disallowedDomains.includes(domain)) return false;
            return true;
          } catch {
            return false;
          }
        },
        shouldAutoLink: (url) => {
          try {
            const parsedUrl = url.includes(":")
              ? new URL(url)
              : new URL(`https://${url}`);
            const disallowedDomains = ["example-no-autolink.com", "another-no-autolink.com"];
            const domain = parsedUrl.hostname;
            return !disallowedDomains.includes(domain);
          } catch {
            return false;
          }
        },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      OrderedList.configure({ HTMLAttributes: { class: "list-decimal" } }),
      BulletList.configure({ HTMLAttributes: { class: "list-disc" } }),
      Heading.configure({ levels: [1, 2, 3], HTMLAttributes: { class: "font-bold" } }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialHTML,
    editable: isEditing,
    editorProps: {
      attributes: {
        class:
          "prose max-w-none text-base flex-1 min-h-[100px] h-full bg-transparent outline-none border border-transparent rounded-md transition-all resize-none",
        tabIndex: "0",
        style: "cursor: text; height: 100%;",
      },
    },
  });

  // Use centralized editor hook with block conversion
  const { saving, saved, lastSaved } = useTiptapEditor({
    editor,
    content,
    isEditing,
    onUpdate: (html) => {
      // Convert HTML back to blocks
      const blocks = htmlToBlocks(html);
      const jsonContent = JSON.stringify(blocks);
      onUpdate(jsonContent);
    },
    onSave,
    debounceMs,
    getContent: (editor) => {
      // Get HTML from editor
      return editor.getHTML();
    },
    setContent: (editor, contentStr) => {
      // Convert blocks to HTML and set in editor
      const blocks = parseContent(contentStr);
      const html = blocksToHTML(blocks);
      editor.commands.setContent(html);
    },
  });

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
        {/* Saving indicator - absolutely positioned at bottom */}
        {onSave && (saving || saved) && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2.5 py-1.5 bg-background/90 backdrop-blur-sm border border-border rounded-md shadow-sm animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            {saving ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="animate-spin inline-block w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full"></span>
                <span className="animate-pulse">Saving...</span>
              </span>
            ) : saved ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 animate-in fade-in-0 zoom-in-95 duration-200">
                <span className="text-green-600 animate-in zoom-in-0 duration-300 delay-75">✓</span>
                <span>Saved</span>
              </span>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  // Read-only display mode
  const blocks = parseContent(content);
  const isEmpty = blocks.length === 0 || (blocks.length === 1 && !blocks[0].content?.text);

  return (
    <div
      className={cn(
        "prose max-w-none text-base flex-1 min-h-[100px] h-full bg-transparent border border-transparent rounded-md cursor-text",
        isEmpty && "text-muted-foreground"
      )}
      tabIndex={0}
      role="textbox"
      aria-label="Document content"
      onClick={onStartEdit}
    >
      {isEmpty ? (
        "Click to start writing..."
      ) : (
        <EditorContent editor={editor} className="h-full" />
      )}
    </div>
  );
};

export default BlockEditor;

