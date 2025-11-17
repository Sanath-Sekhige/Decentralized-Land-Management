"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, User, Settings, History } from "lucide-react"

export default function AuthHeader() {
  const router = useRouter()
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = () => {
    const storedAccount = localStorage.getItem("landchain_wallet")
    const authExpiry = localStorage.getItem("landchain_auth_expiry")

    if (storedAccount && authExpiry) {
      const expiryTime = parseInt(authExpiry)
      if (Date.now() < expiryTime) {
        setWalletAddress(storedAccount)
        setIsAuthenticated(true)
      } else {
        handleLogout()
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("landchain_wallet")
    localStorage.removeItem("landchain_auth_expiry")
    setWalletAddress(null)
    setIsAuthenticated(false)
    router.push("/")
  }

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <header className="border-b border-border sticky top-0 z-50 bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold">L</span>
          </div>
          <span className="text-xl font-bold text-foreground">LandChain</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/marketplace">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Marketplace
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              Dashboard
            </Button>
          </Link>

          {isAuthenticated && walletAddress ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 gap-2"
                >
                  <Wallet className="h-4 w-4" />
                  {formatAddress(walletAddress)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-border" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">My Wallet</p>
                    <p className="text-xs leading-none text-muted-foreground font-mono">
                      {walletAddress}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                  <History className="mr-2 h-4 w-4" />
                  Transaction History
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/metamask">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white gap-2">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}