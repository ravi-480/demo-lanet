import React from "react";
import LoadSpinner from "../Shared/LoadSpinner";

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading evdfdfdents...",
}) => {
  return <LoadSpinner />;
};

export default LoadingState;
