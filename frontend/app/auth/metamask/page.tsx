"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ArrowLeft, AlertCircle, Wallet, CheckCircle, Loader2, Shield, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (request: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
    }
  }
}

type AuthState = "idle" | "connecting" | "signing" | "connected" | "error" | "redirecting"

export default function MetaMaskAuthPage() {
  const router = useRouter()
  const [authState, setAuthState] = useState<AuthState>("idle")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [account, setAccount] = useState<string>("")
  const [hasMetaMask, setHasMetaMask] = useState<boolean | null>(null)

  useEffect(() => {
    
    const checkMetaMask = () => {
      if (typeof window !== "undefined") {
        const isMetaMaskInstalled = window.ethereum?.isMetaMask
        setHasMetaMask(!!isMetaMaskInstalled)
        
        if (isMetaMaskInstalled) {
          console.log("✅ MetaMask detected")
        } else {
          console.log("❌ MetaMask not found")
        }
      }
    }

    checkMetaMask()

    const checkAuth = () => {
      const storedAccount = localStorage.getItem("landchain_wallet")
      const authExpiry = localStorage.getItem("landchain_auth_expiry")
      
      if (storedAccount && authExpiry) {
        const expiryTime = parseInt(authExpiry)
        if (Date.now() < expiryTime) {
          console.log("✅ User already authenticated, redirecting...")
          router.push("/dashboard")
        } else {
          
          localStorage.removeItem("landchain_wallet")
          localStorage.removeItem("landchain_auth_expiry")
        }
      }
    }

    checkAuth()

    
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log("Account changed:", accounts)
        if (accounts.length === 0) {
          handleLogout()
        } else if (accounts[0] !== account) {
          setAccount(accounts[0])
          localStorage.setItem("landchain_wallet", accounts[0])
        }
      }

      const handleChainChanged = () => {
        console.log("Chain changed, reloading...")
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum?.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum?.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [router, account])

  const handleLogout = () => {
    localStorage.removeItem("landchain_wallet")
    localStorage.removeItem("landchain_auth_expiry")
    setAccount("")
    setAuthState("idle")
  }

  const connectWallet = async () => {
    console.log("🔄 Starting wallet connection...")
    
    if (!window.ethereum) {
      console.error("❌ MetaMask not found")
      setAuthState("error")
      setErrorMessage("MetaMask is not installed. Please install MetaMask extension to continue.")
      return
    }

    try {
      setAuthState("connecting")
      console.log("📡 Requesting MetaMask accounts...")

      
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      console.log("✅ Accounts received:", accounts)

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please create an account in MetaMask.")
      }

     
      const userAccount = accounts[0]
      console.log("👤 Connected account:", userAccount)
      setAccount(userAccount)

      
      setAuthState("signing")
      console.log("✍️ Requesting signature...")

      const message = `Welcome to LandChain!\n\nSign this message to verify your wallet ownership.\n\nWallet: ${userAccount}\nTimestamp: ${Date.now()}`
      
      try {
        const signature = await window.ethereum.request({
          method: "personal_sign",
          params: [message, userAccount],
        })

        console.log("✅ Signature received:", signature.substring(0, 20) + "...")
        setAuthState("connected")

        
        const expiryTime = Date.now() + (7 * 24 * 60 * 60 * 1000)
        localStorage.setItem("landchain_wallet", userAccount)
        localStorage.setItem("landchain_auth_expiry", expiryTime.toString())
        localStorage.setItem("landchain_signature", signature)

        console.log("💾 Auth data saved to localStorage")

       
        setTimeout(() => {
          setAuthState("redirecting")
          console.log("🚀 Redirecting to dashboard...")

          
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
        }, 2000)
      } catch (signError: any) {
        console.error("❌ Signature error:", signError)
        if (signError.code === 4001) {
          throw new Error("Signature request rejected. Please sign the message to continue.")
        }
        throw signError
      }

    } catch (error: any) {
      console.error("❌ Connection error:", error)
      setAuthState("error")
      
      if (error.code === 4001) {
        setErrorMessage("Connection request rejected. Please approve the connection in MetaMask.")
      } else if (error.code === -32002) {
        setErrorMessage("MetaMask is already processing a request. Please check your MetaMask extension.")
      } else {
        setErrorMessage(error.message || "Failed to connect to MetaMask. Please try again.")
      }
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden flex flex-col items-center justify-center py-12 px-4">
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(168, 85, 247, 0.3) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center text-gray-400 hover:text-white transition-colors duration-300 z-10"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Home
      </Link>

      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-2 text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.2 
            }}
            className="mx-auto mb-4 relative h-20 w-20"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl rotate-6 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl flex items-center justify-center">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </motion.div>

          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
            Secure Authentication
          </h1>
          <p className="text-sm text-gray-400">
            Connect your MetaMask wallet to access the LandChain marketplace
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-2 border-purple-500/20 rounded-2xl shadow-2xl shadow-purple-500/10 bg-gradient-to-br from-gray-950 via-gray-900 to-black overflow-hidden">
            <CardHeader className="text-center pb-2 border-b border-purple-500/20">
              <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
                <Lock className="h-5 w-5 text-purple-400" />
                Wallet Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {hasMetaMask === false && (
                <Alert className="mb-6 bg-red-950/50 border-2 border-red-500/50 rounded-xl">
                  <AlertCircle className="text-red-400" />
                  <AlertTitle className="text-red-300">MetaMask Not Detected</AlertTitle>
                  <AlertDescription className="text-red-400">
                    Please install the MetaMask browser extension to continue.
                    <a
                      href="https://metamask.io/download/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-red-300 hover:text-red-200 underline font-semibold"
                    >
                      Download MetaMask →
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center justify-center space-y-6 py-8">
               
                {authState === "idle" && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="rounded-full border-4 border-purple-500/30 p-8 bg-gradient-to-br from-purple-950/50 to-blue-950/50 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ 
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    >
                      <Wallet className="h-20 w-20 text-purple-400" />
                    </motion.div>
                  </motion.div>
                )}

                {(authState === "connecting" || authState === "signing") && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full border-4 border-purple-500/50 p-8 bg-gradient-to-br from-purple-950/50 to-blue-950/50 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-20 w-20 text-purple-400" />
                    </motion.div>
                  </motion.div>
                )}

                {authState === "connected" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="rounded-full border-4 border-green-500/50 p-8 bg-gradient-to-br from-green-950/50 to-emerald-950/50 backdrop-blur-sm"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }} 
                      transition={{ duration: 0.5, repeat: 2 }}
                    >
                      <CheckCircle className="h-20 w-20 text-green-400" />
                    </motion.div>
                  </motion.div>
                )}

                {authState === "redirecting" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-full border-4 border-green-500/50 p-8 bg-gradient-to-br from-green-950/50 to-emerald-950/50 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-20 w-20 text-green-400" />
                    </motion.div>
                  </motion.div>
                )}

                {authState === "error" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="rounded-full border-4 border-red-500/50 p-8 bg-gradient-to-br from-red-950/50 to-rose-950/50 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <AlertCircle className="h-20 w-20 text-red-400" />
                    </motion.div>
                  </motion.div>
                )}

                
                <div className="text-center space-y-3 min-h-[80px]">
                  {authState === "idle" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-gray-300 font-medium">Ready to Connect</p>
                      <p className="text-sm text-gray-500">
                        Click below to open MetaMask extension
                      </p>
                    </motion.div>
                  )}

                  {authState === "connecting" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-purple-300 font-medium">Opening MetaMask...</p>
                      <p className="text-sm text-gray-500">
                        Please approve the connection request
                      </p>
                    </motion.div>
                  )}

                  {authState === "signing" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-purple-300 font-medium">Sign the Message</p>
                      <p className="text-sm text-gray-500">
                        Please sign the verification message in MetaMask
                      </p>
                    </motion.div>
                  )}

                  {authState === "connected" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-green-400 font-bold text-lg">✓ Connected Successfully!</p>
                      <div className="bg-gray-800/50 rounded-lg px-4 py-2 border border-gray-700">
                        <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                        <p className="text-gray-300 font-mono text-sm">
                          {account.substring(0, 8)}...{account.substring(account.length - 6)}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">Verifying your identity...</p>
                    </motion.div>
                  )}

                  {authState === "redirecting" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-green-400 font-bold text-lg">Authentication Complete</p>
                      <p className="text-sm text-gray-400">Redirecting to dashboard...</p>
                    </motion.div>
                  )}

                  {authState === "error" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-red-400 font-medium">Connection Failed</p>
                      <p className="text-sm text-gray-400">{errorMessage}</p>
                    </motion.div>
                  )}
                </div>
              </div>

              
              <div className="mt-6">
                {(authState === "idle" || authState === "error") && (
                  <Button
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 hover:from-purple-700 hover:via-purple-600 hover:to-blue-700 text-white rounded-xl py-6 text-base font-semibold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={connectWallet}
                    disabled={hasMetaMask === false}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Wallet className="h-5 w-5" />
                      {authState === "error" ? "Try Again" : "Connect MetaMask"}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      initial={false}
                    />
                  </Button>
                )}
              </div>

           
              <div className="mt-6 p-4 bg-purple-950/30 border border-purple-500/30 rounded-xl">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-300 font-medium mb-1">Secure & Private</p>
                    <p className="text-xs text-gray-500">
                      Your wallet address will be stored locally for 7 days. We never access your private keys or funds.
                    </p>
                  </div>
                </div>
              </div>

          
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  By connecting, you agree to our{" "}
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">
                    Privacy Policy
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <p className="text-sm text-gray-500">
            Don't have MetaMask?{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              Get it here
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  )
}