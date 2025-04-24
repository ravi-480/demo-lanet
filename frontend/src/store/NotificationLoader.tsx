import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import {
  addNotification,
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

  const hasFetchedNotificationsRef = useRef(false);  // Prevents unnecessary re-fetching

  useEffect(() => {
    if (!user?.id || hasFetchedNotificationsRef.current) return; // Don't refetch if notifications have already been fetched
  
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
        hasFetchedNotificationsRef.current = true; // Mark notifications as fetched
      } catch (error: any) {
        console.log("Server connection issue - notifications not loaded");
        setConnectionStatus("disconnected");
        dispatch(fetchNotificationsFailure("Unable to load notifications"));
      }
    };
  
    fetchNotifications();
  
    if (socket) {
      socket.on("new-notification", (notification) => {
        dispatch(addNotification(notification));  // Ensure this doesn't trigger another fetch
      });
  
      socket.on("connect", () => {
        setConnectionStatus("connected");
        if (!hasFetchedNotificationsRef.current) {
          fetchNotifications();  // Only fetch if not already fetched
        }
      });
    }
  
    // Cleanup on component unmount
    return () => {
      if (socket) {
        socket.off("new-notification");
        socket.off("connect");
      }
    };
  }, [user?.id, socket, dispatch, connectionStatus]);
  

  return null;
};

export default NotificationLoader;
