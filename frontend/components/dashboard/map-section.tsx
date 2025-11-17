'use client'

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MapPin, Search, Locate, X, Maximize2, Minimize2, Filter } from 'lucide-react'
import dynamic from 'next/dynamic'
import LandDetailModal from './land-detail-modal'

// Dynamically import the enhanced map
const DynamicMap = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gradient-to-br from-purple-950/20 to-black rounded-lg flex items-center justify-center border border-purple-500/30">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
        <p className="text-purple-300 font-medium">Loading interactive map...</p>
      </div>
    </div>
  ),
})

const radiusPresets = [
  { label: "", value: 2, icon: "", color: "from-green-500 to-emerald-400" },
  { label: "", value: 5, icon: "", color: "from-blue-500 to-cyan-400" },
  { label: "", value: 15, icon: "", color: "from-purple-500 to-violet-400" },
  { label: "", value: 30, icon: "", color: "from-pink-500 to-rose-400" },
]

// Mock assets data
const mockAssets = [
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
    coordinates: { lat: 40.715, lng: -74.0055 },
    listedDate: "2024-11-15",
    description: "Prime Manhattan location with excellent development potential and high foot traffic.",
    location: "Manhattan, NY"
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
    coordinates: { lat: 40.695, lng: -74.01 },
    listedDate: "2024-11-10",
    description: "Beautiful Brooklyn Heights property with historic charm and modern amenities.",
    location: "Brooklyn Heights, NY"
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
    coordinates: { lat: 40.73, lng: -74.02 },
    listedDate: "2024-11-12",
    description: "Growing commercial zone with excellent rental income potential.",
    location: "Queens, NY"
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
    status: "Pending",
    coordinates: { lat: 40.7, lng: -74.005 },
    listedDate: "2024-11-08",
    description: "Modern downtown location perfect for new developments.",
    location: "Downtown Manhattan, NY"
  },
]

