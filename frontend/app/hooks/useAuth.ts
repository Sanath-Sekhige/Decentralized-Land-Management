"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AuthUser {
  address: string
  isAuthenticated: boolean
}

export function useAuth(requireAuth: boolean = true) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const checkAuth = () => {
    const storedAccount = localStorage.getItem("landchain_wallet")
    const authExpiry = localStorage.getItem("landchain_auth_expiry")

    if (storedAccount && authExpiry) {
      const expiryTime = parseInt(authExpiry)
      
      if (Date.now() < expiryTime) {
        // User is authenticated
        setUser({
          address: storedAccount,
          isAuthenticated: true,
        })
        setLoading(false)
      } else {
        // Auth expired
        handleLogout()
      }
    } else {
      // Not authenticated
      if (requireAuth) {
        router.push("/auth/metamask")
      }
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("landchain_wallet")
    localStorage.removeItem("landchain_auth_expiry")
    setUser(null)
    router.push("/")
  }

  return { user, loading, logout: handleLogout, checkAuth }
}