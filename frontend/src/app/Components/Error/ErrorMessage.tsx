import React from "react";

const ErrorMessage = ({ message }: { message: string }) => {
  return (
    <div className="flex items-center justify-center min-h-[40vh] text-center">
      <div className="bg-red-100 text-red-700 p-6 rounded-xl shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;
