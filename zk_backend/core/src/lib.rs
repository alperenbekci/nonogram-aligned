use ndarray::{iter::Lanes, ArrayView1, Ix1};
use ndarray::{Array1, Array2};
use serde::{Deserialize, Serialize};

fn build_clue(row: ArrayView1<u8>) -> Vec<usize> {
    let mut clue: Vec<usize> = Vec::new();

    row.into_iter()
        .cloned()
        .collect::<Vec<u8>>()
        .split(|cell| *cell == 0u8)
        .for_each(|segment| {
            if !segment.is_empty() {
                clue.push(segment.len());
            }
        });

    clue
}

fn build_clues(grid: Lanes<u8, Ix1>) -> Array1<Vec<usize>> {
    grid.into_iter().map(build_clue).collect()
}

#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct Clue {
    pub row_segments: Array1<Vec<usize>>,
    pub column_segments: Array1<Vec<usize>>,
}

impl Clue {
    pub fn generate_clues(completed_grid: Array2<u8>) -> Clue {
        Clue {
            row_segments: build_clues(completed_grid.rows()),
            column_segments: build_clues(completed_grid.columns()),
        }
    }
}
