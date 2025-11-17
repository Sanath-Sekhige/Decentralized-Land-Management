"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Wallet, ArrowRight, Shield, TrendingUp, MapPin, LockIcon} from "lucide-react"

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const storedAccount = localStorage.getItem("landchain_wallet")
    const authExpiry = localStorage.getItem("landchain_auth_expiry")
    
    if (storedAccount && authExpiry) {
      const expiryTime = parseInt(authExpiry)
      if (Date.now() < expiryTime) {
        setIsAuthenticated(true)
      }
    }
  }, [])

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/auth/metamask")
    }
  }

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
          <div className="flex items-center gap-4">
            
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2">
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href="/auth/metamask">
                <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2">
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6">
              <span className="block text-white mb-2">Own Land on the</span>
              <span className="block bg-gradient-to-r from-purple-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                Blockchain
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-400 max-w-3xl mx-auto">
              Trade verified land NFTs with geographic precision. Secure, transparent, and decentralized property ownership for the modern era.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all gap-2"
              >
                {isAuthenticated ? (
                  <>
                    Go to Dashboard
                    <ArrowRight className="h-5 w-5" />
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Connect & Get Started
                  </>
                )}
              </Button>
              <Link href="/marketplace">
                
              </Link>
            </div>

            
            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 border-2 border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center mb-4 mx-auto">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Blockchain Secured</h3>
                <p className="text-gray-400">Every property is secured on the blockchain with immutable ownership records</p>
              </div>

              
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 border-2 border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 mx-auto">
                  <LockIcon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Secure and Transparent</h3>
                <p className="text-gray-400">All ownership records and transactions are recorded on an immutable public ledger, providing complete visibility and verifiability for all participants.</p>
              </div>

             
              <div className="bg-gradient-to-br from-gray-950 to-gray-900 border-2 border-purple-500/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Digital Assets</h3>
                <p className="text-gray-400">Each land parcel is tokenized as a unique digital asset (NFT) for easy and secure ownership transfer.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}