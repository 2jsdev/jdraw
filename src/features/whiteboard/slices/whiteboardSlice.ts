import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Action, actions, Tool, tools } from "../../../constants";
import { Element, ElementUpdateProps, Point } from "../domain/Element";

type WhiteboardState = {
  canvasSize: { width: number; height: number };
  tool: Tool;
  action: Action | null;
  elements: Element[];
  selectedElement: Element | null;
};

const initialState: WhiteboardState = {
  canvasSize: { width: window.innerWidth, height: window.innerHeight },
  tool: tools.SELECTION,
  action: null,
  elements: [],
  selectedElement: null,
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
    setElements: (state, action: PayloadAction<Element[]>) => {
      state.elements = action.payload;
    },
    setSelectedElement: (state, action: PayloadAction<Element | null>) => {
      state.selectedElement = action.payload;
    },
    addElement: (state, action: PayloadAction<Element>) => {
      state.elements = [...state.elements, action.payload];
    },
    updateElement: (
      state,
      action: PayloadAction<{
        props: ElementUpdateProps;
        context: CanvasRenderingContext2D;
      }>
    ) => {
      const { props, context } = action.payload;

      const elementsCopy = [...state.elements];

      const elementAction = state.action;

      switch (props.type) {
        case tools.TEXT: {
          elementsCopy[props.index].x1 = props.x1;
          elementsCopy[props.index].y1 = props.y1;
          elementsCopy[props.index].x2 = props.x2;
          elementsCopy[props.index].y2 = props.y2;
          elementsCopy[props.index].text = props.text;
          elementsCopy[props.index].lines = props.text!.split("\n");
          elementsCopy[props.index].fontSize = props.fontSize;
          break;
        }
        case tools.PENCIL: {
          if (elementAction === actions.DRAWING) {
            elementsCopy[props.index].points = [
              ...(elementsCopy[props.index].points as Point[]),
              { x: props.x2, y: props.y2 },
            ];
          } else if (elementAction === actions.MOVING) {
            elementsCopy[props.index].points = props.points;
          } else if (elementAction === actions.RESIZING) {
            elementsCopy[props.index].points = props.points;
          }
          break;
        }
        default:
          break;
      }

      state.elements = elementsCopy;
    },
  },
});

export const {
  setCanvasSize,
  setTool,
  setAction,
  setElements,
  setSelectedElement,
  addElement,
  updateElement,
} = whiteboardSlice.actions;

export default whiteboardSlice.reducer;
