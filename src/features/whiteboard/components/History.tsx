import React, { useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { redo, undo } from '../slices/whiteboardSlice';

import undoIcon from "../../../assets/undo.svg";
import redoIcon from "../../../assets/redo.svg";

import "./History.css"

const isMac = navigator.userAgent.includes('Macintosh');

const History = (): React.ReactElement => {
    const dispatch = useDispatch();

    const handleUndo = useCallback(() => dispatch(undo()), [dispatch])
    const handleRedo = useCallback(() => dispatch(redo()), [dispatch])

    useEffect(() => {
        const handleUndoKeyboard = (event: KeyboardEvent) => {
            const mainKey = isMac ? event.metaKey : event.ctrlKey;
            if (event.key === "z" && mainKey) {
                event.preventDefault();
                handleUndo();
            }
        }

        const handleRedoKeyboard = (event: KeyboardEvent) => {
            const mainKey = isMac ? event.metaKey : event.ctrlKey;
            if (event.key === "y" && mainKey) {
                event.preventDefault();
                handleRedo();
            }
        }

        window.addEventListener("keydown", handleUndoKeyboard);
        window.addEventListener("keydown", handleRedoKeyboard);

        return () => {
            window.removeEventListener("keydown", handleUndoKeyboard);
            window.removeEventListener("keydown", handleRedoKeyboard);
        };

    }, [handleRedo, handleUndo]);


    return (
        <div className='menu_history_container'>
            <button className="button" onClick={handleUndo} data-tooltip="Undo">
                <img src={undoIcon} alt="undo" width="80%" height="80%" />
            </button>
            <div className="separator"></div>
            <button className="button" onClick={handleRedo} data-tooltip="Redo">
                <img src={redoIcon} alt="redo" width="80%" height="80%" />
            </button>
        </div>
    )
}

export default History