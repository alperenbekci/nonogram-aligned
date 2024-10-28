import React from "react";

interface ClueProps {
  clues: number[];
}

const Clue: React.FC<ClueProps> = ({ clues }) => {
  return (
    <div className="flex justify-center font-medium text-lime-200 text-xs">
      {clues.join(" ")}
    </div>
  );
};

export default Clue;
