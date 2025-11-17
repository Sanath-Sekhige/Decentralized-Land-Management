import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, MapPin, DollarSign, Activity } from 'lucide-react'

interface QuickStatsProps {
  stats?: {
    myAssets: number
    totalValue: string
    growth: string
    transactions: number
  }
}

export default function QuickStats({ stats }: QuickStatsProps) {
  const defaultStats = {
    myAssets: stats?.myAssets || 0,
    totalValue: stats?.totalValue || "$0",
    growth: stats?.growth || "+0%",
    transactions: stats?.transactions || 0,
  }

  const statCards = [
    {
      icon: MapPin,
      title: "My Assets",
      value: defaultStats.myAssets.toString(),
      subtitle: "Active listings",
      color: "from-purple-600 to-purple-400",
    },
    {
      icon: DollarSign,
      title: "Total Value",
      value: defaultStats.totalValue,
      subtitle: "Portfolio value",
      color: "from-blue-600 to-blue-400",
    },
    {
      icon: TrendingUp,
      title: "Growth",
      value: defaultStats.growth,
      subtitle: "This month",
      color: "from-green-600 to-green-400",
    },
    {
      icon: Activity,
      title: "Transactions",
      value: defaultStats.transactions.toString(),
      subtitle: "Total trades",
      color: "from-pink-600 to-pink-400",
    },
  ]

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon
        return (
          <Card key={i} className="border-border bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
