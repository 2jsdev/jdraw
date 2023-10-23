import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Action, actions, Tool, tools } from "../../../constants";
import {
  Element,
  ElementProps,
  ElementUpdateProps,
  Point,
} from "../domain/Element";
import ElementFactory from "../domain/ElementFactory";

const elementFactory = new ElementFactory();

type WhiteboardState = {
  canvasSize: { width: number; height: number };
  tool: Tool;
  action: Action | null;
  selectedElement: Element | null;
  history: Element[][];
  historyIndex: number;
  hasStartedMovingOrResizing: boolean;
  hasFinishedMovingOrResizing: boolean;
};

const loadHistoryFromLocalStorage = () => {
  const historyJSON = localStorage.getItem("history");
  if (historyJSON) {
    const historyProps: ElementProps[][] = JSON.parse(historyJSON);
    return historyProps.map((historyEntryProps) =>
      historyEntryProps.map((elementProps) =>
        elementFactory.initializeElement(elementProps)
      )
    );
  }
  return [[]];
};

const initialState: WhiteboardState = {
  canvasSize: { width: window.innerWidth, height: window.innerHeight },
  tool: tools.SELECTION,
  action: null,
  selectedElement: null,
  history: loadHistoryFromLocalStorage(),
  historyIndex: parseInt(localStorage.getItem("historyIndex") || "0"),
  hasStartedMovingOrResizing: false,
  hasFinishedMovingOrResizing: false,
};

const whiteboardSlice = createSlice({
  name: "whiteboard",
  initialState,
  reducers: {
    setCanvasSize: (
      state,
      action: PayloadAction<{ width: number; height: number }>
    ) => {
      state.canvasSize = action.payload;
    },
    setTool: (state, action: PayloadAction<Tool>) => {
      state.tool = action.payload;
    },
    setAction: (state, action: PayloadAction<Action | null>) => {
      state.action = action.payload;
    },
    setSelectedElement: (state, action: PayloadAction<Element | null>) => {
      state.selectedElement = action.payload;
    },
    addElement: (state, action: PayloadAction<Element>) => {
      const newHistoryEntry = [
        ...state.history[state.historyIndex],
        action.payload,
      ];

      state.history = [
        ...state.history.slice(0, state.historyIndex + 1),
        newHistoryEntry,
      ];
      state.historyIndex++;

      localStorage.setItem("history", JSON.stringify(state.history));
      localStorage.setItem("historyIndex", state.historyIndex.toString());
    },
    updateElement: (state, action: PayloadAction<ElementUpdateProps>) => {
      const { index, type, id, x1, y1, x2, y2, text, fontSize, points } =
        action.payload;
      const currentElements = state.history[state.historyIndex];
      const updatedElements = [...currentElements];
      let updatedElementCopy = updatedElements[index].clone();

      const elementAction = state.action;

      switch (type) {
        case tools.RECTANGLE:
        case tools.DIAMOND:
        case tools.ELLIPSE:
        case tools.ARROW:
        case tools.LINE: {
          const newElement = elementFactory.createElement({
            id,
            x1,
            y1,
            x2,
            y2,
            type,
          });
          updatedElementCopy = newElement;
          break;
        }
        case tools.TEXT: {
          updatedElementCopy.x1 = x1;
          updatedElementCopy.y1 = y1;
          updatedElementCopy.x2 = x2;
          updatedElementCopy.y2 = y2;
          updatedElementCopy.text = text;
          updatedElementCopy.lines = text!.split("\n");
          updatedElementCopy.fontSize = fontSize;
          break;
        }
        case tools.PENCIL: {
          if (elementAction === actions.DRAWING) {
            updatedElementCopy.points = [
              ...(updatedElementCopy.points as Point[]),
              { x: x2, y: y2 },
            ];
          } else if (
            elementAction === actions.MOVING ||
            elementAction === actions.RESIZING
          ) {
            updatedElementCopy.points = points;
          }
          updatedElementCopy.x1 = x1;
          updatedElementCopy.y1 = y1;
          updatedElementCopy.x2 = x2;
          updatedElementCopy.y2 = y2;
          break;
        }
        default:
          break;
      }

      updatedElements[index] = updatedElementCopy;

      if (
        elementAction === actions.MOVING ||
        elementAction === actions.RESIZING
      ) {
        if (state.hasStartedMovingOrResizing) {
          state.history = [
            ...state.history.slice(0, state.historyIndex + 1),
            updatedElements,
          ];
          state.historyIndex++;
          state.hasStartedMovingOrResizing = false;
        } else if (state.hasFinishedMovingOrResizing) {
          state.history[state.historyIndex] = updatedElements;
          state.hasFinishedMovingOrResizing = false;
        } else {
          state.history[state.historyIndex] = updatedElements;
        }
      } else {
        state.history[state.historyIndex] = updatedElements;
      }

      localStorage.setItem("history", JSON.stringify(state.history));
      localStorage.setItem("historyIndex", state.historyIndex.toString());
    },
    deleteElement: (state, action: PayloadAction<number>) => {
      const currentHistory = [...state.history[state.historyIndex]];
      currentHistory.splice(action.payload, 1);

      state.history = [
        ...state.history.slice(0, state.historyIndex + 1),
        currentHistory,
      ];

      state.historyIndex++;
      localStorage.setItem("history", JSON.stringify(state.history));
      localStorage.setItem("historyIndex", state.historyIndex.toString());
    },
    undo: (state) => {
      if (state.historyIndex > 0) {
        state.historyIndex--;
      }
      localStorage.setItem("historyIndex", state.historyIndex.toString());
    },
    redo: (state) => {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
      }
      localStorage.setItem("historyIndex", state.historyIndex.toString());
    },
    setHistoryIndex: (state, action: PayloadAction<number>) => {
      state.historyIndex = action.payload;
    },
    setHasStartedMovingOrResizing: (state, action: PayloadAction<boolean>) => {
      state.hasStartedMovingOrResizing = action.payload;
    },
    setHasFinishedMovingOrResizing: (state, action: PayloadAction<boolean>) => {
      state.hasFinishedMovingOrResizing = action.payload;
    },
    resetCanvas: (state) => {
      state.history = [[]];
      state.historyIndex = 0;
      state.selectedElement = null;
      localStorage.setItem("history", JSON.stringify(state.history));
      localStorage.setItem("historyIndex", state.historyIndex.toString());
    },
  },
});

export const {
  setCanvasSize,
  setTool,
  setAction,
  setSelectedElement,
  addElement,
  updateElement,
  deleteElement,
  undo,
  redo,
  setHistoryIndex,
  setHasStartedMovingOrResizing,
  setHasFinishedMovingOrResizing,
  resetCanvas,
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;
