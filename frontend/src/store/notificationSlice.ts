import { INotification } from "@/Interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationState {
  items: INotification[];
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    fetchNotificationStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchNotificationsSuccess(state, action: PayloadAction<INotification[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    fetchNotificationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addNotification(state, action: PayloadAction<INotification>) {
      const exists = state.items.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.items = [action.payload, ...state.items];
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      state.items = state.items.filter((n) => n._id !== action.payload);
    },
    markAllAsRead(state) {
      state.items = [];
    },
  },
});

export const {
  fetchNotificationStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAsRead,
  markAllAsRead,
} = notificationSlice.actions;
export default notificationSlice.reducer;
