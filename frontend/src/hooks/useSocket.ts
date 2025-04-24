import { AppDispatch, RootState } from "@/store/store";
import { Socket, io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addNotification } from "@/store/notificationSlice";

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Only initialize the socket once
    if (!socketRef.current) {
      const socket = io("http://localhost:5000", {
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

        // Only authenticate when the user is available and hasn't been authenticated
        if (user?.id) {
          socket.emit("authenticate", user.id);
          console.log("Authenticated user:", user.id);
        }
      });

      socket.on("new-notification", (notification: any) => {
        console.log("New notification:", notification);
        dispatch(addNotification(notification));
      });

      socket.on("connect_error", (err) => {
        console.log("Socket connection error:", err);
      });

      socket.on("reconnect_attempt", (attempt) => {
        console.log(`Reconnect attempt: ${attempt}`);
        // Optionally: Handle reconnect attempts or show a loading/reconnecting state.
      });

      socket.on("reconnect", () => {
        console.log("Socket reconnected!");
        // Optionally: Re-fetch some data or send additional requests upon reconnection.
      });

      socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    }

    // Clean up when the component unmounts or when the user changes
    return () => {
      if (socketRef.current) {
        socketRef.current.off("new-notification");
        socketRef.current.disconnect();
        socketRef.current = null; // Reset the socket reference
      }
    };
  }, [user?.id, dispatch]); // Only re-run when user.id changes

  return socketRef.current;
};
