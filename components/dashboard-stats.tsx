import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car } from "@/lib/supabase"
import { DollarSign, Car as CarIcon, CheckCircle, Tag, TrendingUp, Info } from "lucide-react"

interface DashboardStatsProps {
  cars: Car[]
}

export function DashboardStats({ cars }: DashboardStatsProps) {
  const totalCars = cars.length;
  const totalAvailable = cars.filter(c => c.status === 'Available').length;
  const totalSold = cars.filter(c => c.status === 'Sold').length;
  const totalProfitUSD = cars.reduce((sum, c) => sum + (c.profit_dollars || 0), 0);

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500">
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-blue-500 transition-colors">Total Inventory</CardTitle>
          <div className="p-2 bg-blue-50 rounded-lg dark:bg-blue-900/20">
            <CarIcon className="h-4 w-4 text-blue-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black">{totalCars}</div>
          <div className="flex items-center gap-1 mt-1">
            <Info className="h-3 w-3 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Total lifetime records</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-emerald-500 transition-colors">Available</CardTitle>
          <div className="p-2 bg-emerald-50 rounded-lg dark:bg-emerald-900/20">
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-emerald-600">{totalAvailable}</div>
          <div className="flex items-center gap-1 mt-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Active for shipment</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-rose-500 transition-colors">Total Sold</CardTitle>
          <div className="p-2 bg-rose-50 rounded-lg dark:bg-rose-900/20">
            <Tag className="h-4 w-4 text-rose-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-rose-600">{totalSold}</div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-rose-500" />
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Completed deliveries</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-lg bg-gradient-to-br from-zinc-900 to-black dark:from-zinc-800 dark:to-zinc-950 text-white overflow-hidden relative group">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-amber-500 transition-colors">Cumulative Profit</CardTitle>
          <div className="p-2 bg-amber-500/20 rounded-lg">
            <DollarSign className="h-4 w-4 text-amber-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-black text-white">${totalProfitUSD.toLocaleString()}</div>
          <div className="flex items-center gap-1 mt-1">
            <div className={`h-1.5 w-1.5 rounded-full ${totalProfitUSD >= 0 ? 'bg-amber-500' : 'bg-rose-500'}`} />
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-tight">After all port clearances</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
