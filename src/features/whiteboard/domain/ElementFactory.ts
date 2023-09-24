import rough from "roughjs";
import { RoughCanvas } from "roughjs/bin/canvas";
import { RoughGenerator } from "roughjs/bin/generator";
import { ElementProps, Element, Point, PositionState } from "./Element";
import { tools } from "../../../constants";
import { getCursorForElement, getTextDimensions } from "../utils";

import Line from "./Line";
import Rectangle from "./Rectangle";
import Pencil from "./Pencil";
import Diamond from "./Diamond";
import Ellipse from "./Ellipse";
import Arrow from "./Arrow";
import Text from "./Text";

const LINE_COLOR = "#8f8cff";
const WHITE_COLOR = "#ffffff";
const CONTROL_POINT_SIZE = 7;
const OFFSET = 10;
const LINE_HEIGHT = 1.2;

class ElementFactory {
  generator: RoughGenerator;

  constructor() {
    this.generator = rough.generator();
  }

  createElement(props: ElementProps): Element {
    let element: Element;

    switch (props.type) {
      case tools.RECTANGLE:
        element = new Rectangle(props);
        break;
      case tools.LINE:
        element = new Line(props);
        break;
      case tools.PENCIL:
        element = new Pencil(props);
        break;
      case tools.DIAMOND:
        element = new Diamond(props);
        break;
      case tools.ELLIPSE:
        element = new Ellipse(props);
        break;
      case tools.ARROW:
        element = new Arrow(props);
        break;
      case tools.TEXT:
        element = new Text(props);
        break;

      default:
        throw new Error("Unknown element type");
    }

    element.generate(this.generator);
    return element;
  }

  drawElement({
    roughCanvas,
    context,
    element,
  }: {
    roughCanvas: RoughCanvas;
    context: CanvasRenderingContext2D;
    element: Element;
  }) {
    element.draw(context, roughCanvas);
  }

  drawSelectionBox({
    context,
    element,
  }: {
    context: CanvasRenderingContext2D;
    element: Element;
  }) {
    context.save();
    context.strokeStyle = LINE_COLOR;
    context.lineWidth = LINE_HEIGHT;

    let x, y, width, height;

    const drawControlPoint = (x: number, y: number) => {
      context.beginPath();
      context.arc(x, y, CONTROL_POINT_SIZE / 2, 0, 2 * Math.PI);
      context.stroke();
      context.fill();
    };

    switch (element.type) {
      case tools.TEXT: {
        const { width, height } = getTextDimensions(element as Text, context);
        const x = element.x1;
        const y = element.y1 + (element as Text).fontSize / 6;

        context.save();
        context.strokeStyle = LINE_COLOR;
        context.lineWidth = LINE_HEIGHT;
        context.setLineDash([4, 4]);

        context.strokeRect(
          x - OFFSET,
          y - OFFSET,
          width + 2 * OFFSET,
          height + 2 * OFFSET
        );

        context.setLineDash([]);
        context.fillStyle = WHITE_COLOR;
        context.strokeStyle = LINE_COLOR;

        const circleCenterX = x + width + OFFSET;
        const circleCenterY = y + height + OFFSET;

        context.lineWidth = LINE_HEIGHT;

        context.beginPath();
        context.arc(
          circleCenterX,
          circleCenterY,
          CONTROL_POINT_SIZE / 2,
          0,
          2 * Math.PI
        );
        context.stroke();
        context.fill();

        context.restore();
        break;
      }

      case tools.PENCIL: {
        context.save();
        context.strokeStyle = LINE_COLOR;
        context.lineWidth = LINE_HEIGHT;
        context.setLineDash([1, 1]);

        const points = element.points as Point[];

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

        drawControlPoint(x, y);
        drawControlPoint(x + width, y);
        drawControlPoint(x, y + height);
        drawControlPoint(x + width, y + height);

        context.restore();

        break;
      }
      default: {
        x = Math.min(element.x1, element.x2) - OFFSET;
        y = Math.min(element.y1, element.y2) - OFFSET;
        width = Math.abs(element.x2 - element.x1) + 2 * OFFSET;
        height = Math.abs(element.y2 - element.y1) + 2 * OFFSET;

        context.strokeRect(x, y, width, height);

        context.setLineDash([]);
        context.fillStyle = WHITE_COLOR;
        context.strokeStyle = LINE_COLOR;
        context.lineWidth = LINE_HEIGHT;

        drawControlPoint(x, y);
        drawControlPoint(x + width, y);
        drawControlPoint(x, y + height);
        drawControlPoint(x + width, y + height);

        context.restore();
      }
    }
    context.restore();
  }

  getElementAtPosition(
    elements: Element[],
    point: Point,
    context: CanvasRenderingContext2D | null,
    selectedElement?: Element
  ): Element | undefined {
    return elements
      .map((element) => ({
        ...element,
        position: getCursorForElement(
          point.x,
          point.y,
          element,
          context as CanvasRenderingContext2D,
          selectedElement
        ) as PositionState,
      }))
      .find(
        (element) => element.position !== undefined && element.position !== null
      );
  }
}

export default ElementFactory;
