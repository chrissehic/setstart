import { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { useDebouncedCallback } from "use-debounce";

interface UseTiptapEditorOptions {
  editor: Editor | null;
  content: string;
  isEditing: boolean;
  onUpdate: (value: string) => void;
  onSave?: (content: string) => void;
  debounceMs?: number;
  getContent: (editor: Editor) => string; // Function to get content from editor (HTML, JSON, etc.)
  setContent: (editor: Editor, content: string) => void; // Function to set content in editor
}

export const useTiptapEditor = ({
  editor,
  content,
  isEditing,
  onUpdate,
  onSave,
  debounceMs = 3000, // Increased to 3 seconds to allow proper database save
  getContent,
  setContent,
}: UseTiptapEditorOptions) => {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const isUserEditingRef = useRef(false); // Track if user is actively editing
  const editorContentRef = useRef<string>(content); // Track editor's current content
  const initialContentRef = useRef<string>(content); // Track initial content to detect actual changes
  const savingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-save with debounce - only show saving indicator if save takes time
  const debouncedSave = useDebouncedCallback(async (contentStr: string) => {
    if (onSave) {
      // Only show "Saving..." if the save operation takes more than 300ms
      savingTimeoutRef.current = setTimeout(() => {
        setSaving(true);
      }, 300);

      try {
        // Execute save (can be async)
        const saveResult = onSave(contentStr);
        
        // Handle both sync and async saves - wait for completion
        if (saveResult instanceof Promise) {
          await saveResult;
        }
        
        // Small delay to ensure database transaction completes
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Clear the saving timeout since we're done
        if (savingTimeoutRef.current) {
          clearTimeout(savingTimeoutRef.current);
          savingTimeoutRef.current = null;
        }
        
        // Hide "Saving..." and show "Saved"
        setSaving(false);
        setSaved(true);
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        // Update initial content ref to mark as saved
        initialContentRef.current = contentStr;
        
        // Clear any existing saved timeout
        if (savedTimeoutRef.current) {
          clearTimeout(savedTimeoutRef.current);
        }
        
        // Hide "Saved" after 3 seconds to give user time to see confirmation
        savedTimeoutRef.current = setTimeout(() => {
          setSaved(false);
        }, 3000);
      } catch (error) {
        // On error, clear saving state
        if (savingTimeoutRef.current) {
          clearTimeout(savingTimeoutRef.current);
          savingTimeoutRef.current = null;
        }
        setSaving(false);
        console.error("Auto-save error:", error);
      }
    }
  }, debounceMs);

  // Update editor editable state when editing mode changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
      // Don't auto-focus - let the click event handle focus naturally at the click position
    }
  }, [isEditing, editor]);

  // Handle editor updates (user typing)
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      isUserEditingRef.current = true;
      const newContent = getContent(editor);
      editorContentRef.current = newContent;
      onUpdate(newContent);

      // Check if content has changed from last saved
      const hasChanged = newContent !== initialContentRef.current && 
        newContent.trim() !== initialContentRef.current.trim();
      
      setHasUnsavedChanges(hasChanged);

      // Trigger auto-save if enabled - only if content has actually changed from initial
      if (onSave && hasInitialized) {
        if (hasChanged) {
          // Cancel any pending save timeout
          if (savingTimeoutRef.current) {
            clearTimeout(savingTimeoutRef.current);
            savingTimeoutRef.current = null;
          }
          // Reset saving state when user types again
          setSaving(false);
          setSaved(false);
          debouncedSave(newContent);
        }
      }
    };

    editor.on("update", handleUpdate);

    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor, onUpdate, onSave, debouncedSave, hasInitialized, getContent]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (savingTimeoutRef.current) {
        clearTimeout(savingTimeoutRef.current);
      }
      if (savedTimeoutRef.current) {
        clearTimeout(savedTimeoutRef.current);
      }
    };
  }, []);

  // Update editor content when content prop changes (only if not from user input)
  useEffect(() => {
    if (!editor || !hasInitialized) return;

    const currentEditorContent = getContent(editor);
    
    // Only update if:
    // 1. Content prop changed externally (different from what we last tracked)
    // 2. It's different from editor's current content
    // 3. User is not actively editing (to prevent blur)
    // 4. Editor is not focused (additional safety check)
    const isEditorFocused = editor.isFocused;
    
    if (
      content !== editorContentRef.current &&
      content !== currentEditorContent &&
      !isUserEditingRef.current &&
      !isEditorFocused
    ) {
      setContent(editor, content);
      editorContentRef.current = content;
    }

    // Reset the flag after a short delay to allow external updates
    const timeoutId = setTimeout(() => {
      isUserEditingRef.current = false;
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [content, editor, getContent, setContent, hasInitialized]);

  // Mark as initialized after first render and sync initial content
  useEffect(() => {
    if (editor && !hasInitialized) {
      const initialEditorContent = getContent(editor);
      editorContentRef.current = initialEditorContent;
      initialContentRef.current = initialEditorContent;
      setHasInitialized(true);
    }
  }, [editor, hasInitialized, getContent]);

  // Update initial content when content prop changes (new document loaded)
  useEffect(() => {
    if (hasInitialized && content !== initialContentRef.current) {
      initialContentRef.current = content;
      editorContentRef.current = content;
    }
  }, [content, hasInitialized]);

  return {
    saving,
    saved,
    lastSaved,
    hasUnsavedChanges,
  };
};

