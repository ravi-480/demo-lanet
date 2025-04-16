"use client";
import Link from "next/link";
import { Bell, Calendar, User } from "lucide-react";
import { AuthButtons } from "./AuthButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";
import NotificationLoader from "@/store/NotificationLoader";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items, loading, error } = useSelector(
    (state: RootState) => state.notification
  );

  const isAuthenticated = !!user;

  // Calculate unread notifications count
  const unreadCount = items?.filter((n) => n.status === "unread").length || 0;

  const handleMarkAllAsRead = async () => {
    const userId = items[0].userId;
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/mark-all-read`,
        { userId }
      );
    } catch (error) {
      console.log("Failed to mark all as read", error);
    }
  };

  return (
    <header className="w-full sticky top-0 h-16 z-30 shadow-sm bg-sky-950">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Calendar className="h-6 w-6 text-primary-500 mr-2" />
          <span className="text-xl font-bold">EventWise</span>
        </Link>

        <nav className="hidden md:flex md:space-x-8">
          <Link
            href="/dashboard"
            className="hover:text-primary-600 hover:text-amber-200 px-1 py-5 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/events"
            className="hover:text-primary-600 hover:text-amber-200 px-1 py-5 text-sm font-medium"
          >
            Events
          </Link>
        </nav>

        <div className="flex items-center">
          {user?.id && <NotificationLoader />}

          <div className="flex items-center space-x-4">
            <Popover>
              <PopoverTrigger asChild>
                <button className="p-2 rounded-full cursor-pointer hover:bg-gray-700 text-white relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-medium text-gray-800">Notifications</h3>
                  <p
                    onClick={handleMarkAllAsRead}
                    className="text-cyan-600 cursor-pointer"
                  >
                    mark all as read
                  </p>
                </div>

                <ScrollArea className="h-80">
                  <div className="p-2">
                    {loading && (
                      <p className="text-center py-4 text-gray-600">
                        Loading...
                      </p>
                    )}

                    {error && (
                      <p className="text-center text-red-500 py-4">
                        Error loading notifications
                      </p>
                    )}

                    {!loading && !error && (!items || items.length === 0) && (
                      <p className="text-center text-gray-500 py-4">
                        No notifications
                      </p>
                    )}

                    {!loading &&
                      items &&
                      items.map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-3 border-b border-gray-100 hover:bg-gray-50 ${
                            notification.status === "unread" ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="font-medium text-gray-800">
                            {notification.type}
                          </p>
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(notification.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 p-2 rounded-full">
                  <div className="w-8 h-8 rounded-full bg-gray-200 cursor-pointer flex items-center justify-center">
                    <User size={16} className="text-gray-600" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>User Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user && (
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">{user.name}</div>
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  {isAuthenticated ? (
                    <Link href="/" onClick={() => dispatch(logout())}>
                      Logout
                    </Link>
                  ) : (
                    <Link href="/login">Login</Link>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <AuthButtons />
        </div>
      </div>
    </header>
  );
};

export default Header;
