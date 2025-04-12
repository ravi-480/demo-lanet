import { INotification } from "@/Types/type";
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
      state.unreadCount = action.payload.filter(
        (n) => n.status === "unread"
      ).length;
      state.loading = false;
    },
    fetchNotificationsFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addNotification: (state, action: PayloadAction<INotification>) => {
      const exists = state.items.some((n) => n._id === action.payload._id);
      if (!exists) {
        state.items = [action.payload, ...state.items];
        if (action.payload.status === "unread") {
          state.unreadCount += 1;
        }
      }
    },
    markAsRead(state, action: PayloadAction<string>) {
      const notification = state.items.find((n) => n._id === action.payload);
      if (notification && notification.status === "unread") {
        notification.status = "read";
        state.unreadCount -= 1;
      }
    },
    markAllAsRead(state) {
      state.items.forEach((notification) => {
        notification.status = "read";
      });
      state.unreadCount = 0;
    },
  },
});

export const {
  fetchNotificationStart,
  fetchNotificationsSuccess,
  fetchNotificationsFailure,
  addNotification,
  markAllAsRead,
  markAsRead,
} = notificationSlice.actions;
export default notificationSlice.reducer;
