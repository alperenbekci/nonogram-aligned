"use client";

//ethers type definitions
declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// grid settings and target grid data(we can use in contract,backend or frontend)
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
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null
  );
  const [account, setAccount] = useState<string | null>(null);

  const handleCellClick = (row: number, col: number) => {
    const newUserGrid = userGrid.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? !cell : cell
      )
    );
    setUserGrid(newUserGrid);
  };

  // wallet connection
  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("error while connecting:", error);
      }
    } else {
      alert("install metamask.");
    }
  };

  // rust backend verification
  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8000/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ grid: userGrid }),
      });

      const data = await response.json();
      if (data.isCorrect) {
        setVerificationResult("correct solution!");

        if (typeof window.ethereum !== "undefined" && account) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tx = await signer.sendTransaction({
            //any ethereum interaction
            to: "",
            value: ethers.parseEther(""),
          });
          console.log("successfull", tx);
        }
      } else {
        setVerificationResult("wrong solution");
      }
    } catch (error) {
      console.error("verification error", error);
      setVerificationResult("an error occured.");
    }
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

      {/* wallet connect */}
      {!account ? (
        <button
          onClick={handleConnectWallet}
          className="mt-6 bg-lime-200 text-black font-semibold py-2 px-4 rounded-lg"
        >
          connect wallet
        </button>
      ) : (
        <div className="text-lime-200 mb-8 mt-4">
          Bağlı Cüzdan Adresi: {account}
        </div>
      )}

      {/* render grid*/}
      {account && (
        <>
          {/* clues */}
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

          {/*row clues */}
          <div className="flex">
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

            {/*grid */}
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

          <button
            onClick={handleSubmit}
            className="mt-6 bg-lime-200 text-black font-semibold py-2 px-4 rounded-lg"
          >
            Çözümü Kontrol Et
          </button>

          {/* verification result */}
          {verificationResult && (
            <div className="mt-4 text-center font-semibold text-lime-200">
              {verificationResult}
            </div>
          )}
          {isCompleted && (
            <div className="text-center text-lime-200 font-semibold mt-6">
              you just won the game!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Grid;
