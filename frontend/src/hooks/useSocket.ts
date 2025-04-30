"use client"
import { RootState } from "@/store/store";


import { Socket, io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "@/store/notificationSlice";
import { INotification } from "@/Interface/interface";

export const useSocket = () => {
  const dispatch = useDispatch();
  const socketRef = useRef<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  useEffect(() => {
    // Don't initialize if there's no SOCKET_URL
    if (!SOCKET_URL) {
      console.error("Missing SOCKET_URL environment variable");
      return;
    }

    if (!socketRef.current) {
      console.log("Initializing socket connection...");
      const socket = io(SOCKET_URL, {
        transports: ["websocket"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
        
        // Only authenticate if user exists and has ID
        if (user?.id) {
          console.log("Authenticating user:", user.id);
          socket.emit("authenticate", user.id);
        }
      });

      socket.on("authenticated", () => {
        console.log("Socket authenticated successfully");
        setIsAuthenticated(true);
      });

      socket.on("new-notification", (notification: INotification) => {
        console.log("New notification received:", notification);
        if (notification && notification._id) {  // Validate notification
          dispatch(addNotification(notification));
        } else {
          console.error("Received invalid notification:", notification);
        }
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected, reason:", reason);
        setIsAuthenticated(false);
      });
    }

    // Re-authenticate when user ID changes
    if (socketRef.current?.connected && user?.id && !isAuthenticated) {
      console.log("Re-authenticating user after connection changes:", user.id);
      socketRef.current.emit("authenticate", user.id);
    }

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.off("new-notification");
        socketRef.current.off("connect");
        socketRef.current.off("authenticated");
        socketRef.current.off("connect_error");
        socketRef.current.off("disconnect");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsAuthenticated(false);
      }
    };
  }, [user?.id, dispatch, SOCKET_URL, isAuthenticated]);

  return socketRef.current;
};