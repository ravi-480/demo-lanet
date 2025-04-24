import React from "react";

const loading = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="animate-spin rounded-full h-15 w-15 border-t-2 border-b-2 border-[#d4c99e]"></div>
    </div>
  );
};

export default loading;
