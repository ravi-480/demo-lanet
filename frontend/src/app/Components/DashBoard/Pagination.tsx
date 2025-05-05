import React from "react";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex justify-center items-center gap-2 md:gap-4 mt-4 ${className}`}
    >
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="secondary"
        size="sm"
        className="text-xs md:text-sm py-1 px-2 md:py-2 md:px-3"
      >
        Prev
      </Button>
      <span className="text-xs md:text-sm">
        {currentPage}/{totalPages}
      </span>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="secondary"
        size="sm"
        className="text-xs md:text-sm py-1 px-2 md:py-2 md:px-3"
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
