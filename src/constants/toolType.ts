export const tools = {
  SELECTION: "SELECTION",
  RECTANGLE: "RECTANGLE",
  DIAMOND: "DIAMOND",
  ELLIPSE: "ELLIPSE",
  ARROW: "ARROW",
  LINE: "LINE",
  PENCIL: "PENCIL",
  TEXT: "TEXT",
  INSERT_IMAGE: "INSERT_IMAGE",
  ERASER: "ERASER",
};

export const toolNames = {
  [tools.SELECTION]: "Selection",
  [tools.RECTANGLE]: "Rectangle",
  [tools.DIAMOND]: "Diamond",
  [tools.ELLIPSE]: "Ellipse",
  [tools.ARROW]: "Arrow",
  [tools.LINE]: "Line",
  [tools.PENCIL]: "Pencil",
  [tools.TEXT]: "Text",
  [tools.INSERT_IMAGE]: "Insert Image",
  [tools.ERASER]: "Eraser",
};

export type Tool = (typeof tools)[keyof typeof tools];
