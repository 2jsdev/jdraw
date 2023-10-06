import React, { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { actions, tools } from '../../../../constants';
import { setAction, setTool, updateElement } from '../../slices/whiteboardSlice';

import './EditableTextarea.css';

const EditableTextarea: React.FC<{
    context: CanvasRenderingContext2D; textareaRef: React.RefObject<HTMLTextAreaElement>;
}> = ({ textareaRef, context }) => {
    const dispatch = useDispatch();

    // const textareaRef = useRef<HTMLTextAreaElement>(null);

    const action = useSelector((state: RootState) => state.whiteboard.action);

    const currentElements = useSelector((state: RootState) => state.whiteboard.history[state.whiteboard.historyIndex]);
    const selectedElement = useSelector((state: RootState) => state.whiteboard.selectedElement);

    const panOffset = useSelector((state: RootState) => state.pan.panOffset);

    const scale = useSelector((state: RootState) => state.scale.value);
    const scaleOffset = useSelector((state: RootState) => state.scale.scaleOffset);


    const handleTextareaBlur = (event: React.FocusEvent<HTMLTextAreaElement>) => {
        if (!selectedElement) return;

        const index = currentElements.findIndex((el) => el.id === selectedElement.id);

        const textareaWidth = textareaRef.current ? parseFloat(window.getComputedStyle(textareaRef.current).width) : 0;
        const textareaHeight = textareaRef.current ? parseFloat(window.getComputedStyle(textareaRef.current).height) : 0;

        const newX2 = selectedElement.x1 + textareaWidth;
        const newY2 = selectedElement.y1 + textareaHeight;


        const textHasChanged = selectedElement.text !== event.target.value;
        const positionHasChanged = selectedElement.x1 !== newX2 || selectedElement.y1 !== newY2;
        const dimensionsHaveChanged = selectedElement.x2 !== newX2 || selectedElement.y2 !== newY2;

        const hasChanged = textHasChanged || positionHasChanged || dimensionsHaveChanged;

        if (index !== -1 && selectedElement) {
            dispatch(updateElement({ ...selectedElement, x2: newX2, y2: newY2, text: event.target.value, index }));
            dispatch(setTool(tools.SELECTION));
            dispatch(setAction(actions.SELECTING));

            if (hasChanged) {
                console.log('Texto modificado, añadiendo al historial 📜');
            }
        }
        event.target.value = '';
        textareaRef.current?.blur();
        textareaRef.current?.style.setProperty('display', 'none');
    };


    const getLongestLineWidth = (textArea: HTMLTextAreaElement) => {
        const lines = textArea.value.split('\n');
        const font = window.getComputedStyle(textArea).font;
        // const context = contextRef.current as CanvasRenderingContext2D;

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

            // Ten en cuenta la escala cuando determines el valor máximo de ancho
            const maxWidthValue = Math.min((window.innerWidth - (selectedElement?.x1 * scale) - 10), window.innerWidth - 10);

            // Ajusta el ancho del textarea teniendo en cuenta la escala
            textArea.style.width = `${Math.min(computedWidth, maxWidthValue) * scale}px`;

            textArea.style.height = 'auto';

            // Ajusta la altura del textarea teniendo en cuenta la escala
            textArea.style.height = `${textArea.scrollHeight * scale}px`;
        }
    }, [selectedElement, textareaRef, scale]);

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


    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        if (selectedElement && selectedElement.type === tools.TEXT && action === actions.WRITING) {
            textarea.value = selectedElement.text ?? '';
            textarea.style.fontSize = `${(selectedElement.fontSize ?? 16) * scale}px`;

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
    }, [selectedElement, action, scale, textareaRef, adjustTextareaDimensions]);


    return (
        <textarea
            ref={textareaRef}
            className="textarea"
            style={{
                top: `${selectedElement?.y1 ? (selectedElement.y1) * scale + panOffset.y * scale - scaleOffset.y : 0}px`,
                left: `${selectedElement?.x1 ? (selectedElement.x1) * scale + panOffset.x * scale - scaleOffset.x : 0}px`,
            }}
            onBlur={handleTextareaBlur}
            onKeyDown={handleTextareaKeyDown}
            onInput={handleTextareaInput}
            rows={1}
        />
    );
};

export default EditableTextarea;
