"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import { useEffect, useState } from "react";
import ConfirmDialog from "../../Shared/ConfirmDialog";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/store/store";

export const AuthButtons = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [isClient, setIsClient] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logout());
      router.push("/");
    } catch (error) {
      console.log("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!isClient) {
    return <div className="w-[100px] h-[40px]"></div>;
  }

  return isAuthenticated ? (
    <div className="flex items-center gap-4">
      <span className="text-white">{user?.name}</span>
      <Button
        onClick={() => setOpen(true)}
        className="bg-red-500 cursor-pointer hover:bg-red-600"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Logging out..." : "Logout"}
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
      <Button className="bg-indigo-600 hover:bg-indigo-700 text-white duration-400 ease-in">
        Login
      </Button>
    </Link>
  );
};
