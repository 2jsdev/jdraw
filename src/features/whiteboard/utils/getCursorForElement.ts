import getStroke from "perfect-freehand";
import { tools } from "../../../constants";
import { Element, Point, PositionState } from "../domain/Element";
import { getSvgPathFromStroke, getTextDimensions } from ".";
import Text from "../domain/Text";
import Arrow from "../domain/Arrow";
import Diamond from "../domain/Diamond";
import Rectangle from "../domain/Rectangle";
import Line from "../domain/Line";
import Ellipse from "../domain/Ellipse";

const OFFSET = 10;
const EDGE_THRESHOLD = 10;
const CONTROL_POINT_SIZE = 7;

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

const adjustForSelectionBox = (
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  offset: number
) => {
  return {
    minX: minX - offset,
    minY: minY - offset,
    maxX: maxX + offset,
    maxY: maxY + offset,
  };
};

export const getCursorForElement = (
  x: number,
  y: number,
  element: Element,
  context: CanvasRenderingContext2D,
  selectedElement?: Element
): PositionState | null => {
  const { type } = element;

  let minX, minY, maxX, maxY;

  switch (type) {
    case tools.RECTANGLE: {
      const rectangleElement = element as Rectangle;
      minX = Math.min(rectangleElement.x1, rectangleElement.x2);
      minY = Math.min(rectangleElement.y1, rectangleElement.y2);
      maxX = Math.max(rectangleElement.x1, rectangleElement.x2);
      maxY = Math.max(rectangleElement.y1, rectangleElement.y2);

      context.lineWidth = 1;
      context.beginPath();
      context.rect(minX, minY, maxX - minX, maxY - minY);

      if (context.isPointInStroke(x, y)) return "inside";

      if (element.id === selectedElement?.id) {
        const adjustedBounds = {
          minX: minX - OFFSET,
          minY: minY - OFFSET,
          maxX: maxX + OFFSET,
          maxY: maxY + OFFSET,
        };
        if (
          isPointInsideRectangle(
            x,
            y,
            adjustedBounds.minX,
            adjustedBounds.minY,
            adjustedBounds.maxX,
            adjustedBounds.maxY
          )
        )
          return "inside";

        const cornerPosition = getCornerPosition(
          x,
          y,
          adjustedBounds.minX,
          adjustedBounds.minY,
          adjustedBounds.maxX,
          adjustedBounds.maxY,
          EDGE_THRESHOLD
        );
        if (cornerPosition) return cornerPosition;
      }
      break;
    }

    case tools.DIAMOND: {
      const diamondElement = element as Diamond;
      const centerX = (diamondElement.x1 + diamondElement.x2) / 2;
      const centerY = (diamondElement.y1 + diamondElement.y2) / 2;
      const width = Math.abs(diamondElement.x2 - diamondElement.x1);
      const height = Math.abs(diamondElement.y2 - diamondElement.y1);
      const halfWidth = width / 2;
      const halfHeight = height / 2;

      minX = centerX - halfWidth - OFFSET;
      minY = centerY - halfHeight - OFFSET;
      maxX = centerX + halfWidth + OFFSET;
      maxY = centerY + halfHeight + OFFSET;

      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(centerX, centerY - halfHeight);
      context.lineTo(centerX + halfWidth, centerY);
      context.lineTo(centerX, centerY + halfHeight);
      context.lineTo(centerX - halfWidth, centerY);
      context.closePath();

      if (context.isPointInStroke(x, y)) {
        return "inside";
      }
      break;
    }

    case tools.ELLIPSE: {
      const ellipseElement = element as Ellipse;

      const centerX = (ellipseElement.x1 + ellipseElement.x2) / 2;
      const centerY = (ellipseElement.y1 + ellipseElement.y2) / 2;
      const width = Math.abs(ellipseElement.x2 - ellipseElement.x1);
      const height = Math.abs(ellipseElement.y2 - ellipseElement.y1);
      const halfWidth = width / 2;
      const halfHeight = height / 2;

      minX = centerX - halfWidth - OFFSET;
      minY = centerY - halfHeight - OFFSET;
      maxX = centerX + halfWidth + OFFSET;
      maxY = centerY + halfHeight + OFFSET;

      context.lineWidth = 2;
      context.beginPath();
      context.ellipse(
        centerX,
        centerY,
        halfWidth,
        halfHeight,
        0,
        0,
        2 * Math.PI
      );

      if (context.isPointInStroke(x, y)) {
        return "inside";
      }
      break;
    }

    case tools.ARROW: {
      const arrowElement = element as Arrow;

      minX = Math.min(arrowElement.x1, arrowElement.x2);
      minY = Math.min(arrowElement.y1, arrowElement.y2);
      maxX = Math.max(arrowElement.x1, arrowElement.x2);
      maxY = Math.max(arrowElement.y1, arrowElement.y2);

      for (const point of arrowElement.headPoints) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }

      minX -= OFFSET;
      minY -= OFFSET;
      maxX += OFFSET;
      maxY += OFFSET;

      const lineLength = Math.hypot(
        arrowElement.x2 - arrowElement.x1,
        arrowElement.y2 - arrowElement.y1
      );
      const distanceToStart = Math.hypot(
        x - arrowElement.x1,
        y - arrowElement.y1
      );
      const distanceToEnd = Math.hypot(
        x - arrowElement.x2,
        y - arrowElement.y2
      );
      const totalDistance = distanceToStart + distanceToEnd;

      const epsilon = 0.1;
      const onLine = Math.abs(totalDistance - lineLength) < epsilon;

      context.beginPath();
      context.moveTo(
        arrowElement.headPoints[0].x,
        arrowElement.headPoints[0].y
      );
      context.lineTo(
        arrowElement.headPoints[1].x,
        arrowElement.headPoints[1].y
      );
      context.lineTo(
        arrowElement.headPoints[2].x,
        arrowElement.headPoints[2].y
      );
      context.closePath();
      const onHead = context.isPointInPath(x, y);

      if (onLine || onHead) {
        return "inside";
      }
      break;
    }

    case tools.LINE: {
      const lineElement = element as Line;
      const lineLength = Math.hypot(
        lineElement.x2 - lineElement.x1,
        lineElement.y2 - lineElement.y1
      );
      const distanceToStart = Math.hypot(
        x - lineElement.x1,
        y - lineElement.y1
      );
      const distanceToEnd = Math.hypot(x - lineElement.x2, y - lineElement.y2);
      const totalDistance = distanceToStart + distanceToEnd;

      minX = Math.min(lineElement.x1, lineElement.x2) - OFFSET;
      minY = Math.min(lineElement.y1, lineElement.y2) - OFFSET;
      maxX = Math.max(lineElement.x1, lineElement.x2) + OFFSET;
      maxY = Math.max(lineElement.y1, lineElement.y2) + OFFSET;

      if (totalDistance >= lineLength - 1 && totalDistance <= lineLength + 1) {
        return "inside";
      }
      break;
    }

    case tools.PENCIL: {
      const points = element.points as Point[];

      minX = Math.min(...points.map((p) => p.x)) - OFFSET;
      minY = Math.min(...points.map((p) => p.y)) - OFFSET;
      maxX = Math.max(...points.map((p) => p.x)) + OFFSET;
      maxY = Math.max(...points.map((p) => p.y)) + OFFSET;

      const myStroke = getStroke(points, { size: 10 });
      const pathData = getSvgPathFromStroke(myStroke);
      const myPath = new Path2D(pathData);

      if (context.isPointInPath(myPath, x, y)) {
        return "inside";
      }
      break;
    }

    case tools.TEXT: {
      const { width, height } = getTextDimensions(element, context);
      minX = element.x1 - OFFSET;
      minY = element.y1 - OFFSET;
      maxX = minX + width + 2 * OFFSET;
      maxY = minY + height + 2 * OFFSET;
      break;
    }

    default: {
      minX = Math.min(element.x1, element.x2) - OFFSET;
      minY = Math.min(element.y1, element.y2) - OFFSET;
      maxX = Math.max(element.x1, element.x2) + OFFSET;
      maxY = Math.max(element.y1, element.y2) + OFFSET;
    }
  }

  if (element.id === selectedElement?.id && type !== tools.RECTANGLE) {
    if (type === tools.TEXT) {
      const { width, height } = getTextDimensions(element, context);
      const circleCenterX = element.x1 + width + OFFSET;
      const circleCenterY =
        element.y1 +
        (element as Text).fontSize / 6 +
        height +
        OFFSET -
        CONTROL_POINT_SIZE / 2;

      if (
        Math.abs(x - circleCenterX) < EDGE_THRESHOLD &&
        Math.abs(y - circleCenterY) < EDGE_THRESHOLD
      ) {
        return "bottom-right";
      }
    } else {
      const cornerPosition = getCornerPosition(
        x,
        y,
        minX + OFFSET,
        minY + OFFSET,
        maxX - OFFSET,
        maxY - OFFSET,
        EDGE_THRESHOLD
      );
      if (cornerPosition) return cornerPosition;
    }
  }

  if (
    (element.id === selectedElement?.id || type === tools.TEXT) &&
    type !== tools.RECTANGLE &&
    isPointInsideRectangle(
      x,
      y,
      minX + OFFSET,
      minY + OFFSET,
      maxX - OFFSET,
      maxY - OFFSET
    )
  ) {
    return "inside";
  }

  return null;
};
