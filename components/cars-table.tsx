import { useState } from "react"
import { Car, CarStatus } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit2, Trash2, Calendar, User, CreditCard, Activity, TrendingUp, TrendingDown, Eye } from "lucide-react"

interface CarsTableProps {
  cars: Car[]
  onEdit: (car: Car) => void
  onView: (car: Car) => void
  onDelete: (id: number) => Promise<void>
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Available': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200'
    case 'Sold': return 'bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200'
    case 'Reserved': return 'bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200'
    case 'In Transit': return 'bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200'
    default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
  }
}

export function CarsTable({ cars, onEdit, onView, onDelete }: CarsTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = async () => {
    if (deleteId) {
      setIsDeleting(true)
      await onDelete(deleteId)
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const formatCurrency = (val: number | string | null | undefined, currency: 'USD' | 'SHS' | 'JPY' = 'USD') => {
    const num = Number(val || 0);
    const symbols = { USD: '$', SHS: 'SHS ', JPY: '¥' };
    return `${symbols[currency]}${num.toLocaleString(undefined, { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: currency === 'USD' ? 2 : 0 })}`;
  }

  return (
    <div className="rounded-xl border bg-white dark:bg-zinc-950 shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-b-2">
              <TableHead className="font-bold text-zinc-900 dark:text-zinc-100 py-4 px-6 w-[200px]">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  Vehicle Details
                </div>
              </TableHead>
              <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">Status</TableHead>
              <TableHead className="font-bold text-zinc-900 dark:text-zinc-100">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Ownership
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100">
                <div className="flex items-center justify-end gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  Price (USD)
                </div>
              </TableHead>
              <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100">Total Cost (USD)</TableHead>
              <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100">Profit (USD)</TableHead>
              <TableHead className="text-right font-bold text-zinc-900 dark:text-zinc-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground italic">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Activity className="h-8 w-8 opacity-20" />
                    No car records found matching your criteria.
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car, index) => {
                const isProfitPositive = (car.profit_dollars || 0) >= 0;
                return (
                  <TableRow 
                    key={car.id} 
                    className={`group transition-colors duration-150 ${index % 2 === 0 ? 'bg-white dark:bg-zinc-950' : 'bg-muted/10'}`}
                  >
                    <TableCell className="py-4 px-6">
                      <div className="font-bold text-sm tracking-tight group-hover:text-primary transition-colors">
                        {car.chassis_no}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1 font-medium bg-muted/40 w-fit px-1.5 py-0.5 rounded uppercase">
                        <Calendar className="h-3 w-3" />
                        {new Date(car.created_at || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`font-semibold border-2 px-3 py-1 rounded-full ${getStatusStyles(car.status)}`}>
                        {car.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col max-w-[180px]">
                        <span className="font-bold text-sm truncate">{car.customer_name || 'Stock'}</span>
                        {car.number_plate && (
                          <span className="text-[11px] font-mono font-bold bg-primary/5 text-primary w-fit px-1.5 rounded border border-primary/10 mt-1">
                            {car.number_plate}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(car.price_usd, 'USD')}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium opacity-80">
                      {formatCurrency(car.total_cost_dollars, 'USD')}
                    </TableCell>
                    <TableCell className={`text-right font-mono font-bold text-base ${isProfitPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      <div className="flex items-center justify-end gap-1">
                        {isProfitPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {formatCurrency(car.profit_dollars, 'USD')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary/10 hover:text-primary border-transparent transition-all"
                          onClick={() => onView(car)}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-primary hover:text-white border-transparent hover:border-primary transition-all ml-1"
                          onClick={() => onEdit(car)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-rose-500 hover:bg-rose-500 hover:text-white border-transparent hover:border-rose-500 transition-all ml-1"
                          onClick={() => setDeleteId(car.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteId !== null} onOpenChange={(val) => !val && setDeleteId(null)}>
        <DialogContent className="rounded-xl overflow-hidden border-none shadow-2xl">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-rose-600" />
            </div>
            <DialogTitle className="text-center text-xl">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-center">
              Are you sure you want to remove this vehicle record? This action is permanent and cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDeleteId(null)} disabled={isDeleting} className="w-full sm:w-auto">Keep Record</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting} className="w-full sm:w-auto font-bold bg-rose-600 hover:bg-rose-700">
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
