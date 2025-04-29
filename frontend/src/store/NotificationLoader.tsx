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

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      const response = await api.get(`/notifications`, {
        params: { userId: user.id },
        timeout: 5000,
      });
      
      // Handle empty or undefined response
      if (!response.data) {
        console.log("Empty response from notifications API");
        dispatch(fetchNotificationsSuccess([])); // Set empty array as default
        hasFetchedNotificationsRef.current = true;
        return;
      }
      
      // Handle different response formats
      if (Array.isArray(response.data)) {
        // If API directly returns an array
        dispatch(fetchNotificationsSuccess(response.data));
        hasFetchedNotificationsRef.current = true;
      } else if (response.data.notifications && Array.isArray(response.data.notifications)) {
        // If API returns { notifications: [] }
        dispatch(fetchNotificationsSuccess(response.data.notifications));
        hasFetchedNotificationsRef.current = true;
      } else if (Object.keys(response.data).length === 0) {
        // Empty object response
        console.log("Empty object response from notifications API");
        dispatch(fetchNotificationsSuccess([])); // Set empty array as default
        hasFetchedNotificationsRef.current = true;
      } else {
        console.log("Unexpected response format:", response.data);
        dispatch(fetchNotificationsSuccess([])); // Set empty array as default
        hasFetchedNotificationsRef.current = true;
      }
    } catch (error: unknown) {
      let errorMessage = "Unable to load notifications";
      
      if (error instanceof AxiosError) {
        console.log(
          "Server connection issue - notifications not loaded:",
          error.message
        );
        
        // Add more specific error information
        if (error.response) {
          errorMessage += `: ${error.response.status} ${error.response.statusText}`;
        } else if (error.request) {
          errorMessage += ": No response received";
        } else {
          errorMessage += `: ${error.message}`;
        }
      } else {
        console.log(
          "Server connection issue - notifications not loaded:",
          error
        );
      }
      
      setConnectionStatus("disconnected");
      dispatch(fetchNotificationsFailure(errorMessage));
    }
  };

  useEffect(() => {
    console.log("User ID in NotificationLoader:", user?.id);

    if (!user?.id) return;

    dispatch(fetchNotificationStart());
    fetchNotifications();

    if (socket) {
      socket.on("connect", () => {
        console.log("Socket connected in NotificationLoader");
        setConnectionStatus("connected");
        if (!hasFetchedNotificationsRef.current) {
          fetchNotifications();
        }
      });
      
      // Add reconnection handling
      socket.on("reconnect", () => {
        console.log("Socket reconnected in NotificationLoader");
        setConnectionStatus("connected");
        fetchNotifications(); // Refresh notifications after reconnect
      });
    }

    return () => {
      if (socket) {
        socket.off("connect");
        socket.off("reconnect");
      }
    };
  }, [user?.id, socket, dispatch]);

  return null;
};

export default NotificationLoader;

// Modified API utility with better notification handling
// Add this to your api.ts or create a separate notifications API utility
export const fetchNotificationsApi = async (userId: string) => {
  try {
    // First try the expected endpoint
    const response = await api.get(`/notifications`, {
      params: { userId },
      timeout: 5000,
    });
    
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      // If 404, try an alternative endpoint format
      try {
        const altResponse = await api.get(`/user/${userId}/notifications`, {
          timeout: 5000,
        });
        return altResponse.data;
      } catch (altError) {
        throw altError;
      }
    }
    throw error;
  }
};

