"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import {
  fetchNotificationsFailure,
  fetchNotificationsSuccess,
  fetchNotificationStart,
  markAllAsRead,
} from "./notificationSlice";
import axios from "axios";
import { useSocket } from "@/hooks/useSocket";

const NotificationLoader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const socket = useSocket();

  useEffect(() => {
    if (!user?.id) return;

    dispatch(fetchNotificationStart());

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/notifications`,
          {
            withCredentials: true,
            params: { userId: user.id },
          }
        );

        dispatch(fetchNotificationsSuccess(response.data.notifications));
      } catch (error: any) {
        console.error("Error fetching notifications:", error);
        dispatch(fetchNotificationsFailure(error.message));
      }
    };

    fetchNotifications();

    if (socket) {
      socket.emit("authenticate", user.id);
      socket.on("notifications-marked-read", () => {
        dispatch(markAllAsRead());
      });
    }
  }, [user, dispatch, socket]);

  return null;
};

export default NotificationLoader;
