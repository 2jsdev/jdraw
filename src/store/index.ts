import { configureStore } from "@reduxjs/toolkit";
// import appApi from "../services/app";
import rtkQueryErrorLogger from "./middlewares/rtkQueryErrorLogger";
import rootReducer from "./reducers";

const reducerList = {
  // [appApi.reducerPath]: appApi.reducer,
  ...rootReducer,
};

export const createStore = () =>
  configureStore({
    reducer: reducerList,
    middleware: (getDefaultMiddleware) => [
      ...getDefaultMiddleware({
        serializableCheck: false,
      }),
      // appApi.middleware,
      rtkQueryErrorLogger,
    ],
  });

export const store = createStore();
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
