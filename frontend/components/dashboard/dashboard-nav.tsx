"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, Plus, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardNavProps {
  user: any
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <nav className="border-b border-purple-500/20 bg-black/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg blur-md opacity-75 group-hover:opacity-100 transition" />
              <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
              LandChain
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Button className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all gap-2">
              <Plus size={18} />
              List Asset
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white hover:bg-purple-600/10 gap-2 transition-all"
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}