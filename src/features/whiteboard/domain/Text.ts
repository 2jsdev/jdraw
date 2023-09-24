import { RoughCanvas } from "roughjs/bin/canvas";
import { Drawable } from "roughjs/bin/core";
import { RoughGenerator } from "roughjs/bin/generator";
import { Element, ElementProps } from "./Element";
import { Tool } from "../../../constants";

const DEFAULT_FONT_SIZE = 16;
const DEFAULT_FONT_FAMILY = '"Roboto Mono", monospace';
const DEFAULT_FONT_STYLE = "normal";
const DEFAULT_FONT_WEIGHT = "normal";

class Text implements Element {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: Tool;
  text: string;
  lines: string[];
  fontSize: number;
  fontFamily: string;
  fontStyle: string;
  fontWeight: string;
  element: Drawable | null;

  constructor(props: ElementProps) {
    this.id = props.id;
    this.x1 = props.x1;
    this.y1 = props.y1;
    this.x2 = props.x2;
    this.y2 = props.y2;
    this.type = props.type;
    this.text = props.text || "";
    this.lines = this.text.split("\n");
    this.fontSize = props.fontSize || DEFAULT_FONT_SIZE;
    this.fontFamily = props.fontFamily || DEFAULT_FONT_FAMILY;
    this.fontStyle = props.fontStyle || DEFAULT_FONT_STYLE;
    this.fontWeight = props.fontWeight || DEFAULT_FONT_WEIGHT;
    this.element = null;
  }

  generate(_generator: RoughGenerator): void {
    // not implemented
  }

  draw(context: CanvasRenderingContext2D, _roughCanvas: RoughCanvas): void {
    context.font = `${this.fontStyle} ${this.fontWeight} ${this.fontSize}px ${this.fontFamily}`;

    this.lines = (this.text || "").split("\n");

    context.fillStyle = "#000000";

    let offsetY = 0;
    for (const line of this.lines) {
      context.fillText(line, this.x1, this.y1 + offsetY + this.fontSize);
      offsetY += this.fontSize;
    }
  }
}

export default Text;
