import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../store";
import { setTool } from "../../slices/whiteboardSlice";

import handIcon from "../../../../assets/hand.svg";
import selectionIcon from "../../../../assets/selection.svg";
import rectangleIcon from "../../../../assets/rectangle.svg";
import diamondIcon from "../../../../assets/diamond.svg";
import ellipseIcon from "../../../../assets/ellipse.svg";
import arrowIcon from "../../../../assets/arrow.svg";
import lineIcon from "../../../../assets/line.svg";
import pencilIcon from "../../../../assets/draw.svg";
import textIcon from "../../../../assets/text.svg";
// import insertImageIcon from "../../../../assets/insert_image.svg";
import eraserIcon from "../../../../assets/eraser.svg";

import { Tool, tools, toolNames } from "../../../../constants/toolType";

import "./Menu.css";

const iconMap = {
    [tools.HAND]: handIcon,
    [tools.SELECTION]: selectionIcon,
    [tools.RECTANGLE]: rectangleIcon,
    [tools.DIAMOND]: diamondIcon,
    [tools.ELLIPSE]: ellipseIcon,
    [tools.ARROW]: arrowIcon,
    [tools.LINE]: lineIcon,
    [tools.PENCIL]: pencilIcon,
    [tools.TEXT]: textIcon,
    // [tools.INSERT_IMAGE]: insertImageIcon,
    [tools.ERASER]: eraserIcon,
};

const Menu = () => {
    const dispatch = useDispatch();
    const tool = useSelector((state: RootState) => state.whiteboard.tool);

    const handleToolChange = (type: Tool) => {
        dispatch(setTool(type));
    };

    useEffect(() => {
        let tooltipTimeout: number | undefined;

        const mouseEnterHandler = (event: Event) => {
            const button = event.currentTarget as HTMLElement;
            tooltipTimeout = setTimeout(() => {
                button.classList.add('show-tooltip');
            }, 2000);
        };

        const mouseLeaveHandler = (event: Event) => {
            clearTimeout(tooltipTimeout);
            const button = event.currentTarget as HTMLElement;
            button.classList.remove('show-tooltip');
        };

        document.querySelectorAll('.menu_button').forEach(button => {
            button.addEventListener('mouseenter', mouseEnterHandler);
            button.addEventListener('mouseleave', mouseLeaveHandler);
        });

        return () => {
            document.querySelectorAll('.menu_button').forEach(button => {
                button.removeEventListener('mouseenter', mouseEnterHandler);
                button.removeEventListener('mouseleave', mouseLeaveHandler);
            });
        };
    }, []);

    return (
        <div className="menu_container">
            {Object.entries(iconMap).map(([type, iconSrc]) => (
                <button
                    key={type}
                    data-tooltip={toolNames[type]}
                    className={`menu_button ${tool === type ? "menu_button_active" : ""}`}
                    onClick={() => handleToolChange(type)}
                >
                    <img src={iconSrc} alt="" width="80%" height="80%" />
                </button>
            ))}
        </div>
    );
};

export default Menu;
