import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Zap, Shield, TrendingUp, Users, Globe } from "lucide-react"

const features = [
  {
    icon: MapPin,
    title: "Proximity Discovery",
    description: "Find land assets near your desired location with our advanced mapping system.",
  },
  {
    icon: Zap,
    title: "Instant Transactions",
    description: "Buy and sell land instantly with MetaMask integration and blockchain security.",
  },
  {
    icon: Shield,
    title: "Fully Decentralized",
    description: "Complete ownership and control without intermediaries or third parties.",
  },
  {
    icon: TrendingUp,
    title: "Market Insights",
    description: "Real-time analytics and trending assets to make informed decisions.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Connect with buyers, sellers, and investors in the global land market.",
  },
  {
    icon: Globe,
    title: "Global Marketplace",
    description: "Access land opportunities across continents with no geographical limitations.",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Powerful Features for Modern Land Trading</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to buy, sell, and discover land assets on the blockchain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <Card key={i} className="card-dark border-border hover:border-purple-600/50 transition">
                <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
