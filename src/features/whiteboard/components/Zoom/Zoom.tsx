import React, { useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../store';
import { setScale } from '../../slices/scaleSlice';

import minusIcon from "../../../../assets/minus.svg";
import plusIcon from "../../../../assets/plus.svg";

import "./Zoom.css"

const isMac = navigator.userAgent.includes('Macintosh');

const Zoom = (): React.ReactElement => {
    const dispatch = useDispatch();

    const scale = useSelector((state: RootState) => state.scale.value);

    const onZoom = useCallback((delta: number) => {
        dispatch(setScale(Math.min(Math.max(scale + delta, 0.1), 20)))
    }, [dispatch, scale])

    useEffect(() => {
        const handleZoomWheel = (event: WheelEvent) => {
            const mainKey = isMac ? event.metaKey : event.ctrlKey;
            if (mainKey) {
                event.preventDefault();
                const delta = event.deltaY > 0 ? 0.1 : -0.1;
                onZoom(delta);
            }
        };

        const handleZoomInKeyboard = (event: KeyboardEvent) => {
            const mainKey = isMac ? event.metaKey : event.ctrlKey;
            if (event.key === "+" && mainKey) {
                event.preventDefault();
                onZoom(0.1);
            }
        }

        const handleZoomOutKeyboard = (event: KeyboardEvent) => {
            const mainKey = isMac ? event.metaKey : event.ctrlKey;
            if (event.key === "-" && mainKey) {
                event.preventDefault();
                onZoom(-0.1);
            }
        }


        window.addEventListener("wheel", handleZoomWheel);
        window.addEventListener("keydown", handleZoomInKeyboard);
        window.addEventListener("keydown", handleZoomOutKeyboard);

        return () => {
            window.removeEventListener("wheel", handleZoomWheel);
            window.removeEventListener("keydown", handleZoomOutKeyboard);
            window.removeEventListener("keydown", handleZoomInKeyboard);
        };
    }, [onZoom]);



    return (
        <div className='menu_zoom_container'>
            <button className="menu_zoom_button" onClick={() => onZoom(-0.1)} data-tooltip="Zoom out">
                <img src={minusIcon} alt="undo" width="80%" height="80%" />
            </button>

            <button className="menu_zoom_button menu_zoom_button_wide" onClick={() => dispatch(setScale(1))} data-tooltip="Reset zoom">
                {new Intl.NumberFormat("en-GB", { style: "percent" }).format(scale)}
            </button>

            <button className="menu_zoom_button" onClick={() => onZoom(0.1)} data-tooltip="Zoom in">
                <img src={plusIcon} alt="redo" width="80%" height="80%" />
            </button>
        </div>
    )
}

export default Zoom