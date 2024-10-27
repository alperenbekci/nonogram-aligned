"use client";

// app/components/Grid.tsx
import React, { useState, useEffect } from "react";

const gridSize = 5;

const targetGrid = [
  [true, false, true, true, false],
  [true, true, false, true, true],
  [false, false, true, false, false],
  [true, true, false, true, false],
  [false, true, true, false, true],
];

const rowHints = [[1, 2], [2, 2], [1], [2, 1], [2, 1]];
const colHints = [
  [2, 1],
  [1, 2],
  [1, 1, 1],
  [2, 1],
  [1, 1],
];

const Grid: React.FC = () => {
  const [userGrid, setUserGrid] = useState(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(false))
  );
  const [isCompleted, setIsCompleted] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    const newUserGrid = userGrid.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) => {
        if (rowIndex === row && colIndex === col) {
          return !cell;
        }
        return cell;
      })
    );
    setUserGrid(newUserGrid);
  };

  useEffect(() => {
    const isSolved = userGrid.every((row, rowIndex) =>
      row.every((cell, colIndex) => cell === targetGrid[rowIndex][colIndex])
    );
    setIsCompleted(isSolved);
  }, [userGrid]);

  return (
    <div className="flex flex-col items-center p-6 bg-[#2c2c2e] rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-neutral-200">
        Nonogram Game
      </h1>

      {/* Grid ve İpuçları */}
      <div className="flex flex-col items-center">
        {/* Sütun ipuçları */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `50px repeat(${gridSize}, 50px)` }}
        >
          <div />
          {colHints.map((colHint, index) => (
            <div
              key={index}
              className="flex justify-center font-medium text-lime-200 text-xs"
            >
              {colHint.join(" ")}
            </div>
          ))}
        </div>

        {/* Satır ipuçları ve oyun grid'i */}
        <div className="flex">
          {/* Satır ipuçları */}
          <div className="flex flex-col gap-1 mr-1">
            {rowHints.map((rowHint, index) => (
              <div
                key={index}
                className="flex justify-end pr-2 font-medium text-lime-200 text-xs h-12"
              >
                {rowHint.join(" ")}
              </div>
            ))}
          </div>

          {/* Oyun grid'i */}
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${gridSize}, 50px)` }}
          >
            {userGrid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`w-12 h-12 border-2 border-neutral-800 rounded-md transition-colors duration-100 ${
                    cell ? "bg-lime-200" : "bg-[#3a3a3c]"
                  } cursor-pointer`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Oyun tamamlanma durumu */}
      {isCompleted && (
        <div className="text-center text-lime-200 font-semibold mt-6">
          Tebrikler! Oyunu tamamladınız!
        </div>
      )}
    </div>
  );
};

export default Grid;
