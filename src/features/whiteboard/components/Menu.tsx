import { Tool, tools } from "../../../constants/toolType";
import { useDispatch, useSelector } from "react-redux";
import { setTool } from "../slices/whiteboardSlice";

import selectionIcon from "../../../assets/selection.svg";
// import rectangleIcon from "../../../assets/rectangle.svg";
// import diamondIcon from "../../../assets/diamond.svg";
// import ellipseIcon from "../../../assets/ellipse.svg";
// import arrowIcon from "../../../assets/arrow.svg";
// import lineIcon from "../../../assets/line.svg";
import pencilIcon from "../../../assets/draw.svg";
import textIcon from "../../../assets/text.svg";
// import insertImageIcon from "../../../assets/insert_image.svg";
import eraserIcon from "../../../assets/eraser.svg";

import "./Menu.css";
import { RootState } from "../../../store";

const iconMap = {
    [tools.SELECTION]: selectionIcon,
    // [tools.RECTANGLE]: rectangleIcon,
    // [tools.DIAMOND]: diamondIcon,
    // [tools.ELLIPSE]: ellipseIcon,
    // [tools.ARROW]: arrowIcon,
    // [tools.LINE]: lineIcon,
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

    return (
        <div className="menu_container">
            {Object.entries(iconMap).map(([type, iconSrc]) => (
                <button
                    key={type}
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
