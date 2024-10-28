"use client";

// ethers type definitions
declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { deepEqual } from "@/utils/comp";
import {
  ProvingSystemId,
  getAligned,
  Option,
  VerificationData,
} from "aligned-ts";

// grid settings and target grid data (we can use in contract, backend, or frontend)
const gridSize = 5;
//  [
//   [true, false, true, true, false],
//   [true, true, false, true, true],
//   [false, false, true, false, false],
//   [true, true, false, true, false],
//   [false, true, true, false, true],
// ];

// Building row and column hints for the game
const rowHints = [[1, 2], [2, 2], [1], [2, 1], [2, 1]];
const colHints = [
  [2, 1],
  [1, 2],
  [1, 1, 1],
  [2, 1],
  [1, 1],
];

// Function to build clues based on an array
function buildClue(array: boolean[]): number[] {
  const clues: number[] = [];
  let count = 0;

  for (const cell of array) {
    if (cell) {
      count++;
    } else {
      if (count > 0) {
        clues.push(count);
        count = 0;
      }
    }
  }

  if (count > 0) {
    clues.push(count);
  }

  return clues;
}

// Function to get columns from a 2D array
function getCols(array: boolean[][]): boolean[][] {
  const cols = array[0].length;
  const rows = array.length;
  const colArray = Array.from({ length: cols }, () => []);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      colArray[j].push(array[i][j]);
    }
  }
  return colArray;
}

function buildClues(vec: boolean[][]) {
  const rowClues = vec.map((v) => buildClue(v));
  const colClues = getCols(vec).map((v) => buildClue(v));

  console.log("row clues", rowClues);
  console.log("column clues", colClues);
  return { rowClues, colClues };
}

const Grid: React.FC = () => {
  const [userGrid, setUserGrid] = useState<boolean[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(false)),
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null,
  );
  const [account, setAccount] = useState<string | null>(null);

  const handleCellClick = (row: number, col: number) => {
    const newUserGrid = userGrid.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? !cell : cell,
      ),
    );
    setUserGrid(newUserGrid);
  };

  // Wallet connection
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

  // Rust backend verification
  const handleSubmit = async () => {
    try {
      const proof = "test_files/sp1/sp1_fibonacci.proof";
      const elf = "test_files/sp1/sp1_fibonacci.elf";

      const proofGeneratorAddress =
        "0x66f9664f97F2b50F62D13eA064982f936dE76657";
      const wallet = new ethers.Wallet(
        "0x7d2647ad2e1f6c1dce5abe2b5c3b9c8ecfe959e40b989d531bbf6624ff1c62df",
      );

      const response = await fetch("http://localhost:3000/create_proof", {
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
            // any ethereum interaction
            to: "",
            value: ethers.parseEther(""),
          });
          console.log("successful", tx);
        }
      } else {
        setVerificationResult("wrong solution");
      }

      let sp1Data: VerificationData = {
        provingSystem: ProvingSystemId.SP1, // the proving system, in this case SP1
        proof, // the proof
        publicInput: Option.None, // no public input in this case
        verificationKey: Option.None, // no verification key in this case
        vmProgramCode: Option.from(elf), // the vm program code (ELF)
        proofGeneratorAddress, // the proof generator address
      };

      const Alignment = getAligned();

      const alignedData = await Alignment.submit(sp1Data, wallet);
      console.log(alignedData);
    } catch (error) {
      console.error("verification error", error);
      setVerificationResult("an error occurred.");
    }
  };

  useEffect(() => {
    if (
      deepEqual(buildClues(userGrid), {
        rowClues: rowHints,
        colClues: colHints,
      })
    ) {
      setIsCompleted(true);
    }
  }, [userGrid]);

  return (
    <div className="flex flex-col items-center p-6 bg-[#2c2c2e] rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold mb-6 text-neutral-200">
        Nonogram Game
      </h1>

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

      {account && (
        <>
          <div className="flex gap-11">
            <div />
            {colHints.map((colHint, index) => (
              <div
                key={index}
                className="flex flex-col justify-center font-medium text-lime-200 text-xs"
              >
                {colHint.map((i, index) => (
                  <span key={index}>{i}</span>
                ))}
              </div>
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col gap-1 mr-1">
              {rowHints.map((rowHint, index) => (
                <div
                  key={index}
                  className="flex pr-2 justify-center items-center font-medium text-lime-200 text-xs h-12"
                >
                  {rowHint.join(" ")}
                </div>
              ))}
            </div>

            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 50px)` }}
            >
              {userGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                    className={`w-12 h-12 border-2 border-neutral-800 rounded-md transition-colors duration-100 ${cell ? "bg-lime-200" : "bg-[#3a3a3c]"} cursor-pointer`}
                  />
                )),
              )}
            </div>
          </div>

          <button
            disabled={isCompleted}
            onClick={handleSubmit}
            className="cursor-pointer mt-6 hover:bg-lime-400 bg-lime-200 text-black font-semibold py-2 px-4 rounded-lg"
          >
            Çözümü Kontrol Et
          </button>

          {/* Verification result */}
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