export default function MapSection() {
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.006 })
  const [searchRadius, setSearchRadius] = useState(5)
  const [searchInput, setSearchInput] = useState("")
  const [error, setError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [isCustomRadius, setIsCustomRadius] = useState(false)
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedLand, setSelectedLand] = useState<any>(null)
  const [showDetails, setShowDetails] = useState(false)

  // Filter assets by radius and type
  const filteredAssets = useMemo(() => {
    let filtered = mockAssets.filter(asset => asset.distance <= searchRadius)
    if (typeFilter !== "all") {
      filtered = filtered.filter(asset => asset.type.toLowerCase() === typeFilter)
    }
    return filtered
  }, [searchRadius, typeFilter])

  const handleSearch = async () => {
    if (!searchInput.trim()) {
      setError("Please enter a location")
      return
    }

    setIsSearching(true)
    setError("")

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchInput)}&format=json`
      )
      const data = await response.json()

      if (data && data.length > 0) {
        setLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
        })
      } else {
        setError("Location not found. Try another search term.")
      }
    } catch {
      setError("Failed to search location. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseCurrentLocation = () => {
    setIsSearching(true)
    setError("")

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setIsSearching(false)
        },
        () => {
          setError("Unable to get your current location")
          setIsSearching(false)
        }
      )
    } else {
      setError("Geolocation is not supported by your browser")
      setIsSearching(false)
    }
  }

  const handleMapClick = (lat: number, lng: number) => {
    setLocation({ lat, lng })
  }

  const handlePresetClick = (value: number) => {
    setSearchRadius(value)
    setIsCustomRadius(false)
  }

  const handleAssetClick = (asset: any) => {
    setSelectedLand(asset)
    setShowDetails(true)
  }

  const typeOptions = ["all", "commercial", "residential", "mixed-use"]
  const currentTypeIndex = typeOptions.indexOf(typeFilter)
  const nextType = typeOptions[(currentTypeIndex + 1) % typeOptions.length]

  return (
    <>
      <div className="space-y-6">
        {/* Map Card - Now First */}
        <Card className="bg-gradient-to-br from-gray-950 via-gray-900 to-black border-2 border-purple-500/20 shadow-2xl shadow-purple-500/10 overflow-hidden">
          <CardHeader className="border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-white text-xl">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  Interactive Asset Map
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  {filteredAssets.length} properties found within {searchRadius}km radius
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-700 bg-gray-800/50 hover:bg-gray-800 text-gray-300"
                  onClick={() => setTypeFilter(nextType)}
                >
                  <Filter className="h-4 w-4 mr-1" />
                  {typeFilter === "all" ? "All Types" : typeFilter.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DynamicMap 
              location={location} 
              onMapClick={handleMapClick}
              radius={searchRadius}
              assets={filteredAssets}
              onAssetClick={handleAssetClick}
            />
          </CardContent>
        </Card>

        {/* Search Controls Card */}
        <Card className="bg-gradient-to-br from-gray-950 via-gray-900 to-black border-2 border-purple-500/20 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-purple-500/20">
            <CardTitle className="flex items-center gap-2 text-white">
              <Search className="h-5 w-5 text-purple-400" />
              Search Controls
            </CardTitle>
            <CardDescription className="text-gray-400">
              Customize your search location and radius
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Location Input */}
              <div>
                <label htmlFor="location-input" className="text-sm font-medium text-gray-300 mb-2 block">
                  Search Location
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="location-input"
                      type="text"
                      placeholder="Enter city, address, or zip code..."
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value)
                        setError("")
                      }}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      className="bg-gray-900/50 border-purple-500/30 text-white placeholder:text-gray-500 focus:border-purple-500 pr-10 h-11"
                    />
                    {searchInput && (
                      <button
                        onClick={() => {
                          setSearchInput("")
                          setError("")
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={!searchInput.trim() || isSearching}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-11 px-6"
                  >
                    <Search size={18} className="mr-2" />
                    Search
                  </Button>
                  <Button
                    onClick={handleUseCurrentLocation}
                    variant="outline"
                    className="border-purple-500/50 text-purple-300 hover:bg-purple-600/10 hover:text-white bg-transparent h-11 px-4"
                    disabled={isSearching}
                  >
                    <Locate size={18} />
                  </Button>
                </div>
                {error && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    ⚠️ {error}
                  </p>
                )}
              </div>

              {/* Radius Presets */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Search Radius
                </label>
                
                {/* Preset Buttons */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {radiusPresets.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => handlePresetClick(preset.value)}
                      className={`relative group overflow-hidden rounded-xl p-4 border-2 transition-all duration-300 ${
                        searchRadius === preset.value && !isCustomRadius
                          ? `border-purple-500 bg-gradient-to-br ${preset.color} shadow-lg shadow-purple-500/50`
                          : "border-purple-500/20 bg-gray-900/30 hover:border-purple-500/50 hover:bg-gray-900/50"
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex flex-col items-center gap-2">
                        <span className="text-3xl">{preset.icon}</span>
                        <div className="text-center">
                          <p className={`text-xs font-semibold ${
                            searchRadius === preset.value && !isCustomRadius ? "text-white" : "text-gray-400"
                          }`}>
                            {preset.label}
                          </p>
                          <p className={`text-lg font-bold ${
                            searchRadius === preset.value && !isCustomRadius ? "text-white" : "text-purple-400"
                          }`}>
                            {preset.value}km
                          </p>
                        </div>
                      </div>
                      {searchRadius === preset.value && !isCustomRadius && (
                        <div className="absolute top-2 right-2">
                          <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Radius Toggle */}
                <button
                  onClick={() => setIsCustomRadius(!isCustomRadius)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                    isCustomRadius
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-purple-500/20 bg-gray-900/30 hover:border-purple-500/50"
                  }`}
                >
                  <span className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    {isCustomRadius ? (
                      <Minimize2 size={16} className="text-purple-400" />
                    ) : (
                      <Maximize2 size={16} className="text-purple-400" />
                    )}
                    Custom Range
                  </span>
                  <span className="text-purple-400 text-sm font-bold">
                    {isCustomRadius ? `${searchRadius}km` : "Set custom"}
                  </span>
                </button>

                {/* Custom Slider */}
                {isCustomRadius && (
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-purple-950/40 to-violet-950/40 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Distance</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
                        {searchRadius}km
                      </span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        value={searchRadius}
                        onChange={(e) => setSearchRadius(Number.parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer slider-purple"
                        style={{
                          background: `linear-gradient(to right, rgb(147 51 234) 0%, rgb(147 51 234) ${((searchRadius - 1) / 49) * 100}%, rgb(31 41 55) ${((searchRadius - 1) / 49) * 100}%, rgb(31 41 55) 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-2">
                        <span>1km</span>
                        <span>25km</span>
                        <span>50km</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Panel */}
              <div className="flex items-center gap-3 text-sm bg-gradient-to-r from-purple-950/40 to-violet-950/40 border border-purple-700/30 rounded-lg px-4 py-3">
                <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                  <span className="text-lg">💡</span>
                </div>
                <div>
                  <p className="text-gray-300">
                    Displaying <span className="font-semibold text-purple-300">{filteredAssets.length} assets</span> within {searchRadius}km
                  </p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    📍 {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <LandDetailModal 
        isOpen={showDetails} 
        onClose={() => setShowDetails(false)} 
        land={selectedLand} 
      />
    </>
  )
}