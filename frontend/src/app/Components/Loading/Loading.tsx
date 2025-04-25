import React from "react";

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading events...",
}) => {
  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-sm p-6 mb-6 w-full">
      <div className="text-center py-12">
        <p className="text-white">{message}</p>
      </div>
    </div>
  );
};

export default LoadingState;
