"use client";

const LoadSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4c99e]"></div>
    </div>
  );
};

export default LoadSpinner;
