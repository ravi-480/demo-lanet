import { configureStore } from "@reduxjs/toolkit";
import authReducer, { logout } from "./authSlice"; // Import your reducers
import eventReducer from "./eventSlice";
import vendorReducer from "./vendorSlice";
import splitVendorPrice from "./splitSlice";
import paymentReducers from "./paymentSlice";
import notificationReducer from "./notificationSlice";
import rsvpReducer from "./rsvpSlice";
import api from "@/utils/api";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    event: eventReducer,
    vendors: vendorReducer,
    splitPrice: splitVendorPrice,
    payment: paymentReducers,
    notification: notificationReducer,
    rsvp: rsvpReducer,
  },
});

// Export RootState and AppDispatch for type safety
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
