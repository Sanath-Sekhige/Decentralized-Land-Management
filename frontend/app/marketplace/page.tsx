'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { MapPin, ShoppingCart, Loader2 } from 'lucide-react'
import Link from 'next/link'
import AuthHeader from '@/components/auth-header'

// --- BACKEND IMPORTS ---
import { ethers } from 'ethers'
import { 
  LAND_REGISTRY_ADDRESS, 
  LAND_REGISTRY_ABI,
  MARKETPLACE_ADDRESS, 
  MARKETPLACE_ABI 
} from '@/lib/constants'

export default function MarketplacePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [buyingId, setBuyingId] = useState<number | null>(null) // Track buying state

  // --- 1. LOAD MARKETPLACE ITEMS ---
  const loadMarketplace = async () => {
    try {
      // Use JsonRpcProvider for fast, stable reading
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      
      const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      const landContract = new ethers.Contract(LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, provider);

      const itemCount = await marketContract.itemCount();
      let marketItems = [];

      for (let i = 1; i <= itemCount; i++) {
        const item = await marketContract.items(i);
        
        // Only show items that are NOT sold
        if (!item.sold) {
          // Get Metadata URI
          const uri = await landContract.tokenURI(item.tokenId);
          
          // Fetch from IPFS
          const response = await fetch(uri.replace("ipfs://", "http://127.0.0.1:8080/ipfs/"));
          const meta = await response.json();
          
          // Calculate Price (Wei -> ETH) including fees
          const totalPrice = await marketContract.getTotalPrice(item.itemId);

          marketItems.push({
            totalPrice, // Keep as BigNumber for transaction
            priceEth: ethers.formatEther(totalPrice),
            itemId: item.itemId,
            tokenId: item.tokenId,
            seller: item.seller,
            name: meta.name,
            location: meta.attributes[1].value,
            area: meta.attributes[2].value,
            image: meta.image.replace("ipfs://", "http://127.0.0.1:8080/ipfs/")
          });
        }
      }
      setItems(marketItems);
    } catch (error) {
      console.error("Error loading marketplace:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. BUY FUNCTION ---
  const buyItem = async (item: any) => {
    if (!window.ethereum) return alert("Please install MetaMask");
    
    try {
      setBuyingId(item.itemId); // Show loader

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

      // Send Transaction: Must send the exact 'value' required
      const tx = await marketContract.purchaseItem(item.itemId, { value: item.totalPrice });
      await tx.wait();

      alert(`Successfully bought ${item.name}!`);
      
      // Refresh the list to remove the sold item
      loadMarketplace(); 

    } catch (error: any) {
      console.error("Purchase failed:", error);
      alert("Error: " + (error.reason || error.message));
    } finally {
      setBuyingId(null);
    }
  }

  // --- 3. INIT ---
  useEffect(() => {
    loadMarketplace();
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
           if (accounts.length > 0) setWalletAddress(accounts[0])
        });
    }
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <AuthHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Browse and purchase available land parcels</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-border">Back to Dashboard</Button>
          </Link>
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="h-10 w-10 animate-spin text-accent" />
           </div>
        ) : items.length === 0 ? (
           <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
             <p>No items listed for sale right now.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.itemId} className="border-border bg-card overflow-hidden group hover:border-accent transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image"; }}
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-sm font-bold text-white border border-white/20">
                    {item.priceEth} ETH
                  </div>
                </div>
                
                <CardContent className="p-5">
                  <h3 className="text-xl font-bold text-foreground mb-1">{item.name}</h3>
                  <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {item.location}
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-3 border-t border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Area</p>
                      <p className="font-medium text-foreground">{item.area}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Seller</p>
                      <p className="font-medium text-foreground truncate" title={item.seller}>
                        {item.seller.slice(0, 6)}...{item.seller.slice(-4)}
                      </p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-5 pt-0">
                  {/* Disable Buy Button if user is the seller */}
                  {item.seller.toLowerCase() === walletAddress?.toLowerCase() ? (
                     <Button disabled className="w-full bg-muted text-muted-foreground border-border cursor-not-allowed">
                       You own this
                     </Button>
                  ) : (
                     <Button 
                       onClick={() => buyItem(item)} 
                       disabled={buyingId === item.itemId}
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                     >
                       {buyingId === item.itemId ? (
                         <Loader2 className="h-4 w-4 animate-spin mr-2" />
                       ) : (
                         <ShoppingCart className="h-4 w-4 mr-2" /> 
                       )}
                       {buyingId === item.itemId ? "Buying..." : "Buy Now"}
                     </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}