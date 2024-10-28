import React from "react";

interface CellProps {
  isActive: boolean;
  onClick: () => void;
}

const Cell: React.FC<CellProps> = ({ isActive, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`w-12 h-12 border-2 border-neutral-800 rounded-md transition-colors duration-100 ${
        isActive ? "bg-lime-200" : "bg-[#3a3a3c]"
      } cursor-pointer`}
    />
  );
};

export default Cell;
