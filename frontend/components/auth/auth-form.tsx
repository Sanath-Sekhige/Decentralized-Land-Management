"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Wallet, CheckCircle2, AlertCircle, Eye, EyeOff, Copy } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AuthFormProps {
  type: "login" | "signup"
}

export function AuthForm({ type }: AuthFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showWalletOption, setShowWalletOption] = useState(false)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  })

  useEffect(() => {
    checkMetaMaskConnection()
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged)
      return () => {
        (window as any).ethereum.removeListener("accountsChanged", handleAccountsChanged)
      }
    }
  }, [])

  const checkMetaMaskConnection = async () => {
    if (typeof window === "undefined") return
    if (!(window as any).ethereum) return

    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_accounts",
      })
      if (accounts && accounts.length > 0) {
        setWalletConnected(true)
        setWalletAddress(accounts[0])
      }
    } catch (error) {
      console.error("Error checking MetaMask connection:", error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length > 0) {
      setWalletConnected(true)
      setWalletAddress(accounts[0])
    } else {
      setWalletConnected(false)
      setWalletAddress(null)
    }
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.email) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (type === "signup") {
      if (!formData.name) {
        errors.name = "Full name is required"
      }
      if (!formData.confirmPassword) {
        errors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "Passwords do not match"
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleConnectWallet = async () => {
    try {
      setLoading(true)

      if (typeof window === "undefined") {
        alert("Window object not available")
        return
      }

      if (!(window as any).ethereum) {
        alert("MetaMask is not installed. Please install the MetaMask extension.")
        return
      }

      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts && accounts.length > 0) {
        setWalletConnected(true)
        setWalletAddress(accounts[0])
      }
    } catch (error: any) {
      if (error.code === 4001) {
        alert("You rejected the connection request.")
      } else if (error.code === -32603) {
        alert("MetaMask error. Please refresh and try again.")
      } else if (error.code === 4902) {
        alert("Please add Ethereum network to MetaMask.")
      } else {
        alert(error.message || "Failed to connect wallet.")
      }
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!validateForm()) return

    localStorage.setItem(
      "user",
      JSON.stringify({
        ...formData,
        wallet: walletAddress || null,
        id: Math.random().toString(36),
      }),
    )

    router.push("/dashboard")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-0">
      <div className="space-y-5">
        {type === "signup" && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Full Name</label>
            <Input
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleInputChange}
              className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11 transition-all ${
                formErrors.name ? "border-red-500/50 bg-red-500/5" : ""
              }`}
            />
            {formErrors.name && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {formErrors.name}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Email Address</label>
          <Input
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleInputChange}
            className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11 transition-all ${
              formErrors.email ? "border-red-500/50 bg-red-500/5" : ""
            }`}
          />
          {formErrors.email && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {formErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-200">Password</label>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11 pr-10 transition-all ${
                formErrors.password ? "border-red-500/50 bg-red-500/5" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {formErrors.password && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              {formErrors.password}
            </p>
          )}
        </div>

        {type === "signup" && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">Confirm Password</label>
            <div className="relative">
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500/20 h-11 pr-10 transition-all ${
                  formErrors.confirmPassword ? "border-red-500/50 bg-red-500/5" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formErrors.confirmPassword && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {formErrors.confirmPassword}
              </p>
            )}
          </div>
        )}

        {!showWalletOption && (
          <Button
            type="submit"
            className="w-full h-11 mt-8 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-emerald-500/40 transition-all disabled:opacity-50"
          >
            {type === "login" ? "Sign In" : "Create Account"}
          </Button>
        )}

        {!showWalletOption && (
          <button
            type="button"
            onClick={() => setShowWalletOption(true)}
            className="w-full h-11 text-sm text-slate-400 hover:text-slate-300 transition-colors underline"
          >
            Connect Wallet (Optional)
          </button>
        )}

        {showWalletOption && (
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <h3 className="text-slate-200 font-semibold">Connect MetaMask (Optional)</h3>
            
            {!walletConnected ? (
              <Button
                type="button"
                onClick={handleConnectWallet}
                disabled={loading}
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-emerald-500/40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-5 w-5" />
                    Connect MetaMask
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-emerald-300">Wallet Connected</p>
                    <p className="text-xs text-emerald-200/70 mt-0.5">MetaMask is ready</p>
                  </div>
                </div>

                <div className="bg-slate-800/30 border border-slate-700 rounded-lg p-3 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-400 mb-1">Wallet Address</p>
                    <p className="text-sm font-mono text-slate-200 truncate">{walletAddress && formatAddress(walletAddress)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    className="flex-shrink-0 p-2 hover:bg-slate-700 rounded transition-colors"
                    title={copied ? "Copied!" : "Copy address"}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <Copy className="h-4 w-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => setShowWalletOption(false)}
                variant="outline"
                className="flex-1 h-11 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Skip
              </Button>
              <Button
                type="submit"
                className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg hover:shadow-emerald-500/40 transition-all"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
