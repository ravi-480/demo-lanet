"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "./authSlice";
import { AppDispatch } from "./store";

const AuthInitializer = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(getCurrentUser());
  }, [dispatch]);

  return null;
};

export default AuthInitializer;
