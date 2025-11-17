'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Link from 'next/link'
import { MapPin, Search, Zap, Heart, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import LandDetailModal from '@/components/dashboard/land-detail-modal'

const MapSection = dynamic(() => import('@/components/dashboard/map-section'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-card rounded-lg flex items-center justify-center border border-border">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-6 w-6 text-accent animate-spin" />
        <p className="text-muted-foreground text-sm">Loading map...</p>
      </div>
    </div>
  ),
})

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('recently-listed')
  const [selectedLand, setSelectedLand] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  const mockListings = [
    {
      id: 1,
      name: "Manhattan Premium Parcel",
      location: "New York, USA",
      price: "$850,000",
      area: "2,500 sq ft",
      coordinates: { lat: 40.7128, lng: -74.006 },
      status: "available" as const,
      type: "commercial" as const,
      listedDate: "2024-11-15",
      description: "Prime Manhattan location with excellent development potential.",
    },
    {
      id: 2,
      name: "Brooklyn Heights Estate",
      location: "New York, USA",
      price: "$1,200,000",
      area: "5,000 sq ft",
      coordinates: { lat: 40.695, lng: -74.01 },
      status: "available" as const,
      type: "residential" as const,
      listedDate: "2024-11-10",
      description: "Beautiful Brooklyn Heights property with historic charm.",
    },
    {
      id: 3,
      name: "Queens Commercial Zone",
      location: "New York, USA",
      price: "$650,000",
      area: "3,500 sq ft",
      coordinates: { lat: 40.73, lng: -74.02 },
      status: "available" as const,
      type: "mixed-use" as const,
      listedDate: "2024-11-12",
      description: "Growing commercial zone with excellent rental income potential.",
    },
    {
      id: 4,
      name: "Downtown Residential Plot",
      location: "New York, USA",
      price: "$920,000",
      area: "2,800 sq ft",
      coordinates: { lat: 40.7, lng: -74.005 },
      status: "available" as const,
      type: "residential" as const,
      listedDate: "2024-11-08",
      description: "Modern downtown location perfect for new developments.",
    },
  ]

  const handleViewDetails = (land: any) => {
    setSelectedLand(land)
    setShowDetails(true)
  }

  return (
    <>
      <div className="min-h-screen bg-black">
        
        <header className="border-b border-border sticky top-0 z-50 bg-black/80 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
              <span className="text-xl font-bold text-foreground">LandChain</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
              <MapPin className="h-10 w-10 text-accent" /> Land Marketplace
            </h1>
            <p className="text-muted-foreground">Discover and trade verified land NFTs with geographic precision.</p>
          </div>
          <Card className="border-border bg-card mb-12 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-accent" /> Interactive Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MapSection />
            </CardContent>
          </Card>

          <Card className="border-border bg-card mb-8">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Search className="h-5 w-5 text-accent" /> Find Land
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  placeholder="Search by location, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-input border-border text-foreground placeholder-muted-foreground"
                />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="recently-listed" className="text-foreground">Recently Listed</SelectItem>
                    <SelectItem value="price-low" className="text-foreground">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="text-foreground">Price: High to Low</SelectItem>
                    <SelectItem value="oldest" className="text-foreground">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2">
                  <Search className="h-4 w-4" /> Search
                </Button>
                <Button variant="outline" className="border-border">Reset Filters</Button>
              </div>
            </CardContent>
          </Card>

       
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mockListings.map((land) => (
              <Card key={land.id} className="border-border overflow-hidden hover:border-purple-600/50 transition bg-background cursor-pointer" onClick={() => handleViewDetails(land)}>
                <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative overflow-hidden flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-purple-400/30" />
                  <div className="absolute top-2 right-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70">
                      <Heart size={16} />
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-green-600/50 text-green-200">
                      {land.status}
                    </span>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">{land.name}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin size={14} />
                        {land.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-2xl font-bold text-blue-400">{land.price}</p>
                    <p className="text-xs text-muted-foreground mt-1">{land.area}</p>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-9">
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>

      <LandDetailModal isOpen={showDetails} onClose={() => setShowDetails(false)} land={selectedLand} />
    </>
  )
}
