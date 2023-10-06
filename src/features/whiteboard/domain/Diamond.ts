import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import { Element, ElementProps } from "./Element";

class Diamond implements Element {
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
    const centerX = (this.x1 + this.x2) / 2;
    const centerY = (this.y1 + this.y2) / 2;
    const width = Math.abs(this.x2 - this.x1);
    const height = Math.abs(this.y2 - this.y1);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const path = `M ${centerX},${centerY - halfHeight}
                  L ${centerX + halfWidth},${centerY}
                  L ${centerX},${centerY + halfHeight}
                  L ${centerX - halfWidth},${centerY} Z`;

    this.element = generator.path(path);
  }

  draw(_context: CanvasRenderingContext2D, roughCanvas: RoughCanvas): void {
    if (this.element) {
      roughCanvas.draw(this.element);
    }
  }

  clone(): Diamond {
    const clonedDiamond = new Diamond({
      id: this.id,
      type: this.type,
      x1: this.x1,
      y1: this.y1,
      x2: this.x2,
      y2: this.y2,
      text: this.text,
    });

    // Copiamos las propiedades adicionales que no se inicializan en el constructor
    clonedDiamond.element = this.element;

    return clonedDiamond;
  }
}

export default Diamond;
