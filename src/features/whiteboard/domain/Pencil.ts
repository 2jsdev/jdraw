import { Drawable } from "roughjs/bin/core";
import { RoughCanvas } from "roughjs/bin/canvas";
import { RoughGenerator } from "roughjs/bin/generator";
import { getStroke } from "perfect-freehand";

import { Element, ElementProps, Point } from "./Element";
import { getSvgPathFromStroke } from "../utils/getSvgPathFromStroke";

const LINE_COLOR = "#8f8cff";
const WHITE_COLOR = "#ffffff";
const CONTROL_POINT_SIZE = 7;
const OFFSET = 10;
const LINE_HEIGHT = 1.2;

class Pencil implements Element {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  text?: string | undefined;
  element: Drawable | null;
  points: Point[];
  xOffsets?: number[];
  yOffsets?: number[];

  constructor({
    id,
    type,
    x1,
    y1,
    x2,
    y2,
    xOffsets = [],
    yOffsets = [],
  }: ElementProps) {
    this.id = id;
    this.type = type;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.element = null;
    this.points = [{ x: x1, y: y1 }];
    this.xOffsets = xOffsets;
    this.yOffsets = yOffsets;
  }

  generate(_generator: RoughGenerator): void {}

  draw(context: CanvasRenderingContext2D, _roughCanvas: RoughCanvas): void {
    const myStroke = getStroke(this.points, { size: 10 });

    const pathData = getSvgPathFromStroke(myStroke);
    const path = new Path2D(pathData);
    // context.fillStyle = "#000000";
    context.fill(path);
  }

  drawSelectionBox(context: CanvasRenderingContext2D) {
    context.save();
    context.strokeStyle = LINE_COLOR;
    context.lineWidth = LINE_HEIGHT;
    context.setLineDash([1, 1]);

    const points = this.points as Point[];

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      minX = Math.min(minX, points[i].x);
      minY = Math.min(minY, points[i].y);
      maxX = Math.max(maxX, points[i].x);
      maxY = Math.max(maxY, points[i].y);
    }

    const x = minX - OFFSET;
    const y = minY - OFFSET;
    const width = maxX - minX + 2 * OFFSET;
    const height = maxY - minY + 2 * OFFSET;

    context.strokeRect(x, y, width, height);

    context.setLineDash([]);
    context.fillStyle = WHITE_COLOR;
    context.strokeStyle = LINE_COLOR;
    context.lineWidth = LINE_HEIGHT;

    const drawControlPoint = (x: number, y: number) => {
      context.beginPath();
      context.arc(x, y, CONTROL_POINT_SIZE / 2, 0, 2 * Math.PI);
      context.stroke();
      context.fill();
    };

    drawControlPoint(x, y);
    drawControlPoint(x + width, y);
    drawControlPoint(x, y + height);
    drawControlPoint(x + width, y + height);

    context.restore();
  }

  getSelectionBoxDimensions() {
    const points = this.points as Point[];

    let minX = points[0].x;
    let minY = points[0].y;
    let maxX = points[0].x;
    let maxY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      minX = Math.min(minX, points[i].x);
      minY = Math.min(minY, points[i].y);
      maxX = Math.max(maxX, points[i].x);
      maxY = Math.max(maxY, points[i].y);
    }

    return {
      minX: minX - OFFSET,
      minY: minY - OFFSET,
      maxX: maxX + OFFSET,
      maxY: maxY + OFFSET,
    };
  }

  clone(): Pencil {
    const copy = new Pencil({
      id: this.id,
      type: this.type,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      xOffsets: [...(this.xOffsets || [])],
      yOffsets: [...(this.yOffsets || [])],
    });
    copy.element = this.element;
    copy.points = this.points.map((point) => ({ x: point.x, y: point.y })); // Copia superficial de los puntos
    return copy;
  }
}

export default Pencil;
