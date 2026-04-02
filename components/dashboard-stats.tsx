import { Card, CardContent } from "@/components/ui/card"
import { Car } from "@/lib/supabase"
import { DollarSign, Car as CarIcon, CheckCircle, Tag, TrendingUp } from "lucide-react"

interface DashboardStatsProps {
  cars: Car[]
}

export function DashboardStats({ cars }: DashboardStatsProps) {
  const totalCars = cars.length;
  const totalAvailable = cars.filter(c => c.status === 'Available').length;
  const totalSold = cars.filter(c => c.status === 'Sold').length;
  const totalProfitUSD = cars.reduce((sum, c) => sum + (c.profit_dollars || 0), 0);

  const stats = [
    {
      label: 'Total Inventory',
      value: totalCars,
      sub: 'Lifetime records',
      icon: CarIcon,
      color: 'text-blue-500',
      bg: 'bg-blue-500/8',
      ring: 'ring-blue-500/10',
      accent: 'bg-blue-500',
    },
    {
      label: 'Available',
      value: totalAvailable,
      sub: 'Ready for sale',
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/8',
      ring: 'ring-emerald-500/10',
      accent: 'bg-emerald-500',
      pulse: true,
    },
    {
      label: 'Sold',
      value: totalSold,
      sub: 'Delivered',
      icon: Tag,
      color: 'text-orange-500',
      bg: 'bg-orange-500/8',
      ring: 'ring-orange-500/10',
      accent: 'bg-orange-500',
    },
    {
      label: 'Total Profit',
      value: `$${totalProfitUSD.toLocaleString()}`,
      sub: 'After all costs',
      icon: DollarSign,
      color: 'text-violet-500',
      bg: 'bg-violet-500/8',
      ring: 'ring-violet-500/10',
      accent: 'bg-violet-500',
      featured: true,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 stagger-children">
      {stats.map((s) => (
        <Card 
          key={s.label} 
          className={`group relative overflow-hidden transition-all duration-300 ${
            s.featured 
              ? 'bg-violet-50 dark:bg-violet-950/30 border-violet-100 dark:border-violet-500/20 shadow-sm ring-1 ring-violet-500/10' 
              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 border shadow-sm hover:shadow-md'
          }`}
        >
          {/* Top accent line */}
          <div className={`absolute top-0 left-0 right-0 h-[2px] ${s.accent} opacity-60`} />
          
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className={`text-[10px] font-bold uppercase tracking-[0.15em] ${s.featured ? 'text-violet-500/80 dark:text-violet-400/80' : 'text-zinc-500 dark:text-zinc-400'}`}>
                  {s.label}
                </p>
                <div>
                  <p className={`text-[28px] font-extrabold tracking-tight leading-none ${s.featured ? 'text-violet-900 dark:text-violet-100' : 'text-zinc-900 dark:text-zinc-100'}`}>
                    {s.value}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {s.pulse && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                    {!s.pulse && s.featured && <TrendingUp className="h-3 w-3 text-violet-400" />}
                    <p className={`text-[10px] font-medium ${s.featured ? 'text-violet-600 dark:text-violet-300' : 'text-zinc-500 dark:text-zinc-400'}`}>
                      {s.sub}
                    </p>
                  </div>
                </div>
              </div>
              <div className={`p-2.5 rounded-none ${s.bg} ring-1 ${s.ring}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
