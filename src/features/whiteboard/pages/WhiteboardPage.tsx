import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import rough from "roughjs";
import { v4 as uuid } from "uuid";

import { RootState } from '../../../store';
import { actions, tools } from '../../../constants';
import { addElement, deleteElement, setAction, setCanvasSize, setHasFinishedMovingOrResizing, setHasStartedMovingOrResizing, setSelectedElement, setTool, updateElement } from '../slices/whiteboardSlice';
import { setPanOffset, setStartPanMousePosition } from '../slices/panSlice';
import { setScaleOffset } from '../slices/scaleSlice';
import { getResizedDimensions, getScaleFactor, updateCursorForPosition } from '../utils';
import { getCursorForElement } from '../utils/getCursorForElement';

import { Element, PositionState, Point } from '../domain/Element';
import ElementFactory from '../domain/ElementFactory';
import usePressedKeys from '../hooks/usePressedKeys';
import { EditableTextarea, History, Menu, Zoom } from '../components';

const elementFactory = new ElementFactory();

const WhiteboardPage = (): React.ReactElement => {
    const dispatch = useDispatch();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);

    const canvasSize = useSelector((state: RootState) => state.whiteboard.canvasSize);

    const panOffset = useSelector((state: RootState) => state.pan.panOffset);
    const startPanMousePosition = useSelector((state: RootState) => state.pan.startPanMousePosition);

    const scale = useSelector((state: RootState) => state.scale.value);
    const scaleOffset = useSelector((state: RootState) => state.scale.scaleOffset);

    const tool = useSelector((state: RootState) => state.whiteboard.tool);
    const action = useSelector((state: RootState) => state.whiteboard.action);

    const currentElements = useSelector((state: RootState) => state.whiteboard.history[state.whiteboard.historyIndex]);
    const selectedElement = useSelector((state: RootState) => state.whiteboard.selectedElement);

    const pressedKeys = usePressedKeys();

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


        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const newScaleOffsetX = (scaledWidth - canvas.width) / 2;
        const newScaleOffsetY = (scaledHeight - canvas.height) / 2;

        if (newScaleOffsetX !== scaleOffset.x || newScaleOffsetY !== scaleOffset.y) {
            dispatch(setScaleOffset({ x: newScaleOffsetX, y: newScaleOffsetY }));
        }

        context.save();
        context.translate(panOffset.x * scale - newScaleOffsetX, panOffset.y * scale - newScaleOffsetY);
        context.scale(scale, scale);

        currentElements.forEach((element: Element) => {
            elementFactory.drawElement({ roughCanvas, context, element });

            if ((action === actions.SELECTING || action === actions.RESIZING || action === actions.MOVING) && element.id === selectedElement?.id) {
                elementFactory.drawSelectionBox({ context, element });
            }
        });

        context.restore();
    }, [action, currentElements, panOffset.x, panOffset.y, scale, selectedElement, tool, dispatch, scaleOffset.x, scaleOffset.y]);

    const getMouseCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const clientX = (event.clientX - panOffset.x * scale + scaleOffset.x) / scale;
        const clientY = (event.clientY - panOffset.y * scale + scaleOffset.y) / scale;

        return { clientX, clientY };
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === actions.WRITING) return;

        const { clientX, clientY } = getMouseCoordinates(event);

        if (pressedKeys.has(' ') || tool === tools.HAND) {
            (event.target as HTMLElement).style.cursor = 'grabbing';
            dispatch(setAction(actions.PANNING));
            dispatch(setStartPanMousePosition({ x: clientX, y: clientY }));
            return;
        }

        if (tool === tools.SELECTION) {
            const element = elementFactory.getElementAtPosition(currentElements, { x: clientX, y: clientY }, contextRef.current, selectedElement ?? undefined);

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
                    dispatch(setHasStartedMovingOrResizing(true));
                } else if (element.position && ["top-left", "top-right", "bottom-left", "bottom-right"].includes(element.position)) {
                    dispatch(setAction(actions.RESIZING));
                    dispatch(setHasStartedMovingOrResizing(true));
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
                id: uuid(), type: tool, x1: clientX, y1: clientY, x2: clientX, y2: clientY
            });
            dispatch(addElement(element));
            dispatch(setAction(actions.DRAWING));
            dispatch(setSelectedElement(element));
        }

        if (tool === tools.TEXT) {
            const element = elementFactory.createElement({
                id: uuid(), type: tool, x1: clientX, y1: clientY, x2: clientX, y2: clientY, text: '',
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

            const elementsToDelete = new Set<number>();

            for (const point of pointsAroundCircle) {
                for (const [index, element] of currentElements.entries()) {
                    if (getCursorForElement(point.x, point.y, element, contextRef.current as CanvasRenderingContext2D) === "inside") {
                        elementsToDelete.add(index);
                    }
                }
            }

            const sortedIndicesToDelete = Array.from(elementsToDelete).sort((a, b) => b - a);

            for (const index of sortedIndicesToDelete) {
                dispatch(deleteElement(index));
            }
        }
    }

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === actions.WRITING) return;

        const { clientX, clientY } = getMouseCoordinates(event);

        if (pressedKeys.has(' ') || tool === tools.HAND) {
            (event.target as HTMLElement).style.cursor = 'grab';
            // return;
        }

        if (action === actions.PANNING) {
            if (!pressedKeys.has(' ') && tool !== tools.HAND) {
                (event.target as HTMLElement).style.cursor = 'default';
                dispatch(setAction(actions.SELECTING));
                return;
            }

            const deltaX = clientX - startPanMousePosition.x;
            const deltaY = clientY - startPanMousePosition.y;
            dispatch(setPanOffset({ x: panOffset.x + deltaX, y: panOffset.y + deltaY }));
            return;
        }

        if (tool === tools.SELECTION) {
            const element = elementFactory.getElementAtPosition(currentElements, { x: clientX, y: clientY }, contextRef.current, selectedElement ?? undefined);

            if (element) {
                updateCursorForPosition(event.target as HTMLElement, element.position as PositionState);
            } else {
                updateCursorForPosition(event.target as HTMLElement, "outside");
            }
        }

        if (selectedElement) {

            const { id, type, x1, y1, x2, y2, points, selectedCorner } = selectedElement;

            const index = currentElements.findIndex((el) => el.id === selectedElement.id);

            if (action === actions.DRAWING) {
                dispatch(updateElement({ ...selectedElement, x2: clientX, y2: clientY, index }));
            }

            if (action === actions.MOVING) {
                if (selectedElement.type === tools.PENCIL) {
                    const newPoints = (selectedElement.points as Point[]).map((_, index) => ({
                        x: (clientX - (selectedElement.xOffsets ? selectedElement.xOffsets[index] : 0)),
                        y: (clientY - (selectedElement.yOffsets ? selectedElement.yOffsets[index] : 0)),
                    }));

                    dispatch(updateElement({ ...selectedElement, points: newPoints, index }));
                } else {
                    const { x1, y1, x2, y2, type, offsetX = 0, offsetY = 0 } = selectedElement;
                    const width = x2 - x1;
                    const height = y2 - y1;
                    const newX1 = clientX - offsetX;
                    const newY1 = clientY - offsetY;
                    const options = type === tools.TEXT ? { text: selectedElement.text } : {};

                    dispatch(updateElement({ ...selectedElement, x1: newX1, y1: newY1, x2: newX1 + width, y2: newY1 + height, ...options, index, }));
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
                        id, type, x1: newDimensions.newX1, y1: newDimensions.newY1, x2: newDimensions.newX2, y2: newDimensions.newY2, index
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
                        id, type, x1: newX1, y1: newY1, x2: newX2, y2: newY2, index
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
                        case 'top-left':
                            anchorX = maxX;
                            anchorY = maxY;
                            scaleX = (clientX - anchorX) / (minX - anchorX);
                            scaleY = (clientY - anchorY) / (minY - anchorY);
                            break;
                        case 'top-right':
                            anchorX = minX;
                            anchorY = maxY;
                            scaleX = (clientX - anchorX) / (maxX - anchorX);
                            scaleY = (clientY - anchorY) / (minY - anchorY);
                            break;
                        case 'bottom-left':
                            anchorX = maxX;
                            anchorY = minY;
                            scaleX = (clientX - anchorX) / (minX - anchorX);
                            scaleY = (clientY - anchorY) / (maxY - anchorY);
                            break;
                        case 'bottom-right':
                            anchorX = minX;
                            anchorY = minY;
                            scaleX = (clientX - anchorX) / (maxX - anchorX);
                            scaleY = (clientY - anchorY) / (maxY - anchorY);
                            break;
                        default:
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
                        id, type, x1: newX1, y1: newY1, x2: newX2, y2: newY2, points: newPoints, index
                    }));
                }

                if (type === tools.TEXT) {
                    const newDimensions = getResizedDimensions({ x1, y1, x2, y2, clientX, clientY });
                    const scaleFactor = getScaleFactor({ x1, x2, newX2: newDimensions.newX2 });

                    dispatch(updateElement({
                        id, type, x1: newDimensions.newX1, y1: newDimensions.newY1, x2: newDimensions.newX2, y2: newDimensions.newY2, text: selectedElement.text, fontSize: (selectedElement.fontSize ?? 2) * scaleFactor, index
                    }));
                }
            }
        }
    };

    const handleMouseUp = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (action === actions.WRITING) return;

        if (action === actions.MOVING || action === actions.RESIZING) {
            if (selectedElement) {
                dispatch(setHasFinishedMovingOrResizing(true));
                const latestSelectedElement = currentElements.find((el) => el.id === selectedElement.id) as Element;
                dispatch(updateElement({ ...latestSelectedElement, index: currentElements.findIndex((el) => el.id === latestSelectedElement.id) }));
            }
        }

        if (action !== actions.PANNING && tool !== tools.ERASER) {
            dispatch(setTool(tools.SELECTION));
            updateCursorForPosition(event.target as HTMLElement, "outside");
        }

        dispatch(setAction(actions.SELECTING));
    };

    const handleDoubleClick = () => {
        const textarea = textareaRef.current;
        if (textarea && selectedElement && selectedElement.type === tools.TEXT) {
            const index = currentElements.findIndex((el) => el.id === selectedElement.id);

            textarea.value = selectedElement.text ?? '';

            dispatch(setTool(tools.TEXT));
            dispatch(setAction(actions.WRITING));
            dispatch(updateElement({ ...selectedElement, text: '', index }));
        }
    };

    return (
        <>
            <Menu />
            <EditableTextarea
                textareaRef={textareaRef}
                context={contextRef.current as CanvasRenderingContext2D}
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
            <Zoom />
            <History />
        </>
    )
}

export default WhiteboardPage
