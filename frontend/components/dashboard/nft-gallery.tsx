"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, Heart, Plus } from 'lucide-react'
import LandDetailModal from "./land-detail-modal"

interface NFTGalleryProps {
  onMint?: () => void
}

export default function NFTGallery({ onMint }: NFTGalleryProps) {
  const [selectedLand, setSelectedLand] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  const mockLands = [
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
      description: "Premium location in Manhattan with excellent development potential. Perfect for commercial or residential projects.",
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
      description: "Beautiful Brooklyn Heights property with historic charm and modern amenities nearby.",
    },
    {
      id: 3,
      name: "Queens Commercial Zone",
      location: "New York, USA",
      price: "$650,000",
      area: "3,500 sq ft",
      coordinates: { lat: 40.73, lng: -74.02 },
      status: "pending" as const,
      type: "mixed-use" as const,
      listedDate: "2024-11-12",
      description: "Growing commercial zone with excellent rental income potential and future appreciation.",
    },
  ]

  const handleViewDetails = (land: any) => {
    setSelectedLand(land)
    setShowDetails(true)
  }

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-foreground">Your Land NFT Collection</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="owned" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-input border border-border">
              <TabsTrigger value="owned" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-card">
                Owned ({mockLands.length})
              </TabsTrigger>
              <TabsTrigger value="listed" className="text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-card">
                Listed (1)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="owned" className="mt-6">
              {mockLands.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mockLands.map((land) => (
                    <Card key={land.id} className="border-border overflow-hidden hover:border-purple-600/50 transition bg-background">
                      <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative overflow-hidden flex items-center justify-center">
                        <MapPin className="h-12 w-12 text-purple-400/30" />
                        <div className="absolute top-2 right-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70">
                            <Heart size={16} />
                          </Button>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded ${
                            land.status === "available" ? "bg-green-600/50 text-green-200" : "bg-yellow-600/50 text-yellow-200"
                          }`}>
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

                        <div className="flex gap-2">
                          <Button onClick={() => handleViewDetails(land)} className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-9">
                            View Details
                          </Button>
                          <Button variant="outline" className="flex-1 border-border h-9 bg-transparent">
                            Sell
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">No land NFTs yet. Mint one to get started!</p>
                  <Button onClick={onMint} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2">
                    <Plus className="h-4 w-4" /> Mint Land
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="listed" className="mt-6">
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No listed lands yet. List one from your collection!</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <LandDetailModal isOpen={showDetails} onClose={() => setShowDetails(false)} land={selectedLand} />
    </>
  )
}
