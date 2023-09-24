import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import { Element, ElementProps } from "./Element";

class Arrow implements Element {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  text?: string | undefined;
  element: Drawable | null;
  headElement: Drawable | null;
  headPoints: { x: number; y: number }[];

  constructor({ id, type, x1, y1, x2, y2, text }: ElementProps) {
    this.id = id;
    this.type = type;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.text = text || "";
    this.element = null;
    this.headElement = null;
    this.headPoints = [];
  }

  generate(generator: RoughGenerator): void {
    this.element = generator.line(this.x1, this.y1, this.x2, this.y2);

    const angle = Math.atan2(this.y2 - this.y1, this.x2 - this.x1);
    const headLength = 10;

    const x3 = this.x2 - headLength * Math.cos(angle - Math.PI / 6);
    const y3 = this.y2 - headLength * Math.sin(angle - Math.PI / 6);
    const x4 = this.x2 - headLength * Math.cos(angle + Math.PI / 6);
    const y4 = this.y2 - headLength * Math.sin(angle + Math.PI / 6);

    this.headElement = generator.polygon([
      [this.x2, this.y2],
      [x3, y3],
      [x4, y4],
    ]);

    this.headPoints = [
      { x: this.x2, y: this.y2 },
      { x: x3, y: y3 },
      { x: x4, y: y4 },
    ];
  }

  draw(_context: CanvasRenderingContext2D, roughCanvas: RoughCanvas): void {
    if (this.element && this.headElement) {
      roughCanvas.draw(this.element);
      roughCanvas.draw(this.headElement);
    }
  }
}

export default Arrow;
