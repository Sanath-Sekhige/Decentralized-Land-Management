"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  MapPin, Square, DollarSign, Calendar, Zap, X, Heart, Share2, 
  TrendingUp, Shield, FileText, Info, Check, ArrowRight, Building2,
  Users, Clock, Award, Sparkles, MessageSquare, Phone, Mail
} from 'lucide-react'

interface LandDetailModalProps {
  isOpen: boolean
  onClose: () => void
  land?: {
    id: number
    name: string
    location: string
    price: string
    area: string
    coordinates: { lat: number; lng: number }
    status: "available" | "pending" | "sold" | "Available" | "Pending" | "Sold"
    type: "commercial" | "residential" | "mixed-use" | "Commercial" | "Residential" | "Mixed-Use"
    listedDate: string
    description: string
  }
}

export default function LandDetailModal({ isOpen, onClose, land }: LandDetailModalProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'documents'>('overview')
  const [showOfferForm, setShowOfferForm] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const [offerMessage, setOfferMessage] = useState("")
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email')

  if (!land) return null

  const normalizedStatus = land.status.toLowerCase() as "available" | "pending" | "sold"
  const normalizedType = land.type.toLowerCase() as "commercial" | "residential" | "mixed-use"


  const getPropertyFeatures = () => {
    if (normalizedType === "commercial") {
      return [
        { icon: Building2, label: "High Foot Traffic Zone", color: "text-blue-400", desc: "Prime commercial area with 50K+ daily visitors" },
        { icon: Users, label: "Multi-Tenant Ready", color: "text-green-400", desc: "Flexible space for 3-5 businesses" },
        { icon: TrendingUp, label: "ROI: 18-22% Annually", color: "text-purple-400", desc: "Based on similar properties in area" },
      ]
    } else if (normalizedType === "residential") {
      return [
        { icon: Shield, label: "Safe Neighborhood", color: "text-green-400", desc: "Crime rate 40% below city average" },
        { icon: Sparkles, label: "Modern Infrastructure", color: "text-blue-400", desc: "Recently upgraded utilities & roads" },
        { icon: Award, label: "School District A+", color: "text-purple-400", desc: "Top-rated schools within 1 mile" },
      ]
    } else {
      return [
        { icon: Building2, label: "Dual Zoning Approved", color: "text-blue-400", desc: "Both commercial & residential use" },
        { icon: TrendingUp, label: "High Appreciation Area", color: "text-green-400", desc: "Property values up 35% in 3 years" },
        { icon: Clock, label: "Move-in Ready", color: "text-purple-400", desc: "All permits and approvals in place" },
      ]
    }
  }

  const features = getPropertyFeatures()

  const specifications = [
    { label: "Property ID", value: `#${land.id.toString().padStart(6, '0')}` },
    { label: "Land Type", value: normalizedType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') },
    { label: "Status", value: normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1) },
    { label: "Listed Date", value: new Date(land.listedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
    { label: "Total Area", value: land.area },
    { label: "Price per sq ft", value: `$${Math.round(parseInt(land.price.replace(/[$,KM]/g, '')) * (land.price.includes('M') ? 1000000 : 1000) / parseInt(land.area.replace(/[,sq ft]/g, '')))}` },
    { label: "Zoning", value: normalizedType === "commercial" ? "C-2 Commercial" : normalizedType === "residential" ? "R-3 Residential" : "MX-1 Mixed Use" },
    { label: "Tax ID", value: `TX-${Math.random().toString(36).substr(2, 9).toUpperCase()}` },
  ]

  const handleSubmitOffer = () => {
    if (!offerAmount) {
      alert("Please enter an offer amount")
      return
    }
    
    console.log({
      propertyId: land.id,
      offerAmount,
      message: offerMessage,
      contactMethod
    })
    
    alert(`Offer submitted successfully! We'll contact you via ${contactMethod} within 24 hours.`)
    setShowOfferForm(false)
    setOfferAmount("")
    setOfferMessage("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-gradient-to-br from-gray-950 via-gray-900 to-black border-2 border-purple-500/30 p-0 max-h-[95vh] overflow-hidden">
        <DialogTitle className="sr-only">{land.name}</DialogTitle>
        <DialogDescription className="sr-only">Property details for {land.name} located at {land.location}</DialogDescription>
    
        <div className="relative h-72 bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-violet-600/30 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.3) 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>
          
          <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
          <div className="relative h-full flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 rounded-full blur-2xl" />
              <MapPin className="h-24 w-24 text-purple-300 relative" strokeWidth={1.5} />
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:border-purple-500/50 transition-all group"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <div className="absolute top-4 left-4 flex gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`h-10 w-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-all ${
                isLiked 
                  ? 'bg-red-500/80 border-red-500 text-white' 
                  : 'bg-black/50 border-white/10 text-white hover:bg-black/70 hover:border-red-500/50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                alert("Link copied to clipboard!")
              }}
              className="h-10 w-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/70 hover:border-purple-500/50 transition-all"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="absolute bottom-4 left-4">
            <div className={`px-4 py-2 rounded-full backdrop-blur-md font-semibold text-sm flex items-center gap-2 border-2 ${
              normalizedStatus === "available" 
                ? "bg-green-500/20 text-green-300 border-green-500/50" 
                : normalizedStatus === "pending" 
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/50" 
                : "bg-gray-500/20 text-gray-300 border-gray-500/50"
            }`}>
              <div className={`h-2 w-2 rounded-full ${
                normalizedStatus === "available" ? "bg-green-400 animate-pulse" : 
                normalizedStatus === "pending" ? "bg-yellow-400 animate-pulse" : "bg-gray-400"
              }`} />
              {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
            </div>
          </div>
        </div>
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-18rem)]">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              {land.name}
            </h2>
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="h-4 w-4 text-purple-400" />
              <span>{land.location}</span>
              <span className="text-gray-600">•</span>
              <span className="text-xs font-mono bg-gray-800/50 px-2 py-1 rounded">
                {land.coordinates.lat.toFixed(4)}, {land.coordinates.lng.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mb-6 border-b border-gray-800">
            {(['overview', 'details', 'documents'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 font-medium transition-all relative ${
                  selectedTab === tab
                    ? 'text-purple-400'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {selectedTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500" />
                )}
              </button>
            ))}
          </div>


          {selectedTab === 'overview' && (
            <div className="space-y-6">

              <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-blue-950/30 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl" />
                <CardContent className="pt-6 relative">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Current Price</p>
                      <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        {land.price}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{land.area} • ${Math.round(parseInt(land.price.replace(/[$,KM]/g, '')) * (land.price.includes('M') ? 1000000 : 1000) / parseInt(land.area.replace(/[,sq ft]/g, '')))}/sq ft</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-2 rounded-lg">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-semibold">+12.5% YoY</span>
                      </div>
                      <p className="text-xs text-gray-500">Market average: +8.3%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-1 gap-4">
                {features.map((feature, index) => (
                  <Card key={index} className="border border-gray-800 bg-gray-900/50 hover:border-purple-500/50 transition-all group">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={`h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-gray-700 group-hover:border-purple-500/50 transition-all flex-shrink-0`}>
                          <feature.icon className={`h-6 w-6 ${feature.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-white mb-1">{feature.label}</p>
                          <p className="text-sm text-gray-400">{feature.desc}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>


              <Card className="border border-gray-800 bg-gray-900/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Info className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Property Overview</h3>
                  </div>
                  <p className="text-gray-400 leading-relaxed">{land.description}</p>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'details' && (
            <div className="space-y-4">
              <Card className="border border-gray-800 bg-gray-900/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Property Specifications
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {specifications.map((spec, index) => (
                      <div key={index} className="p-3 bg-gray-800/30 rounded-lg border border-gray-800">
                        <p className="text-xs text-gray-500 mb-1">{spec.label}</p>
                        <p className="text-sm text-white font-medium">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-800 bg-gray-900/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-white mb-4">Investment Highlights</h3>
                  <div className="space-y-2">
                    {[
                      "Strategic location in rapidly developing area",
                      "Projected 15-20% value increase over next 2 years",
                      "All infrastructure and utilities in place",
                      "Clean title with instant transfer capability",
                      "Flexible financing options available"
                    ].map((highlight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400 text-sm">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === 'documents' && (
            <Card className="border border-gray-800 bg-gray-900/50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-400" />
                  Available Documents
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Title Deed (NFT)", size: "2.4 MB", verified: true },
                    { name: "Land Survey Report", size: "1.8 MB", verified: true },
                    { name: "Zoning Certificate", size: "890 KB", verified: true },
                    { name: "Property Tax Records", size: "1.2 MB", verified: true },
                    { name: "Environmental Assessment", size: "3.1 MB", verified: true },
                    { name: "Utility Access Rights", size: "756 KB", verified: false },
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-purple-500/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{doc.name}</p>
                          <p className="text-gray-500 text-xs">{doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.verified && (
                          <div className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                            <Shield className="h-3 w-3" />
                            Verified
                          </div>
                        )}
                        <ArrowRight className="h-4 w-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {showOfferForm && (
            <Card className="border-2 border-purple-500/50 bg-gradient-to-br from-purple-950/50 to-blue-950/50 mt-6">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  Submit Your Offer
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Offer Amount</label>
                    <Input
                      type="text"
                      placeholder="e.g., $800,000"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      className="bg-gray-900/50 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Message (Optional)</label>
                    <Textarea
                      placeholder="Tell us about your plans for this property..."
                      value={offerMessage}
                      onChange={(e) => setOfferMessage(e.target.value)}
                      className="bg-gray-900/50 border-purple-500/30 text-white min-h-24"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Preferred Contact Method</label>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setContactMethod('email')}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          contactMethod === 'email'
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </button>
                      <button
                        onClick={() => setContactMethod('phone')}
                        className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${
                          contactMethod === 'phone'
                            ? 'border-purple-500 bg-purple-500/20 text-white'
                            : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <Phone className="h-4 w-4" />
                        Phone
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSubmitOffer}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                    >
                      Submit Offer
                    </Button>
                    <Button
                      onClick={() => setShowOfferForm(false)}
                      variant="outline"
                      className="border-gray-700 bg-gray-800/50 text-gray-300"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}


          {!showOfferForm && (
            <div className="flex gap-3 pt-6 border-t border-gray-800 mt-6">
              <Button 
                onClick={() => setShowOfferForm(true)}
                className="flex-1 h-12 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 text-white font-semibold text-base shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all group"
              >
                <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                Make an Offer
              </Button>
              <Button 
                variant="outline" 
                className="h-12 border-2 border-gray-700 hover:border-purple-500/50 bg-gray-800/50 hover:bg-gray-800 text-white px-6"
                onClick={() => window.open(`mailto:owner@landchain.com?subject=Inquiry about ${land.name}`, '_blank')}
              >
                Contact Owner
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}