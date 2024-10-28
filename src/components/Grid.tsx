"use client";

// ethers type definitions
declare global {
  interface Window {
    ethereum?: any;
  }
}

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// grid settings and target grid data (we can use in contract, backend, or frontend)
const gridSize = 5;
const targetGrid = [
  [true, false, true, true, false],
  [true, true, false, true, true],
  [false, false, true, false, false],
  [true, true, false, true, false],
  [false, true, true, false, true],
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
  const colArray: boolean[][] = Array.from({ length: cols }, () => []);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      colArray[j].push(array[i][j]);
    }
  }
  return colArray;
}

// Function to build clues for rows and columns
function buildClues(vec: boolean[][]) {
  const rowClues = vec.map((v) => buildClue(v));
  const colClues = getCols(vec).map((v) => buildClue(v));

  return { rowClues, colClues };
}

const Grid: React.FC = () => {
  const [userGrid, setUserGrid] = useState<boolean[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(false))
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(
    null
  );
  const [account, setAccount] = useState<string | null>(null);

  const { rowClues, colClues } = buildClues(targetGrid);

  const handleCellClick = (row: number, col: number) => {
    const newUserGrid = userGrid.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? !cell : cell
      )
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
            // any ethereum interaction
            to: "",
            value: ethers.parseEther(""),
          });
          console.log("successful", tx);
        }
      } else {
        setVerificationResult("wrong solution");
      }
    } catch (error) {
      console.error("verification error", error);
      setVerificationResult("an error occurred.");
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

      {/* Wallet connect */}
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

      {/* Render grid */}
      {account && (
        <>
          {/* Clues */}
          <div
            className="grid"
            style={{ gridTemplateColumns: `50px repeat(${gridSize}, 50px)` }}
          >
            <div />
            {colClues.map((colHint, index) => (
              <div
                key={index}
                className="flex justify-center font-medium text-lime-200 text-xs"
              >
                {colHint.join(" ")}
              </div>
            ))}
          </div>

          {/* Row clues */}
          <div className="flex">
            <div className="flex flex-col gap-1 mr-1">
              {rowClues.map((rowHint, index) => (
                <div
                  key={index}
                  className="flex justify-end pr-2 font-medium text-lime-200 text-xs h-12"
                >
                  {rowHint.join(" ")}
                </div>
              ))}
            </div>

            {/* Grid */}
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
            submit
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

// Call the buildClues function to initialize row and column clues
const { rowClues, colClues } = buildClues(targetGrid);

//refactored code

/*

"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Cell from "./Cell";
import Clue from "./Clue";

const gridSize = 5;
const targetGrid = [
  [true, false, true, true, false],
  [true, true, false, true, true],
  [false, false, true, false, false],
  [true, true, false, true, false],
  [false, true, true, false, true],
];

const buildClue = (array: boolean[]): number[] => {
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
};

const getCols = (array: boolean[][]): boolean[][] => {
  const cols = array[0].length;
  const rows = array.length;
  const colArray: boolean[][] = Array.from({ length: cols }, () => []);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      colArray[j].push(array[i][j]);
    }
  }
  return colArray;
};

const buildClues = (vec: boolean[][]) => {
  const rowClues = vec.map((v) => buildClue(v));
  const colClues = getCols(vec).map((v) => buildClue(v));

  return { rowClues, colClues };
};

const Grid: React.FC = () => {
  const [userGrid, setUserGrid] = useState<boolean[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(false))
  );
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [account, setAccount] = useState<string | null>(null);

  const { rowClues, colClues } = buildClues(targetGrid);

  const handleCellClick = (row: number, col: number) => {
    const newUserGrid = userGrid.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) =>
        rowIndex === row && colIndex === col ? !cell : cell
      )
    );
    setUserGrid(newUserGrid);
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(accounts[0]);
      } catch (error) {
        console.error("Error while connecting:", error);
      }
    } else {
      alert("Please install MetaMask.");
    }
  };

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
        setVerificationResult("Correct solution!");

        if (typeof window.ethereum !== "undefined" && account) {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const tx = await signer.sendTransaction({
            to: "", // specify the recipient address
            value: ethers.parseEther(""), // specify the amount
          });
          console.log("Transaction successful", tx);
        }
      } else {
        setVerificationResult("Wrong solution");
      }
    } catch (error) {
      console.error("Verification error", error);
      setVerificationResult("An error occurred.");
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

      {!account ? (
        <button
          onClick={handleConnectWallet}
          className="mt-6 bg-lime-200 text-black font-semibold py-2 px-4 rounded-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="text-lime-200 mb-8 mt-4">
          Connected Wallet Address: {account}
        </div>
      )}

      {account && (
        <>
          <div
            className="grid"
            style={{ gridTemplateColumns: `50px repeat(${gridSize}, 50px)` }}
          >
            <div />
            {colClues.map((colHint, index) => (
              <Clue key={index} clues={colHint} />
            ))}
          </div>

          <div className="flex">
            <div className="flex flex-col gap-1 mr-1">
              {rowClues.map((rowHint, index) => (
                <Clue key={index} clues={rowHint} />
              ))}
            </div>

            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${gridSize}, 50px)` }}
            >
              {userGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Cell
                    key={`${rowIndex}-${colIndex}`}
                    isActive={cell}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  />
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-lime-200 text-black font-semibold py-2 px-4 rounded-lg"
          >
            Check Solution
          </button>

          {verificationResult && (
            <div className="mt-4 text-center font-semibold text-lime-200">
              {verificationResult}
            </div>
          )}
          {isCompleted && (
            <div className="text-center text-lime-200 font-semibold mt-6">
              You just won the game!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Grid;



// second refactoring without style

"use client";

import React, { useState, useEffect } from "react";
import { buildClues, targetGrid } from "../utils/gridUtils"; // Yardımcı fonksiyonları içe aktar
import Cell from "./Cell"; // Cell bileşenini içe aktar
import Clue from "./Clue"; // Clue bileşenini içe aktar
import { useWallet } from "../hooks/UseWallet"; // Cüzdan hook'unu içe aktar

const Grid: React.FC = () => {
  const gridSize = 5; // Grid boyutu
  const { account, connectWallet } = useWallet(); // Cüzdan bilgilerini al

  const [userGrid, setUserGrid] = useState<boolean[][]>(
    Array.from({ length: gridSize }, () => Array(gridSize).fill(false)) // Kullanıcı grid'i
  );

  const [isCompleted, setIsCompleted] = useState<boolean>(false); // Bulmacanın tamamlanma durumu
  const [verificationResult, setVerificationResult] = useState<string | null>(null); // Doğrulama sonucu durumu

  // Hedef grid'den ipuçlarını oluştur
  const { rowClues, colClues } = buildClues(targetGrid);

  // Hücre tıklama işlevi
  const handleCellClick = (row: number, col: number) => {
    const newUserGrid = userGrid.map((rowArray, rowIndex) =>
      rowArray.map((cell, colIndex) => (rowIndex === row && colIndex === col ? !cell : cell)) // Tıklanan hücreyi ters çevir
    );
    setUserGrid(newUserGrid); // Kullanıcı grid'ini güncelle
  };

  // Kullanıcı grid'ini sunucuya gönderme işlevi
  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:8000/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grid: userGrid }), // Kullanıcı grid'ini gönder
      });

      const data = await response.json(); // Sunucu yanıtını çözümle
      if (data.isCorrect) {
        setVerificationResult("Correct solution!"); // Doğru çözüm mesajı
      } else {
        setVerificationResult("Wrong solution"); // Yanlış çözüm mesajı
      }
    } catch (error) {
      console.error("Verification error:", error); // Hata durumunu konsola yaz
      setVerificationResult("An error occurred."); // Genel hata mesajı
    }
  };

  // Kullanıcı grid'inin tamamlanma kontrolü
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

      
      {!account ? (
        <button
          onClick={connectWallet}
          className="mt-6 bg-lime-200 text-black font-semibold py-2 px-4 rounded-lg"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="text-lime-200 mb-8 mt-4">
          Bağlı Cüzdan Adresi: {account}
        </div>
      )}

      
      {account && (
        <>
          
          <div
            className="grid"
            style={{ gridTemplateColumns: 50px repeat(${gridSize}, 50px) }}
          >
            <div />
            {colClues.map((colHint, index) => (
              <Clue key={index} clues={colHint} />
            ))}
          </div>

          
          <div className="flex">
            <div className="flex flex-col gap-1 mr-1">
              {rowClues.map((rowHint, index) => (
                <Clue key={index} clues={rowHint} />
              ))}
            </div>

            
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: repeat(${gridSize}, 50px) }}
            >
              {userGrid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <Cell
                    key={${rowIndex}-${colIndex}}
                    isFilled={cell}
                    onClick={() => handleCellClick(rowIndex, colIndex)}
                  />
                ))
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="mt-6 bg-lime-200 text-black font-semibold py-2 px-4 rounded-lg"
          >
            Control Solution
          </button>

          
          {verificationResult && (
            <div className="mt-4 text-center font-semibold text-lime-200">
              {verificationResult}
            </div>
          )}
          {isCompleted && (
            <div className="text-center text-lime-200 font-semibold mt-6">
              You just won the game!
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Grid;


*/
