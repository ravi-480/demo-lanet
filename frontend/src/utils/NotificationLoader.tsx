"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  fetchNotificationsFailure,
  fetchNotificationsSuccess,
  fetchNotificationStart,
  addNotification,
} from "@/store/notificationSlice";
import { AxiosError } from "axios";
import { useSocket } from "@/hooks/useSocket";
import api from "@/utils/api";
import { setUser } from "../store/authSlice";

const NotificationLoader = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const socket = useSocket();
  const hasFetchedNotificationsRef = useRef(false);

  useEffect(() => {
    const silentlyCheckAuth = async () => {
      try {
        const response = await api.get("/auth", {
          validateStatus: (status) => status < 500,
          timeout: 3000,
        });

        if (response.status === 200 && response.data?.user) {
          dispatch(setUser(response.data.user));
        }
      } catch {
        // silently ignore
      }
    };

    if (!user?.id) silentlyCheckAuth();
  }, [dispatch, socket?.connected, user?.id]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id || hasFetchedNotificationsRef.current) return;

    hasFetchedNotificationsRef.current = true; //  Prevents duplicate fetches
    dispatch(fetchNotificationStart());

    try {
      const response = await api.get(`/notifications`, {
        params: { userId: user.id },
        timeout: 5000,
      });

      const data = response.data;

      if (!data || Object.keys(data).length === 0) {
        dispatch(fetchNotificationsSuccess([]));
      } else if (Array.isArray(data)) {
        dispatch(fetchNotificationsSuccess(data));
      } else if (Array.isArray(data.notifications)) {
        dispatch(fetchNotificationsSuccess(data.notifications));
      } else {
        dispatch(fetchNotificationsSuccess([]));
      }
    } catch (error) {
      hasFetchedNotificationsRef.current = false; // allow retry
      let errorMessage = "Unable to load notifications";

      if (error instanceof AxiosError) {
        if (error.response) {
          errorMessage += `: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage += ": No response received";
        } else {
          errorMessage += `: ${error.message}`;
        }
      }

      dispatch(fetchNotificationsFailure(errorMessage));
    }
  }, [user?.id, dispatch]);

  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();

    if (socket) {
      const handleConnect = () => {
        socket.emit("authenticate", user.id);
        if (!hasFetchedNotificationsRef.current) fetchNotifications();
      };

      const handleReconnect = () => {
        if (!hasFetchedNotificationsRef.current) fetchNotifications();
      };

      const handleNewNotification = (notification: any) => {
        dispatch(addNotification(notification)); // ✅ Add to list without refetching
      };

      socket.on("connect", handleConnect);
      socket.on("reconnect", handleReconnect);
      socket.on("new-notification", handleNewNotification);

      if (socket.connected) handleConnect();

      return () => {
        socket.off("connect", handleConnect);
        socket.off("reconnect", handleReconnect);
        socket.off("new-notification", handleNewNotification);
      };
    }
  }, [user?.id, socket, dispatch, fetchNotifications]);

  return null;
};

export default NotificationLoader;
