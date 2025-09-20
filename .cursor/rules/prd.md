# Product Requirements Document: Pop Komodo

## 1. Overview

Pop Komodo is a simple, massively multiplayer on-chain clicking game designed to showcase the high-throughput capabilities of the Monad blockchain. Users connect their wallets, choose a team (Ethereum, Bitcoin, or Monad), and click a Komodo dragon to add points to their team's score. Each click is a blockchain transaction.

## 2. Objective

The primary goal is to win the Monad Blitz hackathon by creating a compelling and functional demonstration of Monad's superior speed and low transaction costs compared to other blockchains. The application should be fun, engaging, and clearly illustrate the "one click = one transaction" concept.

## 3. User Flow

1.  **Visit Site**: The user navigates to the Pop Komodo web app.
2.  **Connect Wallet**: The user is prompted to connect their crypto wallet (e.g., MetaMask).
3.  **Choose Team**: After connecting, the user must select one of three teams: Ethereum, Bitcoin, or Monad. This choice is stored on-chain and is permanent for their wallet address.
4.  **Pop the Komodo**: The user clicks the main Komodo image. Each click initiates a transaction on the Monad testnet, incrementing their chosen team's score by one.
5.  **View Leaderboard**: The user can see the total scores for all three teams update in real-time on the screen.

## 4. Functional Requirements

### Wallet Connection

- The application must allow users to connect with standard EVM-compatible wallets.
- The UI should clearly display the connection status and the user's wallet address.

### Team Selection

- Once a wallet is connected, the user must be presented with a one-time choice of three teams.
- The user's team affiliation must be recorded in the smart contract.
- The interface should prevent a user from clicking/popping until they have chosen a team.

### "Pop" Mechanic

- The core of the game is an image of a Komodo dragon that users can click (on desktop) or tap (on mobile).
- Each click/tap calls a function in the smart contract which increments the score for the user's chosen team.

### Real-time Leaderboard

- The UI must display the total "pop" count for each of the three teams.
- These scores must update in near real-time as new `pop` transactions are confirmed on the blockchain.

## 5. Recommended Tech Stack

### Smart Contract

- **Development Environment**: `Hardhat` 👷
- **Language**: `Solidity`
- **IDE**: `Cursor` (or any VS Code based editor)

### Wallet Connection

- **Library**: `RainbowKit` + `wagmi`

### Frontend

- **Framework**: `Vite` (with React)
- **Language**: `TypeScript`
- **Styling**: `Tailwind CSS`
- **Blockchain Interaction**: `Viem`
