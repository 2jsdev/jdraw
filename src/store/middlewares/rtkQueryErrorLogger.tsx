import { Middleware, AnyAction, isRejectedWithValue, MiddlewareAPI } from '@reduxjs/toolkit'

const rtkQueryErrorLogger: Middleware = (_store: MiddlewareAPI) => (next) => (action: AnyAction) => {
  if (isRejectedWithValue(action)) {
    console.warn('We got a rejected action!');
  }
  return next(action);
}

export default rtkQueryErrorLogger;
