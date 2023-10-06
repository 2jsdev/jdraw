import panReducer from "../features/whiteboard/slices/panSlice";
import scaleReducer from "../features/whiteboard/slices/scaleSlice";
import whiteboardReducer from "../features/whiteboard/slices/whiteboardSlice";

const rootReducer = {
  pan: panReducer,
  scale: scaleReducer,
  whiteboard: whiteboardReducer,
};

export default rootReducer;
