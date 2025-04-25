"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { useEffect, useState } from "react";
import ConfirmDialog from "../../Shared/ConfirmDialog";

export const AuthButtons = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    window.location.reload();
  };

  const isAuthenticated = !!user;

  if (!isClient) {
    return <div className="w-[100px] h-[40px]"></div>;
  }

  return isAuthenticated ? (
    <div className="flex items-center gap-4">
      <span className="text-white">{user?.name}</span>
      <Button
        onClick={() => {
          setOpen(true);
        }}
        className="bg-red-500 cursor-pointer hover:bg-red-600"
      >
        Logout
      </Button>

      <ConfirmDialog
        confirmText="Logout"
        cancelText="Cancel"
        title="Logout Confirmation"
        description="Are you sure you want to log out?"
        onConfirm={handleLogout}
        confirmClassName="bg-red-600 hover:bg-red-700"
        onOpenChange={setOpen}
        open={open}
      />
    </div>
  ) : (
    <Link href="/login">
      <Button className="bg-[#d4c99e] hover:bg-yellow-700 text-black">
        Login
      </Button>
    </Link>
  );
};
