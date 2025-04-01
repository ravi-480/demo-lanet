"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Bell, Calendar, User, X } from "lucide-react";
import { AuthButtons } from "./AuthButton";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { logout } from "@/store/authSlice";

const Header = () => {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const toggleUserModal = () => {
    setIsUserModalOpen(!isUserModalOpen);
  };
  const isAuthenticated = !!user;
  return (
    <header className="w-full sticky top-0 h-16 z-30 shadow-sm bg-black text-amber-50">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Calendar className="h-6 w-6 text-primary-500 mr-2" />
          <span className="text-xl font-bold">EventWise</span>
        </Link>

        <nav className="hidden md:flex md:space-x-8">
          <Link
            href="/dashboard"
            className="hover:text-primary-600 hover:text-amber-500 px-1 py-5 text-sm font-medium"
          >
            Dashboard
          </Link>
          <Link
            href="/events"
            className="hover:text-primary-600 hover:text-amber-500 px-1 py-5 text-sm font-medium"
          >
            Events
          </Link>
          <Link
            href="/contact"
            className="hover:text-primary-600 hover:text-amber-500 px-1 py-5 text-sm font-medium"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center">
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full cursor-pointer hover:bg-gray-200">
              <Bell size={20} className="text-gray-600" />
            </button>
            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-full"
                onClick={toggleUserModal}
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 cursor-pointer flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
              </button>
            </div>
          </div>
          <AuthButtons />
        </div>
      </div>

      {isUserModalOpen && (
        <>
          {/* Modal */}
          <div className="fixed top-16 right-0 w-50 bg-white shadow-lg z-50 mr-5 rounded-lg">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-medium text-gray-800">
                User Profile
              </h2>
              <button
                onClick={toggleUserModal}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <X size={16} className="text-gray-600 cursor-pointer" />
              </button>
            </div>
            <div className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User size={16} className="text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                </div>
              </div>
              <nav className="flex flex-col space-y-1">
                <Link
                  href="/profile"
                  className="block px-2 py-1 rounded hover:bg-gray-100 text-gray-800 text-sm"
                >
                  My Profile
                </Link>

                {isAuthenticated ? (
                  <Link
                    href="/"
                    className="block px-2 py-1 rounded hover:bg-gray-100 text-gray-800 text-sm"
                    onClick={() => dispatch(logout())}
                  >
                    Logout
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="block px-2 py-1 rounded hover:bg-gray-100 text-gray-800 text-sm"
                    onClick={() => dispatch(logout())}
                  >
                    Login
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
