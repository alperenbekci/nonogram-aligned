# Nonogram Game ZK Proof Verification on Aligned Layer

## Overview

This project implements a Nonogram game using Zero-Knowledge (ZK) proofs, verified on the Aligned Layer through their Fast Mode for the Aligned Builders Hackathon. Our approach leverages ZK technology to ensure the solution's integrity without revealing the actual solution, providing a secure and private user experience.

## Project Description

In this hackathon submission, we've created a Nonogram puzzle game that integrates ZK proofs to validate solutions, allowing players to prove that they've completed the puzzle correctly without revealing their solution. The ZK proof is verified on Aligned's Layer to demonstrate the solution's validity on Ethereum’s Holesky testnet, highlighting the potential of ZK technology for privacy-focused applications in gaming.
How the Nonogram Works

A Nonogram is a logic puzzle in which cells in a grid must be colored or left blank according to numeric clues given for each row and column. The numbers indicate consecutive filled cells. For example, a clue of "3" means there are three consecutive filled cells, while "1 1" means there are two filled cells separated by at least one empty cell.

# ZK Proof Integration

In this hackathon submission, we've created a Nonogram puzzle game that integrates ZK proofs to validate solutions, allowing players to prove that they've completed the puzzle correctly without revealing their solution. The ZK proof is verified on Aligned's Layer to demonstrate the solution's validity on Ethereum’s Holesky testnet, highlighting the potential of ZK technology for privacy-focused applications in gaming.
When a player creates a Nonogram, the game generates a matrix representing the grid. ZK proofs are utilized in the following ways:

    Game Creation: When a new Nonogram is created, the system generates clues based on the matrix data. This process involves computing row and column clues, which are then packaged into a ZK proof. This proof verifies that the generated clues correspond to a valid solution without revealing the underlying matrix.

    User Solution Submission: Upon completing the puzzle, the player generates a ZK proof based on their submitted solution and the corresponding clues. This process involves:

        Proof Generation: The player uses a cryptographic library (e.g., ZoKrates or snarky) to create a proof that asserts the correctness of their solution relative to the clues. This proof ensures that:
            The solution matches the generated clues.
            The matrix data is not revealed in the proof.

        Smart Contract Interaction: The player submits only the ZK proof and a hash of the clues to the smart contract. This way, the contract can verify the proof without needing access to the original solution or matrix. The smart contract contains the logic to:
            Validate the ZK proof using Aligned’s verification system.
            Ensure that the clues match the expected format.

    Prize Distribution: Each game has a designated prize pool (e.g., 1 ETH) which is distributed to the solvers based on their submission order:
        First Solver: The first player to submit a valid proof receives a larger share, e.g., 0.5 ETH.
        Subsequent Solvers: Each subsequent valid solver receives a progressively smaller portion of the prize, e.g., 0.25 ETH for the second solver, 0.125 ETH for the third, and so on, halving the prize with each additional correct submission. This tiered distribution model incentivizes quick solutions and maintains competitive engagement among players.

    Cross-User Verification: Other users can attempt to solve the same puzzle using the clues provided. The ZK proof system allows them to verify their own solutions against the valid clues without knowing the original matrix data. The game encourages players to create a more engaging and rewarding experience through community competition.

## Background

Our team comprises developers passionate about advancing ZK technology in gaming. Leveraging Aligned's verification capabilities has been an exciting challenge, and we're committed to showcasing the potential for private proof-based gameplay using blockchain and ZK.

## Achievements

- **Functional Nonogram Game**: Developed a fully functional Nonogram game that supports ZK-based solution verification.
- **ZK Proof Integration**: Successfully integrated ZK proof generation and verification using Aligned's Fast Mode on the Holesky testnet.
- **Aligned Layer Integration**: Established a secure and efficient proof verification workflow with Aligned for game solution validation.

## Roadmap

To make this project production-ready, our roadmap includes:

1. **Enhanced User Experience**: Implement a more intuitive UI with real-time feedback for user moves.
2. **Scalability Optimization**: Increase the number of supported Nonogram puzzles and improve verification efficiency.
3. **Community Engagement**: Foster community involvement to suggest features, puzzles, and game modes.

## Technical Challenges

1. **ZK Proof Complexity**: Ensuring efficient ZK proof generation without compromising game responsiveness.
2. **Aligned Integration**: Integrating the Aligned verification process to maintain game speed and UX.
3. **Resource Optimization**: Balancing game performance and computational costs for ZK proof verification.

## Deployment Instructions

1. **Clone the Repository**: Clone this repository to your local machine.

   ```bash

   ```

## Team

Meriç Cintosun, Frontend - [Github](https://github.com/mericcintosun)
Alperen Bekçi, Frontend - [Github](https://github.com/alperenbekci)
Mehmet Göktuğ Karoğlu, Backend - [Github](https://github.com/AzrielTheHellrazor)
Ataberk Çekiç, Backend - [Github](https://github.com/UyuyanMarul)
Mertcan Çiy, Research - [Github](https://github.com/mertcanciy)
