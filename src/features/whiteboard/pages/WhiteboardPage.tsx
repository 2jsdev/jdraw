import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux';

import rough from "roughjs";
import { v4 as uuid } from "uuid";
import { Element, PositionState, Point } from '../domain/Element';

import { RootState } from '../../../store';

import ElementFactory from '../domain/ElementFactory';
import Menu from "../components/Menu"
import { actions, tools } from '../../../constants';
import { addElement, deleteElement, setAction, setCanvasSize, setSelectedElement, setTool, updateElement } from '../slices/whiteboardSlice';
import { getResizedDimensions, getScaleFactor, updateCursorForPosition } from '../utils';
import { getCursorForElement } from '../utils/getCursorForElement';

const elementFactory = new ElementFactory();

const WhiteboardPage = (): React.ReactElement => {
    const dispatch = useDispatch();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const canvasSize = useSelector((state: RootState) => state.whiteboard.canvasSize);

    const tool = useSelector((state: RootState) => state.whiteboard.tool);
    const action = useSelector((state: RootState) => state.whiteboard.action);

    const elements = useSelector((state: RootState) => state.whiteboard.elements);
    const selectedElement = useSelector((state: RootState) => state.whiteboard.selectedElement);


    useEffect(() => {
        const handleResize = () => setCanvasSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        contextRef.current = context;

        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        const roughCanvas = rough.canvas(canvas);

        elements.forEach((element: Element) => {
            elementFactory.drawElement({ roughCanvas, context, element });

            if ((action === actions.SELECTING || action === actions.RESIZING || action === actions.MOVING) && element.id === selectedElement?.id) {
                elementFactory.drawSelectionBox({ context, element });
            }
        });
    }, [action, elements, selectedElement, tool]);

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === actions.WRITING) return;

        const { clientX, clientY } = event;

        if (tool === tools.SELECTION) {
            const element = elementFactory.getElementAtPosition(elements, { x: clientX, y: clientY }, contextRef.current, selectedElement ?? undefined);

            if (element) {
                if (element.type === tools.PENCIL) {
                    const xOffsets = (element.points as Point[]).map(point => clientX - point.x);
                    const yOffsets = (element.points as Point[]).map(point => clientY - point.y);
                    dispatch(setSelectedElement({ ...element, xOffsets, yOffsets }));
                } else {
                    const offsetX = clientX - element.x1;
                    const offsetY = clientY - element.y1;
                    dispatch(setSelectedElement({ ...element, offsetX, offsetY }));
                }

                if (element.position === "inside") {
                    dispatch(setAction(actions.MOVING));
                } else if (element.position && ["top-left", "top-right", "bottom-left", "bottom-right"].includes(element.position)) {
                    dispatch(setAction(actions.RESIZING));
                    dispatch(setSelectedElement({ ...element, selectedCorner: element.position }));
                } else {
                    dispatch(setAction(actions.SELECTING));
                }
            } else {
                dispatch(setSelectedElement(null));
                dispatch(setAction(actions.SELECTING));
                updateCursorForPosition(event.target as HTMLElement, "outside");
            }
        }

        if (tool === tools.PENCIL || tool === tools.RECTANGLE || tool === tools.ELLIPSE || tool === tools.DIAMOND || tool === tools.ARROW || tool === tools.LINE) {
            const element = elementFactory.createElement({
                id: uuid(), type: tool, x1: clientX, y1: clientY, x2: clientX, y2: clientY,
            });
            dispatch(addElement(element));
            dispatch(setAction(actions.DRAWING));
            dispatch(setSelectedElement(element));
        }

        if (tool === tools.TEXT) {
            const element = elementFactory.createElement({
                id: uuid(),
                type: tools.TEXT,
                x1: clientX,
                y1: clientY,
                x2: clientX,
                y2: clientY,
                text: '',
            });

            dispatch(addElement(element));
            dispatch(setAction(actions.WRITING));
            dispatch(setSelectedElement(element));
        }

        if (tool === tools.ERASER) {
            const cursorPosition = { x: clientX, y: clientY };
            const eraserRadius = 5;
            const numPoints = 25;

            const pointsAroundCircle = Array.from({ length: numPoints }, (_, i) => {
                const angle = (i * 2 * Math.PI) / numPoints;
                return {
                    x: cursorPosition.x + eraserRadius * Math.cos(angle),
                    y: cursorPosition.y + eraserRadius * Math.sin(angle),
                };
            });

            outerLoop:
            for (const point of pointsAroundCircle) {
                for (const [index, element] of elements.entries()) {
                    if (getCursorForElement(point.x, point.y, element, contextRef.current as CanvasRenderingContext2D) === "inside") {
                        dispatch(deleteElement(index));
                        break outerLoop;
                    }
                }
            }
        }


    }

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === actions.WRITING) return;

        const { clientX, clientY } = event;

        if (tool === tools.SELECTION) {
            const element = elementFactory.getElementAtPosition(elements, { x: clientX, y: clientY }, contextRef.current, selectedElement ?? undefined);

            if (element) {
                updateCursorForPosition(event.target as HTMLElement, element.position as PositionState);
            } else {
                updateCursorForPosition(event.target as HTMLElement, "outside");
            }
        }

        if (selectedElement) {
            const { id, type, x1, y1, x2, y2, points, selectedCorner } = selectedElement;

            const index = elements.findIndex((el) => el.id === selectedElement.id);

            if (action === actions.DRAWING) {
                dispatch(updateElement({
                    props: { ...selectedElement, x2: clientX, y2: clientY, index, },
                    context: contextRef.current as CanvasRenderingContext2D
                }));
            }


            if (action === actions.MOVING) {
                if (selectedElement.type === tools.PENCIL) {
                    const newPoints = (selectedElement.points as Point[]).map((_, index) => ({
                        x: (clientX - (selectedElement.xOffsets ? selectedElement.xOffsets[index] : 0)),
                        y: (clientY - (selectedElement.yOffsets ? selectedElement.yOffsets[index] : 0)),
                    }));

                    dispatch(updateElement({
                        props: { ...selectedElement, points: newPoints, index },
                        context: contextRef.current as CanvasRenderingContext2D
                    }));
                } else {
                    const { x1, y1, x2, y2, type, offsetX = 0, offsetY = 0 } = selectedElement;
                    const width = x2 - x1;
                    const height = y2 - y1;
                    const newX1 = clientX - offsetX;
                    const newY1 = clientY - offsetY;
                    const options = type === tools.TEXT ? { text: selectedElement.text } : {};

                    dispatch(updateElement({
                        props: { ...selectedElement, x1: newX1, y1: newY1, x2: newX1 + width, y2: newY1 + height, ...options, index, },
                        context: contextRef.current as CanvasRenderingContext2D
                    }));
                }
            }

            if (action === actions.RESIZING && selectedCorner) {
                if (type === tools.RECTANGLE || type === tools.DIAMOND || type === tools.ELLIPSE) {
                    const newDimensions = { newX1: x1, newY1: y1, newX2: x2, newY2: y2 };

                    switch (selectedCorner) {
                        case 'top-left':
                            newDimensions.newX1 = Math.min(clientX, x2);
                            newDimensions.newY1 = Math.min(clientY, y2);
                            break;
                        case 'top-right':
                            newDimensions.newX2 = Math.max(clientX, x1);
                            newDimensions.newY1 = Math.min(clientY, y2);
                            break;
                        case 'bottom-left':
                            newDimensions.newX1 = Math.min(clientX, x2);
                            newDimensions.newY2 = Math.max(clientY, y1);
                            break;
                        case 'bottom-right':
                            newDimensions.newX2 = Math.max(clientX, x1);
                            newDimensions.newY2 = Math.max(clientY, y1);
                            break;
                        default:
                            break;
                    }

                    dispatch(updateElement({
                        props: {
                            id,
                            type,
                            x1: newDimensions.newX1,
                            y1: newDimensions.newY1,
                            x2: newDimensions.newX2,
                            y2: newDimensions.newY2,
                            index
                        },
                        context: contextRef.current as CanvasRenderingContext2D
                    }));
                }

                if (type === tools.ARROW || type === tools.LINE) {
                    let newX1 = x1;
                    let newY1 = y1;
                    let newX2 = x2;
                    let newY2 = y2;

                    switch (selectedCorner) {
                        case 'top-left':
                            newX1 = clientX;
                            newY1 = clientY;
                            break;
                        case 'bottom-right':
                            newX2 = clientX;
                            newY2 = clientY;
                            break;
                        case 'top-right':
                            newY1 = clientY;
                            newX2 = clientX;
                            break;
                        case 'bottom-left':
                            newY2 = clientY;
                            newX1 = clientX;
                            break;
                        default:
                            break;
                    }

                    dispatch(updateElement({
                        props: {
                            id,
                            type,
                            x1: newX1,
                            y1: newY1,
                            x2: newX2,
                            y2: newY2,
                            index
                        },
                        context: contextRef.current as CanvasRenderingContext2D
                    }));
                }

                if (type === tools.PENCIL) {
                    if (!points) return;

                    const minX = Math.min(...points.map(p => p.x));
                    const minY = Math.min(...points.map(p => p.y));
                    const maxX = Math.max(...points.map(p => p.x));
                    const maxY = Math.max(...points.map(p => p.y));

                    let anchorX: number = 0, anchorY: number = 0, scaleX: number, scaleY: number;
                    switch (selectedElement.selectedCorner) {
                        case 'top-left': {
                            anchorX = maxX;
                            anchorY = maxY;
                            scaleX = (clientX - anchorX) / (minX - anchorX);
                            scaleY = (clientY - anchorY) / (minY - anchorY);
                            break;
                        } case 'top-right': {
                            anchorX = minX;
                            anchorY = maxY;
                            scaleX = (clientX - anchorX) / (maxX - anchorX);
                            scaleY = (clientY - anchorY) / (minY - anchorY);
                            break;
                        } case 'bottom-left': {
                            anchorX = maxX;
                            anchorY = minY;
                            scaleX = (clientX - anchorX) / (minX - anchorX);
                            scaleY = (clientY - anchorY) / (maxY - anchorY);
                            break;
                        } case 'bottom-right': {
                            anchorX = minX;
                            anchorY = minY;
                            scaleX = (clientX - anchorX) / (maxX - anchorX);
                            scaleY = (clientY - anchorY) / (maxY - anchorY);
                            break;
                        } default:
                            throw new Error("Invalid selectedCorner value: " + selectedElement.selectedCorner);
                    }

                    const newPoints = points.map(p => ({
                        x: anchorX + (p.x - anchorX) * scaleX,
                        y: anchorY + (p.y - anchorY) * scaleY,
                    }));

                    const newX1 = Math.min(...newPoints.map(p => p.x));
                    const newY1 = Math.min(...newPoints.map(p => p.y));
                    const newX2 = Math.max(...newPoints.map(p => p.x));
                    const newY2 = Math.max(...newPoints.map(p => p.y));

                    dispatch(updateElement({
                        props: {
                            id,
                            type,
                            x1: newX1,
                            y1: newY1,
                            x2: newX2,
                            y2: newY2,
                            points: newPoints,
                            index
                        },
                        context: contextRef.current as CanvasRenderingContext2D
                    }));
                }

                if (type === tools.TEXT) {
                    const newDimensions = getResizedDimensions({ x1, y1, x2, y2, clientX, clientY });
                    const scaleFactor = getScaleFactor({ x1, x2, newX2: newDimensions.newX2 });

                    dispatch(updateElement({
                        props: {
                            id,
                            type,
                            x1: newDimensions.newX1,
                            y1: newDimensions.newY1,
                            x2: newDimensions.newX2,
                            y2: newDimensions.newY2,
                            text: selectedElement.text,
                            fontSize: (selectedElement.fontSize ?? 2) * scaleFactor,
                            index
                        },
                        context: contextRef.current as CanvasRenderingContext2D
                    }));
                }
            }
        }
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === actions.WRITING) return;

        if (tool !== tools.ERASER) {
            dispatch(setTool(tools.SELECTION));
            dispatch(setAction(actions.SELECTING));
            updateCursorForPosition(event.target as HTMLElement, "outside");
        }
    };

    const handleTextareaBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        if (!selectedElement) return;

        const index = elements.findIndex((el) => el.id === selectedElement.id);

        const textareaWidth = textareaRef.current ? parseFloat(window.getComputedStyle(textareaRef.current).width) : 0;
        const textareaHeight = textareaRef.current ? parseFloat(window.getComputedStyle(textareaRef.current).height) : 0;

        const newX2 = selectedElement.x1 + textareaWidth;
        const newY2 = selectedElement.y1 + textareaHeight;

        if (index !== -1 && selectedElement) {
            dispatch(updateElement({
                props: { ...selectedElement, x2: newX2, y2: newY2, text: event.target.value, index },
                context: contextRef.current as CanvasRenderingContext2D,
            }));
            dispatch(setTool(tools.SELECTION));
            dispatch(setAction(actions.SELECTING));
        }
        event.target.value = '';
        textareaRef.current?.blur();
        textareaRef.current?.style.setProperty('display', 'none');
    };

    const getLongestLineWidth = (textArea: HTMLTextAreaElement) => {
        const lines = textArea.value.split('\n');
        const font = window.getComputedStyle(textArea).font;
        const context = contextRef.current as CanvasRenderingContext2D;

        context.font = font;

        const longestLine = lines.reduce((acc, line) => {
            const lineWidth = context.measureText(line).width;
            return lineWidth > acc ? lineWidth : acc;
        }, 0);

        return longestLine;
    }

    const adjustTextareaDimensions = useCallback(() => {
        const textArea = textareaRef.current;

        if (textArea && selectedElement) {
            const padding = 3;
            const computedWidth = getLongestLineWidth(textArea) + padding;
            const maxWidthValue = Math.min(window.innerWidth - selectedElement?.x1 - 10, window.innerWidth - 10);
            textArea.style.width = `${Math.min(computedWidth, maxWidthValue)}px`;

            textArea.style.height = 'auto';
            textArea.style.height = `${textArea.scrollHeight}px`;
        }
    }, [selectedElement, textareaRef]);


    const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        if (event.key === 'Enter') {
            const startPosition = textarea.selectionStart;
            const endPosition = textarea.selectionEnd;
            textarea.value = textarea.value.slice(0, startPosition) + '\n' + textarea.value.slice(endPosition);

            textarea.selectionStart = startPosition + 1;
            textarea.selectionEnd = startPosition + 1;

            adjustTextareaDimensions();

            event.preventDefault();
        }
        if (event.key === 'Escape') {
            textarea.blur();
            event.preventDefault();
        }
    };

    const handleTextareaInput = () => {
        adjustTextareaDimensions();
    };

    const handleDoubleClick = () => {
        const textarea = textareaRef.current;
        if (textarea && selectedElement && selectedElement.type === tools.TEXT) {
            const index = elements.findIndex((el) => el.id === selectedElement.id);

            textarea.value = selectedElement.text ?? '';

            dispatch(updateElement({
                props: { ...selectedElement, text: '', index },
                context: contextRef.current as CanvasRenderingContext2D,
            }));
            dispatch(setTool(tools.TEXT));
            dispatch(setAction(actions.WRITING));
        }
    };

    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        if (selectedElement && selectedElement.type === tools.TEXT && action === actions.WRITING) {
            textarea.value = selectedElement.text ?? '';
            textarea.style.fontSize = `${selectedElement.fontSize ?? 16}px`;

            const maxWidthValue = window.innerWidth - selectedElement.x1 - 10;
            const maxHeightValue = window.innerHeight - selectedElement.y1 - 10;

            textarea.style.maxWidth = `${maxWidthValue}px`;
            textarea.style.maxHeight = `${maxHeightValue}px`;

            textarea.style.setProperty('display', 'block');

            adjustTextareaDimensions();

            setTimeout(() => {
                textarea.focus();
                const length = textarea.value.length;
                textarea.selectionStart = length;
                textarea.selectionEnd = length;
            }, 0);

        }
    }, [selectedElement, action, adjustTextareaDimensions]);

    return (
        <>
            <Menu />
            <textarea
                ref={textareaRef}
                className="textarea"
                style={{
                    left: `${selectedElement?.x1}px`,
                    top: `${selectedElement?.y1}px`,
                }}
                onBlur={handleTextareaBlur}
                onKeyDown={handleTextareaKeyDown}
                onInput={handleTextareaInput}
                rows={1}
            />
            <canvas
                id="whiteboard"
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                width={canvasSize.width}
                height={canvasSize.height}
                className={tool}
            />
        </>
    )
}

export default WhiteboardPage