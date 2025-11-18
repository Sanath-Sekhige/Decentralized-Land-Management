'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle as DTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Wallet, MapPin, Plus, Copy, CheckCircle2, UploadCloud } from 'lucide-react'
import QuickStats from '@/components/dashboard/quick-stats'
import NFTGallery from '@/components/dashboard/nft-gallery'
import { AuthForm } from '@/components/auth/auth-form'
import AuthHeader from '@/components/auth-header'

// --- BACKEND IMPORTS ---
import { ethers } from 'ethers'
import { Buffer } from 'buffer'
import { 
  LAND_REGISTRY_ADDRESS, 
  LAND_REGISTRY_ABI,
  MARKETPLACE_ADDRESS, 
  MARKETPLACE_ABI 
} from '@/lib/constants'

export default function DashboardPage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string>('0.00')
  const [copied, setCopied] = useState(false)
  const [showMintModal, setShowMintModal] = useState(false)
  
  // --- STATE UPDATES ---
  const [mintData, setMintData] = useState({ name: '', location: '', area: '' })
  const [file, setFile] = useState<File | null>(null) 
  const [isMinting, setIsMinting] = useState(false)
  
  // --- FETCHING STATE ---
  const [myLands, setMyLands] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkMetaMaskConnection()
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  // Trigger fetch when wallet connects
  useEffect(() => {
    if (walletConnected && walletAddress) {
      loadMyLands();
    }
  }, [walletConnected, walletAddress]);

  const checkMetaMaskConnection = async () => {
    if (typeof window === 'undefined') return
    if (!(window as any).ethereum) return

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_accounts',
      })
      if (accounts && accounts.length > 0) {
        setWalletConnected(true)
        setWalletAddress(accounts[0])
        await fetchEthBalance(accounts[0])
      }
    } catch (error) {
      console.error('Error checking MetaMask connection:', error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setWalletConnected(true)
      setWalletAddress(accounts[0])
      fetchEthBalance(accounts[0])
    } else {
      setWalletConnected(false)
      setWalletAddress(null)
      setMyLands([])
    }
  }

  // --- UPDATED FETCH BALANCE FUNCTION (Direct RPC) ---
  const fetchEthBalance = async (address: string) => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const balance = await provider.getBalance(address);
      const balanceInEth = ethers.formatEther(balance);
      setEthBalance(parseFloat(balanceInEth).toFixed(4));
    } catch (error) {
      console.error('RPC fetch failed, falling back to wallet:', error);
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const balance = await provider.getBalance(address);
        setEthBalance(parseFloat(ethers.formatEther(balance)).toFixed(4));
      } catch (fallbackError) {
         console.error('Fallback failed:', fallbackError);
      }
    }
  }

 // --- FINAL LOAD FUNCTION (Owned + Listed) ---
  const loadMyLands = async () => {
    if (!walletAddress) return;
    setLoading(true);
    
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const landContract = new ethers.Contract(LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, provider);
      const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      
      const loadedLands = [];

      // 1. FETCH OWNED LANDS (In your wallet)
      // We scan transfer events to find tokens you might own
      const filter = landContract.filters.Transfer(null, walletAddress);
      const events = await landContract.queryFilter(filter);
      const processedOwned = new Set();

      for (const event of events) {
         // @ts-ignore
         const tokenId = event.args[2];
         const idStr = tokenId.toString();
         if (processedOwned.has(idStr)) continue;
         processedOwned.add(idStr);

         try {
             const owner = await landContract.ownerOf(tokenId);
             if (owner.toLowerCase() === walletAddress.toLowerCase()) {
                 const uri = await landContract.tokenURI(tokenId);
                 const response = await fetch(uri.replace("ipfs://", "http://127.0.0.1:8080/ipfs/"));
                 const meta = await response.json();

                 loadedLands.push({
                    id: idStr,
                    name: meta.name,
                    location: meta.attributes[1].value,
                    area: meta.attributes[2].value,
                    image: meta.image.replace("ipfs://", "http://127.0.0.1:8080/ipfs/"),
                    status: 'Owned'
                 });
             }
         } catch (e) { console.warn(e); }
      }

      // 2. FETCH LISTED LANDS (In Marketplace contract, but You are the Seller)
      const itemCount = await marketContract.itemCount();
      
      for (let i = 1; i <= itemCount; i++) {
        const item = await marketContract.items(i);
        
        // Check if item is unsold AND you are the seller
        if (!item.sold && item.seller.toLowerCase() === walletAddress.toLowerCase()) {
            const uri = await landContract.tokenURI(item.tokenId);
            const response = await fetch(uri.replace("ipfs://", "http://127.0.0.1:8080/ipfs/"));
            const meta = await response.json();

            loadedLands.push({
                id: item.tokenId.toString(),
                name: meta.name,
                location: meta.attributes[1].value,
                area: meta.attributes[2].value,
                image: meta.image.replace("ipfs://", "http://127.0.0.1:8080/ipfs/"),
                status: 'Listed' // <--- This tags it for the "Listed" tab
            });
        }
      }
      
      setMyLands(loadedLands);
    } catch (error) {
      console.error("Error loading lands:", error);
    } finally {
      setLoading(false);
    }
  };
  // --- SELLING LOGIC ---
  const handleSell = async (tokenId: any) => {
    const priceStr = window.prompt("Enter sale price in ETH (e.g. 0.1):");
    if (!priceStr) return;

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const landContract = new ethers.Contract(LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, signer);
      const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

      // 1. Approve
      console.log("Approving...");
      alert("Step 1: Please approve Marketplace in MetaMask.");
      const tx1 = await landContract.approve(MARKETPLACE_ADDRESS, tokenId);
      await tx1.wait();

      // 2. List
      console.log("Listing...");
      alert("Step 2: Confirm listing transaction.");
      const priceWei = ethers.parseEther(priceStr);
      const tx2 = await marketContract.makeItem(LAND_REGISTRY_ADDRESS, tokenId, priceWei);
      await tx2.wait();

      alert("Land listed for sale!");
      loadMyLands(); // Refresh gallery
    } catch (error: any) {
      console.error("Sell failed:", error);
      alert("Error: " + (error.reason || error.message));
    }
  };

  // --- MINTING LOGIC ---
  const handleMint = async () => {
    if (!mintData.name || !mintData.location || !mintData.area || !file) {
      alert('Please fill all fields and upload an image.')
      return
    }

    setIsMinting(true)

    try {
      const { create } = await import('ipfs-http-client');
      const client = create({ url: "http://127.0.0.1:5001/api/v0" });

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      console.log("Uploading image...")
      const imageAdded = await client.add(file)
      const imageCid = imageAdded.path

      const metadata = JSON.stringify({
        name: `Survey ${mintData.name}`,
        description: `Property at ${mintData.location}. Area: ${mintData.area} sq ft.`,
        image: `ipfs://${imageCid}`,
        attributes: [
          { trait_type: "Survey Number", value: mintData.name },
          { trait_type: "Location", value: mintData.location },
          { trait_type: "Area", value: `${mintData.area} sq ft` }
        ]
      })

      console.log("Uploading metadata...")
      const metaAdded = await client.add(Buffer.from(metadata))
      const metaCid = metaAdded.path

      console.log("Minting...")
      const contract = new ethers.Contract(LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, signer)
      const surveyHash = ethers.id(mintData.name)

      const tx = await contract.mintLand(`ipfs://${metaCid}`, surveyHash)
      await tx.wait() 

      
      setShowMintModal(false)
      setMintData({ name: '', location: '', area: '' })
      setFile(null)
      
      // Refresh Data
      loadMyLands();
      fetchEthBalance(walletAddress!);

    } catch (error: any) {
      console.error(error)
      alert('Minting Failed: ' + (error.reason || error.message))
    } finally {
      setIsMinting(false)
    }
  }

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!walletConnected) {
    return (
      <div className="min-h-screen bg-black">
        <header className="border-b border-border sticky top-0 z-50 bg-black/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">LandChain</span>
            </Link>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-16">
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-accent" />
              <CardTitle className="text-2xl text-foreground">Connect Your Wallet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center text-sm">
                Connect your MetaMask wallet to access your dashboard and manage your land NFTs.
              </p>
              <AuthForm type="login" />
              <Link href="/">
                <Button variant="outline" className="w-full border-border">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <AuthHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">Manage your land NFTs and view your portfolio performance</p>
        </div>

        <div className="mb-12">
          <QuickStats stats={{
            myAssets: myLands.length, // Dynamic Count
            totalValue: '$2.7M',
            growth: '+24.5%',
            transactions: 48
          }} />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Wallet className="h-4 w-4" /> Wallet Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <p className="text-lg font-mono text-accent break-all">{walletAddress && formatAddress(walletAddress)}</p>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-card rounded transition-colors"
                  title={copied ? 'Copied!' : 'Copy address'}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">ETH Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{ethBalance} <span className="text-sm text-muted-foreground">ETH</span></p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <p className="text-foreground font-semibold">Connected</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Button onClick={() => setShowMintModal(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 text-lg px-8 gap-2">
            <Plus className="h-5 w-5" /> Mint New Land
          </Button>
          <Link href="/marketplace" className="flex-1">
             <Button variant="outline" className="h-12 text-lg px-8 gap-2 border-border w-full">
               <MapPin className="h-5 w-5" /> Browse Marketplace
             </Button>
          </Link>
        </div>

        <NFTGallery 
          onMint={() => setShowMintModal(true)} 
          items={myLands} 
          loading={loading}
          onSell={handleSell} // Pass the sell function
        />
      </main>

      {/* Mint Modal */}
      <Dialog open={showMintModal} onOpenChange={setShowMintModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5 text-accent" /> Mint New Land NFT
            </DTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new land NFT with geographic data
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Survey Number</label>
              <Input
                placeholder="e.g., S001"
                value={mintData.name}
                onChange={(e) => setMintData({ ...mintData, name: e.target.value })}
                className="bg-input border-border text-foreground placeholder-muted-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Location</label>
              <Input
                placeholder="e.g., New York, USA"
                value={mintData.location}
                onChange={(e) => setMintData({ ...mintData, location: e.target.value })}
                className="bg-input border-border text-foreground placeholder-muted-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Area (sq ft)</label>
              <Input
                placeholder="e.g., 2500"
                value={mintData.area}
                onChange={(e) => setMintData({ ...mintData, area: e.target.value })}
                className="bg-input border-border text-foreground placeholder-muted-foreground"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Land Image</label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {file ? file.name : "Click to upload image"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1 border-border" onClick={() => setShowMintModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleMint} 
                disabled={isMinting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isMinting ? "Processing..." : "Mint Now"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}