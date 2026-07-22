# LandChain: Decentralized Land Management & Marketplace

LandChain is a decentralized application (dApp) designed to secure, verify, and trade land parcels as digital assets (NFTs) on the Ethereum blockchain. By combining smart contracts, IPFS decentralized storage, and a modern web interface, LandChain eliminates middlemen, prevents double-registration of land surveys, and provides transparent land transaction records.

---

## 🚀 Key Features

1. **Tokenized Land Assets (ERC-721)**
   * Every registered property is minted as a unique Non-Fungible Token (`LandNFT`) on the blockchain.
   * Includes decentralized metadata linking to official surveys, deeds, and images.

2. **Survey Hash Validation**
   * Built-in verification preventing the same geographic survey coordinates (cryptographically hashed) from being registered multiple times.

3. **Decentralized Storage (IPFS)**
   * Land metadata, boundary files, deeds, and maps are pinned directly to IPFS for tamper-proof and permanent availability.

4. **On-Chain Marketplace**
   * Peer-to-peer marketplace contract allowing owners to list land NFTs for sale.
   * Secure purchases with automatic transfer of ownership and automated marketplace fee distribution.

5. **Web3 Authentication**
   * Seamless login and transaction signing utilizing MetaMask.

---

## 🛠️ Tech Stack

* **Smart Contracts (Web3)**: Solidity (v0.8.19), Hardhat, OpenZeppelin (ERC721URIStorage, Ownable, ReentrancyGuard).
* **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Shadcn UI, Ethers.js, Lucide Icons.
* **Backend**: Node.js, Express, Multer, IPFS HTTP Client.
* **Storage**: IPFS (InterPlanetary File System).

---

## 📁 Repository Structure

```text
Decentralized-Land-Management/
├── contracts/               # Solidity Smart Contracts
│   ├── LandRegistry.sol     # ERC-721 land tokenization & verification
│   └── Marketplace.sol      # P2P land sales and trading contract
├── scripts/                 # Hardhat deployment & setup scripts
│   └── deploy.js            # Deploys contracts and copies ABIs to frontend
├── backend/                 # Express.js IPFS helper server
│   ├── server.js            # IPFS pinning microservice
│   └── package.json         # Backend dependencies
├── frontend/                # Next.js web application
│   ├── app/                 # Next.js app pages (Auth, Dashboard, Marketplace)
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utilities, constants, and ABIs
│   └── package.json         # Frontend dependencies
├── hardhat.config.js        # Hardhat development network configurations
└── README.md                # Project documentation
```

---

## ⚙️ Installation & Setup

### Prerequisites
* **Node.js** (v18+)
* **IPFS Daemon** (Kubo/IPFS Desktop running locally on port `5001` or another configured API endpoint)
* **MetaMask Browser Extension** (configured with a local Hardhat network profile)

---

### Step-by-Step Execution Guide

To run the complete system locally, open separate terminal windows for each of the following components:

#### 1. IPFS Daemon
Start your local IPFS node so files can be uploaded and pinned.
```bash
ipfs daemon
```

#### 2. Local Hardhat Node
Spin up a local Ethereum network node containing 20 test accounts pre-funded with 10000 ETH.
```bash
npx hardhat node
```

#### 3. Deploy Smart Contracts
Compile and deploy the smart contracts to the local network, saving the contract ABIs directly to the frontend directory:
```bash
npx hardhat run ./scripts/deploy.js --network localhost
```
*Note: Make sure to copy the deployed contract addresses from the console output and paste them into [constants.ts](file:///c:/Users/cutie/OneDrive/Desktop/Decentralized-Land-Management/frontend/lib/constants.ts).*

#### 4. Backend IPFS Pinner
Navigate to the backend directory, install dependencies, and start the Express server:
```bash
cd backend
npm install
node server.js
```
The server will start listening at `http://localhost:4001`.

#### 5. Frontend Development Server
Navigate to the frontend directory, install dependencies, and run the Next.js development server:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser to interact with the LandChain application.

---

## 🔒 Security Features
* **Reentrancy Protection**: The marketplace uses OpenZeppelin's `ReentrancyGuard` to protect funds during property trades.
* **Ownership Integrity**: Restricts critical administrative functions using OpenZeppelin's `Ownable` pattern.
* **Immutable Surveys**: Once a survey hash is registered, it cannot be edited or duplicated, ensuring trust in land boundary documentation.
