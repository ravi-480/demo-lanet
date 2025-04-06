import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // Import your reducers
import eventReducer from "./eventSlice";
import vendorReducer from "./vendorSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    event: eventReducer,
    vendors: vendorReducer,
  },
});

// Export RootState and AppDispatch for type safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
