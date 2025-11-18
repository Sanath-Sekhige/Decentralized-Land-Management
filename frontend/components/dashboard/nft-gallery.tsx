import { useState } from 'react' // Import useState
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Plus } from 'lucide-react'

interface NFTGalleryProps {
  onMint: () => void;
  items: any[];
  loading: boolean;
  onSell: (id: number) => void;
}

export default function NFTGallery({ onMint, items = [], loading, onSell }: NFTGalleryProps) {
  const [activeTab, setActiveTab] = useState<'Owned' | 'Listed'>('Owned'); // State for tabs

  // Filter items based on the active tab
  const filteredItems = items.filter(item => item.status === activeTab);
  
  // Calculate counts for the buttons
  const ownedCount = items.filter(i => i.status === 'Owned').length;
  const listedCount = items.filter(i => i.status === 'Listed').length;

  if (loading) {
    return <div className="text-center py-20 text-muted-foreground animate-pulse">Loading your digital assets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Land NFT Collection</h2>
        <div className="bg-card border border-border rounded-lg p-1 flex">
          {/* OWNED TAB BUTTON */}
          <button 
            onClick={() => setActiveTab('Owned')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'Owned' 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Owned ({ownedCount})
          </button>

          {/* LISTED TAB BUTTON */}
          <button 
            onClick={() => setActiveTab('Listed')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === 'Listed' 
                ? "bg-accent text-accent-foreground" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Listed ({listedCount})
          </button>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        // EMPTY STATE (Dynamic Message)
        <Card className="border-dashed border-2 border-border bg-card/50 h-[300px] flex flex-col items-center justify-center text-center">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="h-12 w-12 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {activeTab === 'Owned' ? "No unlisted lands found" : "No listed lands found"}
            </h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              {activeTab === 'Owned' 
                ? "You don't have any lands ready to sell. Mint a new one!" 
                : "You haven't listed any properties for sale yet."}
            </p>
            {activeTab === 'Owned' && (
              <Button onClick={onMint} className="bg-accent hover:bg-accent/90 text-white">
                <Plus className="h-4 w-4 mr-2" /> Mint First Land
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        // DATA STATE
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <Card key={index} className="border-border bg-card overflow-hidden group hover:border-accent transition-all">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=No+Image"; }}
                />
                <div className={`absolute top-3 left-3 backdrop-blur-md px-2 py-1 rounded text-xs font-medium border ${
                  item.status === 'Listed' 
                    ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50"
                    : "bg-green-500/20 text-green-400 border-green-500/50"
                }`}>
                  {item.status}
                </div>
              </div>
              
              <CardContent className="p-5">
                <h3 className="text-xl font-bold text-foreground mb-1">{item.name}</h3>
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {item.location || "Unknown"}
                </div>
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Area</p>
                    <p className="font-medium text-foreground">{item.area || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Token ID</p>
                    <p className="font-medium text-foreground">#{item.id.slice(0,6)}...</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-5 pt-0 gap-3">
                <Button className="flex-1 bg-accent hover:bg-accent/90 text-white">
                  View Details
                </Button>
                {item.status === 'Owned' ? (
                  <Button variant="outline" className="flex-1 border-border" onClick={() => onSell(item.id)}>
                    Sell Land
                  </Button>
                ) : (
                  <Button disabled variant="secondary" className="flex-1">
                    Listed
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}