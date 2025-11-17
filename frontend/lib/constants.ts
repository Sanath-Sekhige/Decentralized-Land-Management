// frontend/lib/constants.ts

// These imports work because your deploy script saved the JSON files to lib/abis
import LandRegistry from './abis/LandRegistry.json';
import Marketplace from './abis/Marketplace.json';

export const LAND_REGISTRY_ABI = LandRegistry.abi;
export const MARKETPLACE_ABI = Marketplace.abi;

// 🔴 STEP 3: PASTE YOUR TERMINAL ADDRESSES HERE
export const LAND_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
export const MARKETPLACE_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";