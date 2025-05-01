"use client";

import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  fetchNotificationsFailure,
  fetchNotificationsSuccess,
  fetchNotificationStart,
} from "@/store/notificationSlice";
import { AxiosError } from "axios";
import { useSocket } from "@/hooks/useSocket";
import api from "@/utils/api";
import { useAuthSession } from "@/hooks/useAuthSession";

const NotificationLoader = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useAuthSession();
  const socket = useSocket();
  const hasFetchedNotificationsRef = useRef(false);

  const fetchNotifications = async () => {
    if (!user?.id || hasFetchedNotificationsRef.current) return;

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

      hasFetchedNotificationsRef.current = true;
    } catch (error) {
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
  };

  useEffect(() => {
    // Only proceed if we're authenticated and have a user ID
    if (!isAuthenticated || !user?.id || hasFetchedNotificationsRef.current)
      return;

    fetchNotifications();

    if (socket) {
      const handleConnect = () => {
        socket.emit("authenticate", user.id);
        if (!hasFetchedNotificationsRef.current) fetchNotifications();
      };

      const handleReconnect = () => {
        if (!hasFetchedNotificationsRef.current) fetchNotifications();
      };

      socket.on("connect", handleConnect);
      socket.on("reconnect", handleReconnect);

      if (socket.connected) handleConnect();

      return () => {
        socket.off("connect", handleConnect);
        socket.off("reconnect", handleReconnect);
      };
    }
  }, [user?.id, socket, dispatch, isAuthenticated]);

  return null;
};

export default NotificationLoader;

export const fetchNotificationsApi = async (userId: string) => {
  try {
    const response = await api.get(`/notifications`, {
      params: { userId },
      timeout: 5000,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      const altResponse = await api.get(`/user/${userId}/notifications`, {
        timeout: 5000,
      });
      return altResponse.data;
    }
    throw error;
  }
};
