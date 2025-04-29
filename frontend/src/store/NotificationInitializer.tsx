"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useSocket } from "@/hooks/useSocket";
import NotificationLoader from "./NotificationLoader";

const NotificationInitializer = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  const socket = useSocket();

  useEffect(() => {
    console.log("NotificationInitializer mounted");

    return () => {
      console.log("NotificationInitializer unmounted");
    };
  }, []);

  if (!user?.id) {
    return null;
  }

  return <NotificationLoader />;
};

export default NotificationInitializer;
