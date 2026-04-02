import { useState } from "react"
import { Car } from "@/lib/supabase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Edit2, Trash2, Eye, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react"

interface CarsTableProps {
  cars: Car[]
  onEdit: (car: Car) => void
  onView: (car: Car) => void
  onDelete: (id: number) => Promise<void>
}

const statusConfig: Record<string, { class: string; dot: string }> = {
  'Available': { class: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', dot: 'bg-emerald-500' },
  'Sold': { class: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20', dot: 'bg-rose-500' },
  'Reserved': { class: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', dot: 'bg-amber-500' },
  'In Transit': { class: 'bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-500/20', dot: 'bg-sky-500' },
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

  const fmt = (val: number | string | null | undefined) => {
    const num = Number(val || 0);
    return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return (
    <div className="rounded-none border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50/80 dark:bg-zinc-900/50 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 border-b dark:border-zinc-800">
              <TableHead className="font-bold text-[11px] uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-500 py-3.5 pl-5">Vehicle</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-500">Status</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-500">Customer</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-500 text-right">Price</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-500 text-right">Cost</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-500 text-right">Profit</TableHead>
              <TableHead className="font-bold text-[11px] uppercase tracking-[0.1em] text-zinc-500 dark:text-zinc-500 text-right pr-5">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center">
                  <div className="flex flex-col items-center gap-2 text-zinc-400">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                      <Eye className="h-5 w-5 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <p className="text-[13px] font-medium">No records found</p>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Adjust filters or add a new vehicle</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car) => {
                const profit = car.profit_dollars || 0;
                const isPositive = profit >= 0;
                const cfg = statusConfig[car.status] || statusConfig['Available']

                return (
                  <TableRow key={car.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 dark:border-zinc-800 transition-colors">
                    <TableCell className="py-3.5 pl-5">
                      <p className="font-bold text-[13px] text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{car.chassis_no}</p>
                      {car.number_plate && (
                        <span className="text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-none mt-1 inline-block">
                          {car.number_plate}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] font-bold border rounded-none px-2.5 py-0.5 gap-1.5 ${cfg.class}`}>
                        <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {car.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                        {car.customer_name || <span className="text-zinc-400 dark:text-zinc-600 italic font-normal">Stock</span>}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                      {fmt(car.price_usd)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-[13px] text-zinc-500 dark:text-zinc-400">
                      {fmt(car.total_cost_dollars)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-flex items-center gap-1 font-mono text-[13px] font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {fmt(profit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-5">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400" onClick={() => onView(car)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => onEdit(car)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400" onClick={() => setDeleteId(car.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Delete confirmation */}
      <Dialog open={deleteId !== null} onOpenChange={(val) => !val && setDeleteId(null)}>
        <DialogContent className="rounded-none border dark:border-zinc-800 shadow-2xl max-w-sm p-6 bg-white dark:bg-zinc-950">
          <DialogHeader className="items-center text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6 text-rose-500 dark:text-rose-400" />
            </div>
            <DialogTitle className="text-lg">Delete record?</DialogTitle>
            <DialogDescription className="text-[13px]">
              This action is permanent and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 mt-2">
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting} className="w-full rounded-none h-10 font-semibold bg-rose-600 hover:bg-rose-700">
              {isDeleting ? 'Deleting...' : 'Delete permanently'}
            </Button>
            <Button variant="ghost" onClick={() => setDeleteId(null)} disabled={isDeleting} className="w-full rounded-none h-10">
              Keep record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
