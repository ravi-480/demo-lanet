import { INotification } from "@/Interface/interface";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationState {
  items: INotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
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
      state.unreadCount = action.payload.length; // All fetched are unread
      state.loading = false;
    },
    fetchNotificationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addNotification(state, action: PayloadAction<INotification>) {
      const exists = state.items.some((n) => n._id === action.payload._id);
      if (!exists && action.payload.status === "unread") {
        state.items.unshift(action.payload);
        state.unreadCount += 1;
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const index = state.items.findIndex((n) => n._id === action.payload);
      if (index !== -1 && state.items[index].status === "unread") {
        state.items[index].status = "read";
        state.unreadCount -= 1;
      }
    },
    markAllAsRead(state) {
      state.items = state.items.map((n) => ({ ...n, status: "read" }));
      state.unreadCount = 0;
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
