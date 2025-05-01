"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { setUser } from "@/store/authSlice";
import api from "@/utils/api";

// Global session cache to prevent duplicate API calls
const sessionCache = {
  promise: null as Promise<any> | null,
  resolved: false,
  pending: false,
  initialCheck: false,
};

export const checkAuthSession = async (
  dispatch: AppDispatch
): Promise<boolean> => {
  if (sessionCache.resolved) {
    return true;
  }

  if (sessionCache.pending && sessionCache.promise) {
    await sessionCache.promise;
    return sessionCache.resolved;
  }

  try {
    sessionCache.pending = true;
    sessionCache.promise = api.get("/auth/me", {
      validateStatus: (status) => status < 500,
      timeout: 5000,
    });

    const response = await sessionCache.promise;
    if (response.data?.user) {
      dispatch(setUser(response.data.user));
      sessionCache.resolved = true;
      return true;
    }
    return false;
  } catch (error) {
    console.log("Auth session check failed silently"); // Can be removed in production
    return false;
  } finally {
    sessionCache.pending = false;
    sessionCache.initialCheck = true;
  }
};

export const resetAuthSessionCache = () => {
  sessionCache.promise = null;
  sessionCache.resolved = false;
  sessionCache.pending = false;
};

export const useAuthSession = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [loading, setLoading] = useState(
    !isAuthenticated && !sessionCache.initialCheck
  );

  useEffect(() => {
    if (isAuthenticated || sessionCache.resolved) {
      setLoading(false);
      return;
    }

    // Only make the API call if we haven't already or if there isn't one in progress
    if (!sessionCache.pending) {
      checkAuthSession(dispatch).finally(() => {
        setLoading(false);
      });
    } else if (sessionCache.promise) {
      // Wait for existing promise to complete
      sessionCache.promise.finally(() => {
        setLoading(false);
      });
    }
  }, [dispatch, isAuthenticated]);

  return {
    user,
    isAuthenticated,
    loading,
  };
};
