import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-20">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6 inline-block">
          <span className="inline-flex items-center gap-2 rounded-full border border-purple-600/30 bg-purple-600/10 px-4 py-2 text-sm text-purple-200">
            🔗 Powered by Blockchain
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 text-balance">
          Own Land,{" "}
          <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Powered by Web3
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
          Buy, sell, and discover land assets with blockchain security. Connect your MetaMask wallet and start trading
          real estate on the decentralized marketplace.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 px-8 text-base">
              Start Trading
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Button variant="outline" className="h-12 px-8 text-base border-border hover:bg-muted bg-transparent">
            Explore Assets
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 pt-12 border-t border-border">
          <div>
            <div className="text-3xl font-bold text-purple-400">2.5M+</div>
            <div className="text-sm text-muted-foreground">Land Parcels</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-400">$5.2B</div>
            <div className="text-sm text-muted-foreground">Total Volume</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-400">45K+</div>
            <div className="text-sm text-muted-foreground">Active Traders</div>
          </div>
        </div>
      </div>
    </section>
  )
}
