import React from 'react'
import { useDispatch } from 'react-redux';
import { redo, undo } from '../slices/whiteboardSlice';

import undoIcon from "../../../assets/undo.svg";
import redoIcon from "../../../assets/redo.svg";

import "./History.css"

const History = (): React.ReactElement => {
    const dispatch = useDispatch();

    const handleUndo = () => dispatch(undo())
    const handleRedo = () => dispatch(redo())

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