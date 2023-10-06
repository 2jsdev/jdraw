import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import { Tool } from "../../../constants";
import { RoughCanvas } from "roughjs/bin/canvas";

export type PositionState =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "inside"
  | "outside";

export type Point = { x: number; y: number };

export interface ElementProps {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;

  type: Tool;

  text?: string;
  lines?: string[];
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: string;

  points?: Point[];

  position?: PositionState;
  selectedCorner?: PositionState;

  offsetX?: number;
  offsetY?: number;

  xOffsets?: number[];
  yOffsets?: number[];
}

export interface ElementUpdateProps extends ElementProps {
  index: number;
}

export interface Element extends ElementProps {
  element: Drawable | null;

  generate(generator: RoughGenerator): void;
  draw(context: CanvasRenderingContext2D, roughCanvas: RoughCanvas): void;
  clone(): Element;
}
