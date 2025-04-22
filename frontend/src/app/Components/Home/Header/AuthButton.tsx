"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { useEffect, useState } from "react";

export const AuthButtons = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const isAuthenticated = !!user;

  if (!isClient) {
    return <div className="w-[100px] h-[40px]"></div>;
  }

  return isAuthenticated ? (
    <div className="flex items-center gap-4">
      <span className="text-white">{user?.name}</span>
      <Button
        onClick={async () => {
          await dispatch(logout());
          window.location.reload();
        }}
        className="bg-red-500 cursor-pointer hover:bg-red-600"
      >
        Logout
      </Button>
    </div>
  ) : (
    <Link href="/login">
      <Button className="bg-[#d4c99e] hover:bg-yellow-700 text-black">
        Login
      </Button>
    </Link>
  );
};
