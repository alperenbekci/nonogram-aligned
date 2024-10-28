// src/utils/gridUtils.ts

export const targetGrid = [
  [true, false, false, true, false],
  [false, true, true, false, true],
  [true, false, true, false, false],
  [false, true, false, true, true],
  [false, false, false, false, false],
];

// İpucu oluşturma işlemi
export const buildClues = (grid: boolean[][]) => {
  const rowClues: number[][] = grid.map((row) => {
    const clues: number[] = [];
    let count = 0;
    for (const cell of row) {
      if (cell) {
        count++;
      } else {
        if (count > 0) clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    return clues;
  });

  const colClues: number[][] = grid[0].map((_, colIndex) => {
    const clues: number[] = [];
    let count = 0;
    for (const row of grid) {
      if (row[colIndex]) {
        count++;
      } else {
        if (count > 0) clues.push(count);
        count = 0;
      }
    }
    if (count > 0) clues.push(count);
    return clues;
  });

  return { rowClues, colClues }; // İpucu dizilerini döndür
};
