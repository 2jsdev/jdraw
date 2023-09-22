import { PositionState } from "../domain/Element";

export const getCursorForPosition = (position: PositionState) => {
  switch (position) {
    case "top-left":
      return "nwse-resize";
    case "top-right":
      return "nesw-resize";
    case "bottom-left":
      return "nesw-resize";
    case "bottom-right":
      return "nwse-resize";
    case "inside":
      return "move";
    case "outside":
      return "default";
  }
};

export const updateCursorForPosition = (
  target: HTMLElement,
  position: PositionState
) => {
  target.style.cursor = getCursorForPosition(position);
};
