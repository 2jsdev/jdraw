import { Element } from "../domain/Element";
import Text from "../domain/Text";

export const getTextDimensions = (
  element: Element,
  context: CanvasRenderingContext2D
) => {
  const textElement = element as Text;
  const lines = textElement.lines;

  context.font = `${textElement.fontStyle} ${textElement.fontWeight} ${textElement.fontSize}px ${textElement.fontFamily}`;

  let longestLineWidth = 0;
  for (const line of lines) {
    const metrics = context.measureText(line);
    if (metrics.width > longestLineWidth) {
      longestLineWidth = metrics.width;
    }
  }

  const lineHeight = textElement.fontSize;
  const totalHeight = lines.length * lineHeight;

  return { width: longestLineWidth, height: totalHeight };
};

interface ResizedDimensionsProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  clientX: number;
  clientY: number;
}

export const getResizedDimensions = ({
  x1,
  y1,
  clientX,
  clientY,
}: ResizedDimensionsProps) => {
  return {
    newX1: x1,
    newY1: y1,
    newX2: clientX,
    newY2: clientY,
  };
};

interface ScaleFactorProps {
  x1: number;
  x2: number;
  newX2: number;
}

export const getScaleFactor = ({ x1, x2, newX2 }: ScaleFactorProps) => {
  const originalWidth = x2 - x1;
  const newWidth = newX2 - x1;
  return newWidth / originalWidth;
};
