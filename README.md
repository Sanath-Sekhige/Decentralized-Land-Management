# LandChain: Decentralized Land Management & Marketplace

LandChain is a decentralized application (dApp) designed to secure, verify, and trade land parcels as ERC-721 NFTs on the Ethereum blockchain. It prevents double-registration of land surveys using cryptographic validation and stores property records on IPFS.

---

## ⚙️ Quick Start Setup

To run the complete system locally, open separate terminal windows for each of the following components:

### 1. IPFS Daemon
Start your local IPFS node:
```bash
ipfs daemon
```

### 2. Local Blockchain (Hardhat)
Spin up the local Hardhat node:
```bash
npx hardhat node
```

### 3. Deploy Contracts
Compile and deploy the smart contracts locally:
```bash
npx hardhat run ./scripts/deploy.js --network localhost
```
*Note: Copy the contract addresses from the output and update them in [constants.ts](file:///c:/Users/cutie/OneDrive/Desktop/Decentralized-Land-Management/frontend/lib/constants.ts).*

### 4. Backend Express Server (IPFS Pinner)
Install dependencies and start the backend:
```bash
cd backend
npm install
node server.js
```

### 5. Frontend Next.js Web App
Install dependencies and run the client:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the application.
