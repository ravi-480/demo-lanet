import { AppDispatch, RootState } from "@/store/store";
import { Socket, io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "@/store/notificationSlice";
import { INotification } from "@/Interface/interface";

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

  useEffect(() => {
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

        if (user?.id) {
          console.log("Authenticating user:", user.id);
          socket.emit("authenticate", user.id);
        }
      });

      socket.on("authenticated", () => {
        console.log("Socket authenticated successfully");
      });

      socket.on("new-notification", (notification: INotification) => {
        console.log("New notification received:", notification);
        dispatch(addNotification(notification));
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected, reason:", reason);
      });
    }

    return () => {
      if (socketRef.current) {
        console.log("Cleaning up socket connection");
        socketRef.current.off("new-notification"); // Only remove what was added here
        socketRef.current.off("connect");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id, dispatch]);

  return socketRef.current;
};
