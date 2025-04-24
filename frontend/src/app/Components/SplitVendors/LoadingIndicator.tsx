"use client";

export const LoadingIndicator = () => (
  <div className="flex justify-center mb-4">
    <div className="h-1 w-full bg-gray-700 overflow-hidden rounded-full">
      <div
        className="h-full bg-cyan-500 animate-pulse rounded-full"
        style={{ width: "100%" }}
      ></div>
    </div>
  </div>
);
