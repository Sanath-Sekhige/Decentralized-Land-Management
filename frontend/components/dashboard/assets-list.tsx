"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Heart } from "lucide-react"

interface AssetsListProps {
  view: "my-assets" | "discover"
}

export default function AssetsList({ view }: AssetsListProps) {
  const mockAssets = [
    {
      id: 1,
      name: "Premium Manhattan Parcel",
      location: "Manhattan, NY",
      price: "$850,000",
      area: "2,500 sq ft",
      distance: "0.2km away",
      image: "/manhattan-land.jpg",
      status: "active",
    },
    {
      id: 2,
      name: "Brooklyn Heights Estate",
      location: "Brooklyn, NY",
      price: "$1,200,000",
      area: "5,000 sq ft",
      distance: "1.5km away",
      image: "/brooklyn-estate.jpg",
      status: "active",
    },
    {
      id: 3,
      name: "Queens Commercial Zone",
      location: "Queens, NY",
      price: "$650,000",
      area: "3,500 sq ft",
      distance: "3.2km away",
      image: "/queens-commercial.jpg",
      status: "pending",
    },
    {
      id: 4,
      name: "Downtown Residential Plot",
      location: "Lower Manhattan, NY",
      price: "$920,000",
      area: "2,800 sq ft",
      distance: "4.8km away",
      image: "/downtown-residential.jpg",
      status: "active",
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mockAssets.map((asset) => (
        <Card key={asset.id} className="card-dark border-border overflow-hidden hover:border-purple-600/50 transition">
          <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 relative overflow-hidden">
            <img src={asset.image || "/placeholder.svg"} alt={asset.name} className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70">
                <Heart size={16} />
              </Button>
            </div>
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded ${
                  asset.status === "active" ? "bg-green-600/50 text-green-200" : "bg-yellow-600/50 text-yellow-200"
                }`}
              >
                {asset.status}
              </span>
            </div>
          </div>

          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-base">{asset.name}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin size={14} />
                  {asset.location}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold text-blue-400">{asset.price}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {asset.area} • {asset.distance}
              </p>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-9">
                View
              </Button>
              <Button variant="outline" className="flex-1 border-border h-9 bg-transparent">
                Make Offer
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
