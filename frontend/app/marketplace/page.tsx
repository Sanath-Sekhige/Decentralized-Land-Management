'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MapPin, ShoppingCart, Loader2, CheckCircle2, X, Search, User, Ruler, FileText, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import AuthHeader from '@/components/auth-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog'

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
  const [buyingId, setBuyingId] = useState<number | null>(null) 

  // --- SEARCH & SORT STATE ---
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState('newest') // Default sort
  const [selectedItem, setSelectedItem] = useState<any>(null) 

  // --- UI FEEDBACK STATE ---
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [errorModal, setErrorModal] = useState({ show: false, message: '' })

  // --- 1. LOAD MARKETPLACE ITEMS ---
  const loadMarketplace = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, provider);
      const landContract = new ethers.Contract(LAND_REGISTRY_ADDRESS, LAND_REGISTRY_ABI, provider);

      const itemCount = await marketContract.itemCount();
      let marketItems = [];

      for (let i = 1; i <= itemCount; i++) {
        const item = await marketContract.items(i);
        
        if (!item.sold) {
          const uri = await landContract.tokenURI(item.tokenId);
          const response = await fetch(uri.replace("ipfs://", "http://127.0.0.1:8080/ipfs/"));
          const meta = await response.json();
          const totalPrice = await marketContract.getTotalPrice(item.itemId);

          marketItems.push({
            totalPrice, 
            priceEth: ethers.formatEther(totalPrice),
            itemId: item.itemId,
            tokenId: item.tokenId,
            seller: item.seller,
            name: meta.name,
            location: meta.attributes[1].value,
            area: meta.attributes[2].value, // Assuming area is a number or string number
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
    if (!window.ethereum) {
      setErrorModal({ show: true, message: "Please install MetaMask to purchase land." });
      return;
    }
    
    try {
      setBuyingId(item.itemId); 

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const marketContract = new ethers.Contract(MARKETPLACE_ADDRESS, MARKETPLACE_ABI, signer);

      const tx = await marketContract.purchaseItem(item.itemId, { value: item.totalPrice });
      await tx.wait();

      setSelectedItem(null); 
      setShowSuccessModal(true);
      loadMarketplace(); 

    } catch (error: any) {
      console.error("Purchase failed:", error);
      setErrorModal({ 
        show: true, 
        message: error.reason || error.message || "Purchase failed." 
      });
    } finally {
      setBuyingId(null);
    }
  }

  // --- 3. FILTER & SORT LOGIC ---
  const filteredItems = items
    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'price_low') {
        return parseFloat(a.priceEth) - parseFloat(b.priceEth);
      } else if (sortOrder === 'price_high') {
        return parseFloat(b.priceEth) - parseFloat(a.priceEth);
      } else if (sortOrder === 'area_large') {
        // Remove non-numeric chars from area if necessary (e.g. "1200 sq ft" -> 1200)
        const areaA = parseFloat(a.area.replace(/[^0-9.]/g, '')) || 0;
        const areaB = parseFloat(b.area.replace(/[^0-9.]/g, '')) || 0;
        return areaB - areaA;
      }
      return 0; // 'newest' (default order)
    });

  // --- 4. INIT ---
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
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Browse and purchase available land parcels</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-border">Back to Dashboard</Button>
          </Link>
        </div>

        {/* SEARCH & SORT BAR */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by Survey Number (e.g. S100)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border text-foreground placeholder-muted-foreground focus:ring-purple-500 focus:border-purple-500 w-full"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full md:w-[200px]">
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full bg-card border-border text-foreground">
                <div className="flex items-center gap-2">
                   <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                   <SelectValue placeholder="Sort By" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="newest">Newest Listed</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="area_large">Area: Largest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ITEMS GRID */}
        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="h-10 w-10 animate-spin text-accent" />
           </div>
        ) : filteredItems.length === 0 ? (
           <div className="text-center py-20 text-muted-foreground border-2 border-dashed border-border rounded-lg">
             <p>{searchQuery ? "No matching lands found." : "No items listed for sale right now."}</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <Card 
                key={item.itemId} 
                onClick={() => setSelectedItem(item)}
                className="border-border/70 bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.15)] transition-all duration-300 cursor-pointer"
              >
                {/* IMAGE SECTION */}
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image"; }}
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-sm font-bold text-white shadow-xl flex items-center gap-1">
                    <span className="text-purple-400">Ξ</span> {item.priceEth}
                  </div>
                </div>
                
                <CardContent className="p-5">
                  <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-purple-400 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-purple-500" />
                    {item.location}
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-border/30 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Click to view details</span>
                      <div className="h-6 w-6 rounded-full bg-muted/50 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <FileText className="h-3 w-3" />
                      </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* --- LAND DETAILS MODAL (Vertical Layout) --- */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="bg-card border border-border/80 shadow-2xl shadow-purple-900/20 max-w-lg overflow-hidden p-0 gap-0">
          {selectedItem && (
            <div className="flex flex-col h-full max-h-[90vh] overflow-y-auto">
              
              {/* TOP: IMAGE */}
              <div className="w-full h-64 relative bg-black shrink-0">
                <img 
                   src={selectedItem.image} 
                   alt={selectedItem.name}
                   className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white font-bold">
                   {selectedItem.priceEth} ETH
                </div>
              </div>

              {/* BOTTOM: DETAILS */}
              <div className="w-full p-6 flex flex-col gap-6">
                <div>
                  <DialogTitle className="text-2xl font-bold text-foreground mb-1">{selectedItem.name}</DialogTitle>
                  <p className="text-muted-foreground text-sm flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {selectedItem.location}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/80">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Total Area</p>
                        <div className="flex items-center gap-2">
                            <Ruler className="h-4 w-4 text-green-500" />
                            <span className="font-semibold text-foreground">{selectedItem.area}</span>
                        </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/80">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Seller</p>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-orange-500" />
                            <span className="font-semibold text-foreground truncate text-sm" title={selectedItem.seller}>
                                {selectedItem.seller.slice(0,6)}...
                            </span>
                        </div>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground bg-black/20 p-2 rounded break-all font-mono border border-border/50">
                    Seller ID: {selectedItem.seller}
                </div>

                <div className="pt-2">
                  {selectedItem.seller.toLowerCase() === walletAddress?.toLowerCase() ? (
                      <Button disabled className="w-full h-12 bg-muted text-muted-foreground border border-border">
                        You own this land
                      </Button>
                   ) : (
                      <Button 
                        onClick={() => buyItem(selectedItem)} 
                        disabled={buyingId === selectedItem.itemId}
                        className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-900/20 text-lg font-medium"
                      >
                        {buyingId === selectedItem.itemId ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-5 w-5 mr-2" /> 
                            Purchase Now
                          </>
                        )}
                      </Button>
                   )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- SUCCESS MODAL --- */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-card border border-green-500/50 shadow-2xl shadow-green-900/20 max-w-sm text-center sm:rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-6 py-4">
            <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center animate-in zoom-in duration-300">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-foreground">Purchase Successful!</DialogTitle>
              <DialogDescription className="text-muted-foreground text-center">
                Congratulations! You now own this land. It has been transferred to your wallet.
              </DialogDescription>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Link href="/dashboard" className="w-full">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium h-11">
                  View in Dashboard
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => setShowSuccessModal(false)}>
                Continue Shopping
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- ERROR MODAL --- */}
      <Dialog open={errorModal.show} onOpenChange={(open) => setErrorModal(prev => ({ ...prev, show: open }))}>
        <DialogContent className="bg-card border border-red-900/60 shadow-2xl shadow-red-900/20 max-w-sm text-center sm:rounded-2xl">
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <X className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold text-red-500">Action Failed</DialogTitle>
              <DialogDescription className="text-muted-foreground text-center break-words max-h-[200px] overflow-y-auto">
                {errorModal.message}
              </DialogDescription>
            </div>
            <Button onClick={() => setErrorModal({ show: false, message: '' })} className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}