import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Point } from "../domain/Element";

type PanState = {
  panOffset: Point;
  startPanMousePosition: Point;
};

const initialState: PanState = {
  panOffset: { x: 0, y: 0 },
  startPanMousePosition: { x: 0, y: 0 },
};

const panSlice = createSlice({
  name: "pan",
  initialState,
  reducers: {
    setPanOffset: (state, action: PayloadAction<Point>) => {
      state.panOffset = action.payload;
    },
    setStartPanMousePosition: (state, action: PayloadAction<Point>) => {
      state.startPanMousePosition = action.payload;
    },
  },
});

export const { setPanOffset, setStartPanMousePosition } = panSlice.actions;

export default panSlice.reducer;
