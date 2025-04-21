import { useEffect, useState } from "react";
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
  const [connectionStatus, setConnectionStatus] = useState("connected");

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
            timeout: 5000,
          }
        );

        dispatch(fetchNotificationsSuccess(response.data.notifications));
        setConnectionStatus("connected");
      } catch (error: any) {
        console.log("Server connection issue - notifications not loaded");
        setConnectionStatus("disconnected");

        //  dispatch the failure for the store, but with a user-friendly message
        dispatch(fetchNotificationsFailure("Unable to load notifications"));
      }
    };

    fetchNotifications();

    if (socket) {
      socket.emit("authenticate", user.id);
      socket.on("notifications-marked-read", () => {
        dispatch(markAllAsRead());
      });

      socket.on("connect", () => {
        setConnectionStatus("connected");
        // Refetch notifications when connection is restored
        fetchNotifications();
      });

      socket.on("disconnect", () => {
        setConnectionStatus("disconnected");
      });
    }

    //  auto-retry
    const retryInterval = setInterval(() => {
      if (connectionStatus === "disconnected") {
        fetchNotifications();
      }
    }, 10000); // Try every 10 seconds

    return () => {
      clearInterval(retryInterval);
      if (socket) {
        socket.off("notifications-marked-read");
        socket.off("connect");
        socket.off("disconnect");
      }
    };
  }, [user, dispatch, socket]);

  return null;
};

export default NotificationLoader;
