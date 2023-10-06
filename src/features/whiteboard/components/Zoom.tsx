import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setScale } from '../slices/scaleSlice';

import minusIcon from "../../../assets/minus.svg";
import plusIcon from "../../../assets/plus.svg";

import "./Zoom.css"
import { RootState } from '../../../store';
import usePressedKeys from '../hooks/usePressedKeys';

const Zoom = (): React.ReactElement => {
    const dispatch = useDispatch();

    const scale = useSelector((state: RootState) => state.scale.value);

    const pressedKeys = usePressedKeys();

    const onZoom = useCallback((delta: number) => {
        dispatch(setScale(Math.min(Math.max(scale + delta, 0.1), 20)))
    }, [dispatch, scale])

    useEffect(() => {
        const handleZoomWheel = (event: WheelEvent) => {
            if (pressedKeys.has("Meta") || pressedKeys.has("Control")) {
                event.preventDefault();
                const delta = event.deltaY > 0 ? 0.1 : -0.1;
                onZoom(delta);
            }
        };

        const handleZoomKeyboard = (event: KeyboardEvent) => {
            if (event.key === "+") {
                onZoom(0.1);
            } else if (event.key === "-") {
                onZoom(-0.1);
            }
        };

        window.addEventListener("wheel", handleZoomWheel);
        window.addEventListener("keydown", handleZoomKeyboard);

        return () => {
            window.removeEventListener("wheel", handleZoomWheel);
            window.removeEventListener("keydown", handleZoomKeyboard);
        };
    }, [pressedKeys, onZoom]);

    return (
        <div className='menu_zoom_container'>
            <button className="button" onClick={() => onZoom(-0.1)} data-tooltip="Zoom out">
                <img src={minusIcon} alt="undo" width="80%" height="80%" />
            </button>

            <button className="button button-wide" onClick={() => dispatch(setScale(1))} data-tooltip="Reset zoom">
                {new Intl.NumberFormat("en-GB", { style: "percent" }).format(scale)}
            </button>

            <button className="button" onClick={() => onZoom(0.1)} data-tooltip="Zoom in">
                <img src={plusIcon} alt="redo" width="80%" height="80%" />
            </button>
        </div>
    )
}

export default Zoom