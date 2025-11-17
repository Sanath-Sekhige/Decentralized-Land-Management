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
import { create } from 'ipfs-http-client'
import { Buffer } from 'buffer'
import { LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI } from '@/lib/constants'

// Initialize IPFS Client (Local Daemon)
const client = create({ url: "http://127.0.0.1:5001/api/v0" });

export default function DashboardPage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [ethBalance, setEthBalance] = useState<string>('0.00')
  const [copied, setCopied] = useState(false)
  const [showMintModal, setShowMintModal] = useState(false)
  
  // --- STATE UPDATES ---
  const [mintData, setMintData] = useState({ name: '', location: '', area: '' })
  const [file, setFile] = useState<File | null>(null) // State for Image
  const [isMinting, setIsMinting] = useState(false)   // Loading State

  useEffect(() => {
    checkMetaMaskConnection()
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

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
    }
  }

  // --- UPDATED FETCH BALANCE FUNCTION (Direct RPC) ---
  const fetchEthBalance = async (address: string) => {
    try {
      // Connect directly to Hardhat Node (http://127.0.0.1:8545)
      // This bypasses MetaMask's cache to get the REAL balance
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const balance = await provider.getBalance(address);
      
      // Format Wei to ETH
      const balanceInEth = ethers.formatEther(balance);
      
      setEthBalance(parseFloat(balanceInEth).toFixed(4));
    } catch (error) {
      console.error('RPC fetch failed, falling back to wallet:', error);
      // Fallback to MetaMask if the direct connection fails
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const balance = await provider.getBalance(address);
        setEthBalance(parseFloat(ethers.formatEther(balance)).toFixed(4));
      } catch (fallbackError) {
         console.error('Fallback failed:', fallbackError);
      }
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

  // --- MINTING LOGIC ---
  const handleMint = async () => {
    // 1. Validation
    if (!mintData.name || !mintData.location || !mintData.area || !file) {
      alert('Please fill all fields and upload an image.')
      return
    }

    setIsMinting(true)

    try {
      // 2. Get Signer (User's Wallet)
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      // 3. Upload Image to IPFS
      console.log("Uploading image to IPFS...")
      const imageAdded = await client.add(file)
      const imageCid = imageAdded.path

      // 4. Create Metadata JSON
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

      // 5. Upload Metadata to IPFS
      console.log("Uploading metadata...")
      const metaAdded = await client.add(Buffer.from(metadata))
      const metaCid = metaAdded.path

      // 6. Interact with Blockchain
      console.log("Minting on Blockchain...")
      const contract = new ethers.Contract(LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, signer)
      
      // Create a unique hash for the survey number
      const surveyHash = ethers.id(mintData.name)

      // Call the smart contract
      const tx = await contract.mintLand(`ipfs://${metaCid}`, surveyHash)
      await tx.wait() // Wait for transaction to finish

      alert('Land Minted Successfully!')
      
      // 7. Reset Form
      setShowMintModal(false)
      setMintData({ name: '', location: '', area: '' })
      setFile(null)
      window.location.reload() // Reload to see the new asset

    } catch (error: any) {
      console.error(error)
      alert('Minting Failed: ' + (error.reason || error.message))
    } finally {
      setIsMinting(false)
    }
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
      {/* Header */}
      <AuthHeader />

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome to Your Dashboard</h1>
          <p className="text-muted-foreground">Manage your land NFTs and view your portfolio performance</p>
        </div>

        {/* Quick Stats */}
        <div className="mb-12">
          <QuickStats stats={{
            myAssets: 3,
            totalValue: '$2.7M',
            growth: '+24.5%',
            transactions: 48
          }} />
        </div>

        {/* Wallet Info Cards */}
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
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  )}
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

        {/* Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Button onClick={() => setShowMintModal(true)} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 text-lg px-8 gap-2">
            <Plus className="h-5 w-5" /> Mint New Land
          </Button>
          <Button variant="outline" className="h-12 text-lg px-8 gap-2 border-border">
            <MapPin className="h-5 w-5" /> Browse Marketplace
          </Button>
        </div>

        {/* NFT Gallery */}
        <NFTGallery onMint={() => setShowMintModal(true)} />
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

            {/* --- IMAGE INPUT SECTION --- */}
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
                {isMinting ? (
                  <>Processing...</>
                ) : (
                  <><Plus className="h-4 w-4 mr-2" /> Mint Now</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
     
    </div>
  )
}