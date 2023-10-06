import { Element, ElementProps } from "./Element";
import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";

class Line implements Element {
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

  generate(generator: RoughGenerator) {
    this.element = generator.line(this.x1, this.y1, this.x2, this.y2);
  }

  draw(_context: CanvasRenderingContext2D, roughCanvas: RoughCanvas) {
    if (this.element) {
      roughCanvas.draw(this.element);
    } else {
      throw new Error("Item not generated yet. Please call 'generate' first");
    }
  }

  clone(): Line {
    const clonedLine = new Line({
      id: this.id,
      type: this.type,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
    });

    // Copiamos las propiedades adicionales que no se inicializan en el constructor
    clonedLine.element = this.element;

    return clonedLine;
  }
}

export default Line;
