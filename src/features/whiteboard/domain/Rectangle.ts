import { Element, ElementProps } from "./Element";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";

class Rectangle implements Element {
  element: Drawable | null;
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;

  constructor({ id, type, x1, y1, x2, y2 }: ElementProps) {
    this.id = id;
    this.type = type;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.element = null;
  }

  generate(generator: RoughGenerator): void {
    this.element = generator.rectangle(
      this.x1,
      this.y1,
      this.x2 - this.x1,
      this.y2 - this.y1
    );
  }
  draw(_context: CanvasRenderingContext2D, roughCanvas: RoughCanvas): void {
    roughCanvas.draw(this.element!);
  }
}

export default Rectangle;
