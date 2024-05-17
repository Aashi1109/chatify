import { configureStore } from "@reduxjs/toolkit";
import { authReducer, chatReducer, uiReducer } from "./slices";

const store = configureStore({
  reducer: {
    ui: uiReducer,
    auth: authReducer,
    chat: chatReducer,
  },
});

// inferring types for the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
