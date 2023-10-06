export const actions = {
  SELECTING: "SELECTING",
  DRAWING: "DRAWING",
  RESIZING: "RESIZING",
  MOVING: "MOVING",
  WRITING: "WRITING",
  ERASING: "ERASING",
  PANNING: "PANNING",
};

export type Action = (typeof actions)[keyof typeof actions];
