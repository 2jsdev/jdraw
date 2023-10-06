import panReducer from "../features/whiteboard/slices/panSlice";
import whiteboardReducer from "../features/whiteboard/slices/whiteboardSlice";

const rootReducer = {
  pan: panReducer,
  whiteboard: whiteboardReducer,
};

export default rootReducer;
