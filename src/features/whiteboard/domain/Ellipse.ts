import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import { Element, ElementProps } from "./Element";

class Ellipse implements Element {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  text?: string | undefined;
  element: Drawable | null;

  constructor({ id, type, x1, y1, x2, y2, text }: ElementProps) {
    this.id = id;
    this.type = type;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.text = text || "";
    this.element = null;
  }

  generate(generator: RoughGenerator): void {
    this.element = generator.ellipse(
      (this.x1 + this.x2) / 2,
      (this.y1 + this.y2) / 2,
      this.x2 - this.x1,
      this.y2 - this.y1
    );
  }

  draw(_context: CanvasRenderingContext2D, roughCanvas: RoughCanvas): void {
    if (this.element) {
      roughCanvas.draw(this.element);
    }
  }

  clone(): Ellipse {
    const clonedEllipse = new Ellipse({
      id: this.id,
      type: this.type,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      text: this.text,
    });

    // Copiamos las propiedades adicionales que no se inicializan en el constructor
    clonedEllipse.element = this.element;

    return clonedEllipse;
  }
}

export default Ellipse;
