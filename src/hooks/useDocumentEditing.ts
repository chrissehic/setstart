import { useReducer } from "react";

type EditState = {
  editingTitle: boolean;
  editingContent: boolean;
  title: string;
  content: string;
};

type EditAction =
  | { type: "editTitle"; editing: boolean }
  | { type: "editContent"; editing: boolean }
  | { type: "setTitle"; value: string }
  | { type: "setContent"; value: string }
  | { type: "reset"; title: string; content: string };

function reducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case "editTitle":
      return { ...state, editingTitle: action.editing };
    case "editContent":
      return { ...state, editingContent: action.editing };
    case "setTitle":
      return { ...state, title: action.value };
    case "setContent":
      return { ...state, content: action.value };
    case "reset":
      return {
        editingTitle: false,
        editingContent: false,
        title: action.title,
        content: action.content,
      };
    default:
      return state;
  }
}

export const useDocumentEditing = (initialTitle: string, initialContent: string = "") => {
  const [state, dispatch] = useReducer(reducer, {
    editingTitle: false,
    editingContent: false,
    title: initialTitle,
    content: initialContent,
  });

  const startEditingTitle = () => dispatch({ type: "editTitle", editing: true });
  const stopEditingTitle = () => dispatch({ type: "editTitle", editing: false });
  const setTitle = (value: string) => dispatch({ type: "setTitle", value });
  
  const startEditingContent = () => dispatch({ type: "editContent", editing: true });
  const stopEditingContent = () => dispatch({ type: "editContent", editing: false });
  const setContent = (value: string) => dispatch({ type: "setContent", value });
  
  const reset = (title: string, content: string) => dispatch({ type: "reset", title, content });

  return {
    state,
    startEditingTitle,
    stopEditingTitle,
    setTitle,
    startEditingContent,
    stopEditingContent,
    setContent,
    reset,
  };
};

