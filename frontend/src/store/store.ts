import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Import your reducers

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Export RootState and AppDispatch for type safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
