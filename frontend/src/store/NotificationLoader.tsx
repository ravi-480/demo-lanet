import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  fetchNotificationsFailure,
  fetchNotificationsSuccess,
  fetchNotificationStart,
} from "@/store/notificationSlice";
import { AxiosError } from "axios";
import { useSocket } from "@/hooks/useSocket";
import api from "@/utils/api";

const NotificationLoader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const socket = useSocket();
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const hasFetchedNotificationsRef = useRef(false);

  useEffect(() => {
    console.log(user?.id);

    if (!user?.id) return;

    dispatch(fetchNotificationStart());

    const fetchNotifications = async () => {
      try {
        const response = await api.get(`/notifications`, {
          params: { userId: user.id },
          timeout: 5000,
        });
        dispatch(fetchNotificationsSuccess(response.data.notifications));
        hasFetchedNotificationsRef.current = true;
      } catch (error: unknown) {
        if (error instanceof AxiosError) {
          console.log(
            "Server connection issue - notifications not loaded:",
            error.message
          );
        } else {
          console.log(
            "Server connection issue - notifications not loaded:",
            error
          );
        }
        setConnectionStatus("disconnected");
        dispatch(fetchNotificationsFailure("Unable to load notifications"));
      }
    };

    fetchNotifications();

    if (socket) {
      socket.on("connect", () => {
        setConnectionStatus("connected");
        if (!hasFetchedNotificationsRef.current) {
          fetchNotifications();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
      }
    };
  }, [user?.id, socket, dispatch, connectionStatus]);

  return null;
};

export default NotificationLoader;
