export const actions = {
  SELECTING: "SELECTING",
  DRAWING: "DRAWING",
  RESIZING: "RESIZING",
  MOVING: "MOVING",
  WRITING: "WRITING",
  ERASING: "ERASING",
};

export type Action = typeof actions[keyof typeof actions];