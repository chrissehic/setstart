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
import { useCallback } from "react";

interface EditorToolbarProps {
  editor: Editor;
}

const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null;

  const activeFormats = [];

  if (editor.isActive("bold")) activeFormats.push("bold");
  if (editor.isActive("italic")) activeFormats.push("italic");
  if (editor.isActive("underline")) activeFormats.push("underline");
  if (editor.isActive("strikethrough")) activeFormats.push("strikethrough");
  if (editor.isActive("link")) activeFormats.push("link");
  if (editor.isActive("codeBlock")) activeFormats.push("codeBlock");
  if (editor.isActive("bulletList")) activeFormats.push("bulletList");
  if (editor.isActive("orderedList")) activeFormats.push("orderedList");
  if (editor.isActive("checklist")) activeFormats.push("checklist");
  if (editor.isActive("blockquote")) activeFormats.push("blockquote");
  if (editor.isActive("code")) activeFormats.push("code");

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    // cancelled
    if (url === null) {
      return;
    }

    // empty
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // update link
    try {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Invalid URL');
    }
  }, [editor]);

  const unsetLink = useCallback(() => {
    editor.chain().focus().unsetLink().run();
  }, [editor]);

  const handleToggle = (values: string[]) => {
    if (!editor) return;

    const toggles = {
      bold: () => editor.chain().focus().toggleBold().run(),
      italic: () => editor.chain().focus().toggleItalic().run(),
      underline: () => editor.chain().focus().toggleUnderline().run(),
      strikethrough: () => editor.chain().focus().toggleStrike().run(),
      codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
      bulletList: () => editor.chain().focus().toggleBulletList().run(),
      orderedList: () => editor.chain().focus().toggleOrderedList().run(),
      checklist: () => editor.chain().focus().toggleTaskList().run(),
      blockquote: () => editor.chain().focus().toggleBlockquote().run(),
      code: () => editor.chain().focus().toggleCode().run(),
    };

    Object.keys(toggles).forEach((format) => {
      const isActive = editor.isActive(format);
      const shouldBeActive = values.includes(format);

      if (isActive !== shouldBeActive) {
        toggles[format as keyof typeof toggles]();
      }
    });
  };

  return (
    <div className="flex items-center gap-1">
      <ToggleGroup
        type="multiple"
        variant="outline"
        value={activeFormats.filter(f => f !== 'link')}
        onValueChange={handleToggle}
      >
        <ToggleGroupItem value="bold" aria-label="Toggle bold" title="Bold">
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic" title="Italic">
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline" aria-label="Toggle underline" title="Underline">
          <Underline className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough" title="Strikethrough">
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="codeBlock" aria-label="Toggle code block" title="Code Block">
          <SquareCode className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="bulletList" aria-label="Toggle bullet list" title="Bullet List">
          <List className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="orderedList" aria-label="Toggle ordered list" title="Ordered List">
          <ListOrdered className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="checklist" aria-label="Toggle checklist" title="Checklist">
          <ListChecks className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="blockquote" aria-label="Toggle blockquote" title="Blockquote">
          <TextQuote className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="code" aria-label="Toggle code" title="Code">
          <Code className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      
      {/* Link Management Buttons */}
      <div className="flex items-center gap-1 ml-2 border-l pl-2">
        <Button
          variant={editor.isActive('link') ? 'default' : 'outline'}
          size="sm"
          onClick={setLink}
          title="Set Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={unsetLink}
          disabled={!editor.isActive('link')}
          title="Remove Link"
        >
          <Unlink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EditorToolbar;