import { AppDispatch, RootState } from "@/store/store";
import { Socket, io } from "socket.io-client";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { INotification } from "@/Types/type";
import { addNotification } from "@/store/notificationSlice";

export const useSocket = () => {
  const dispatch = useDispatch<AppDispatch>();
  const socketRef = useRef<Socket | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
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

    socket.on("reconnect_attempt",(attempt)=>{
      
    })

    socket.on("connect", () => {
      console.log(" Socket connected:", socket.id);

      if (user?.id) {
        socket.emit("authenticate", user.id);
        console.log(" Authenticated user:", user.id);
      }
    });

    socket.on("new-notification", (notification: any) => {
      console.log(" New notification:", notification);
      dispatch(addNotification(notification));
    });

    socket.on("connect_error", (err) => {
      console.log("Socket connection error:", err);
    });

    return () => {
      socket.off("new-notification");
      socket.disconnect();
    };
  }, [user?.id, dispatch]);

  return socketRef.current;
};
