import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Point } from "../domain/Element";

type ScaleState = {
  value: number;
  scaleOffset: Point;
};

const initialState: ScaleState = {
  value: 1,
  scaleOffset: { x: 0, y: 0 },
};

const scaleSlice = createSlice({
  name: "scale",
  initialState,
  reducers: {
    setScale: (state, action: PayloadAction<number>) => {
      state.value = action.payload;
    },
    setScaleOffset: (state, action: PayloadAction<Point>) => {
      state.scaleOffset = action.payload;
    },
  },
});

export const { setScale, setScaleOffset } = scaleSlice.actions;

export default scaleSlice.reducer;
