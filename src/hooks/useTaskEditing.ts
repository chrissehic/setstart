import { useReducer } from "react";

type EditState = {
  editingTitle: boolean;
  editingDescription: boolean;
  title: string;
  description: string;
};

type EditAction =
  | { type: "editTitle"; editing: boolean }
  | { type: "editDescription"; editing: boolean }
  | { type: "setTitle"; value: string }
  | { type: "setDescription"; value: string }
  | { type: "reset"; title: string; description: string };

function reducer(state: EditState, action: EditAction): EditState {
  switch (action.type) {
    case "editTitle":
      return { ...state, editingTitle: action.editing };
    case "editDescription":
      return { ...state, editingDescription: action.editing };
    case "setTitle":
      return { ...state, title: action.value };
    case "setDescription":
      return { ...state, description: action.value };
    case "reset":
      return {
        editingTitle: false,
        editingDescription: false,
        title: action.title,
        description: action.description,
      };
    default:
      return state;
  }
}

export const useTaskEditing = (initialTitle: string, initialDescription: string = "") => {
  const [state, dispatch] = useReducer(reducer, {
    editingTitle: false,
    editingDescription: false,
    title: initialTitle,
    description: initialDescription,
  });

  const startEditingTitle = () => dispatch({ type: "editTitle", editing: true });
  const stopEditingTitle = () => dispatch({ type: "editTitle", editing: false });
  const setTitle = (value: string) => dispatch({ type: "setTitle", value });
  
  const startEditingDescription = () => dispatch({ type: "editDescription", editing: true });
  const stopEditingDescription = () => dispatch({ type: "editDescription", editing: false });
  const setDescription = (value: string) => dispatch({ type: "setDescription", value });
  
  const reset = (title: string, description: string) => dispatch({ type: "reset", title, description });

  return {
    state,
    startEditingTitle,
    stopEditingTitle,
    setTitle,
    startEditingDescription,
    stopEditingDescription,
    setDescription,
    reset,
  };
}; 