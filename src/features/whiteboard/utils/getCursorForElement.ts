import getStroke from "perfect-freehand";
import { tools } from "../../../constants";
import { Element, Point, PositionState } from "../domain/Element";
import { getSvgPathFromStroke, getTextDimensions } from ".";
import Text from "../domain/Text";

const getCornerPosition = (
  x: number,
  y: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  edgeThreshold: number
): PositionState | null => {
  if (
    Math.abs(x - minX) < edgeThreshold &&
    Math.abs(y - minY) < edgeThreshold
  ) {
    return "top-left";
  }
  if (
    Math.abs(x - maxX) < edgeThreshold &&
    Math.abs(y - minY) < edgeThreshold
  ) {
    return "top-right";
  }
  if (
    Math.abs(x - minX) < edgeThreshold &&
    Math.abs(y - maxY) < edgeThreshold
  ) {
    return "bottom-left";
  }
  if (
    Math.abs(x - maxX) < edgeThreshold &&
    Math.abs(y - maxY) < edgeThreshold
  ) {
    return "bottom-right";
  }
  return null;
};

const isPointInsideRectangle = (
  x: number,
  y: number,
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
): boolean => {
  return x > minX && x < maxX && y > minY && y < maxY;
};

export const getCursorForElement = (
  x: number,
  y: number,
  element: Element,
  context: CanvasRenderingContext2D,
  selectedElement?: Element
): PositionState | null => {
  const { type } = element;

  const offset = 10;
  const edgeThreshold = 10;

  let minX, minY, maxX, maxY;

  switch (type) {
    case tools.TEXT: {
      const { width, height } = getTextDimensions(element, context);
      minX = element.x1 - offset;
      minY = element.y1 - offset;
      maxX = minX + width + 2 * offset;
      maxY = minY + height + 2 * offset;
      break;
    }

    case tools.PENCIL: {
      const points = element.points as Point[];

      minX = Math.min(...points.map((p) => p.x)) - offset;
      minY = Math.min(...points.map((p) => p.y)) - offset;
      maxX = Math.max(...points.map((p) => p.x)) + offset;
      maxY = Math.max(...points.map((p) => p.y)) + offset;

      const myStroke = getStroke(points, { size: 10 });
      const pathData = getSvgPathFromStroke(myStroke);
      const myPath = new Path2D(pathData);

      if (context.isPointInPath(myPath, x, y)) {
        return "inside";
      }
      break;
    }

    default: {
      minX = Math.min(element.x1, element.x2) - offset;
      minY = Math.min(element.y1, element.y2) - offset;
      maxX = Math.max(element.x1, element.x2) + offset;
      maxY = Math.max(element.y1, element.y2) + offset;
    }
  }

  if (element.id === selectedElement?.id) {
    if (type === tools.TEXT) {
      const CONTROL_POINT_SIZE = 7;

      const { width, height } = getTextDimensions(element, context);
      const circleCenterX = element.x1 + width + offset;
      const circleCenterY =
        element.y1 +
        (element as Text).fontSize / 6 +
        height +
        offset -
        CONTROL_POINT_SIZE / 2;

      if (
        Math.abs(x - circleCenterX) < edgeThreshold &&
        Math.abs(y - circleCenterY) < edgeThreshold
      ) {
        return "bottom-right";
      }
    } else {
      const cornerPosition = getCornerPosition(
        x,
        y,
        minX + offset,
        minY + offset,
        maxX - offset,
        maxY - offset,
        edgeThreshold
      );
      if (cornerPosition) return cornerPosition;
    }
  }

  if (
    (element.id === selectedElement?.id || type === tools.TEXT) &&
    isPointInsideRectangle(
      x,
      y,
      minX + offset,
      minY + offset,
      maxX - offset,
      maxY - offset
    )
  ) {
    return "inside";
  }

  return null;
};
