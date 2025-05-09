import React from "react";
import LoadSpinner from "../Shared/LoadSpinner";

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = () => {
  return <LoadSpinner />;
};

export default LoadingState;
