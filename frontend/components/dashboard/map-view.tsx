"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin, AlertCircle, Heart, Share2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface MapViewProps {
  location: { lat: number; lng: number }
  radius: number
}

export default function MapView({ location, radius }: MapViewProps) {
  const nearbyAssets = [
    {
      id: 1,
      name: "Manhattan Skyline Parcel",
      distance: 0.2,
      price: "$850K",
      area: "2,500 sq ft",
      lat: 40.715,
      lng: -74.0055,
      type: "Commercial",
      status: "Available",
    },
    {
      id: 2,
      name: "Brooklyn Heights Estate",
      distance: 1.5,
      price: "$1.2M",
      area: "5,000 sq ft",
      lat: 40.695,
      lng: -74.01,
      type: "Residential",
      status: "Available",
    },
    {
      id: 3,
      name: "Queens Commercial Zone",
      distance: 3.2,
      price: "$650K",
      area: "3,500 sq ft",
      lat: 40.73,
      lng: -74.02,
      type: "Mixed-Use",
      status: "Available",
    },
    {
      id: 4,
      name: "Downtown Residential Plot",
      distance: 4.8,
      price: "$920K",
      area: "2,800 sq ft",
      lat: 40.7,
      lng: -74.005,
      type: "Residential",
      status: "Available",
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Nearby Assets</h2>
        <p className="text-muted-foreground">
          Showing {nearbyAssets.length} properties within {radius}km
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-1 gap-4">
        {nearbyAssets.map((asset) => (
          <Card
            key={asset.id}
            className="card-dark border-border hover:border-purple-500/50 transition-all group cursor-pointer overflow-hidden"
          >
            <CardContent className="p-0">
              <div className="flex gap-4 p-4">
                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0 group-hover:border-purple-500/50 transition-colors">
                  <MapPin className="h-8 w-8 text-purple-400" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-purple-300 transition-colors">
                        {asset.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">{asset.type}</p>
                    </div>
                    <span className="text-xs font-bold text-purple-400 bg-purple-600/20 rounded px-2 py-1 whitespace-nowrap ml-2">
                      {asset.distance}km away
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    <p className="text-lg font-bold text-blue-400">{asset.price}</p>
                    <p className="text-sm text-muted-foreground">{asset.area}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-8 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      View Details
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                      <Heart size={16} />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-purple-400">
                      <Share2 size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="mt-6 bg-blue-950/40 border-blue-700/40 text-blue-100">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-sm">
          Displaying assets within <span className="font-semibold">{radius}km radius</span> of your selected location.
          Prices are estimates based on market data.
        </AlertDescription>
      </Alert>
    </div>
  )
}
