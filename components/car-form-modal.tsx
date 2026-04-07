import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, CarStatus } from "@/lib/supabase"
import { Calculator, DollarSign, JapaneseYen, Receipt, TrendingUp, Edit2, Save, RefreshCw, Coins } from "lucide-react"
import { fetchExchangeRates } from "@/lib/exchange-rates"

interface CarFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carToEdit?: Car | null;
  initialMode?: 'view' | 'edit' | 'add';
  onSave: (car: Partial<Car>) => Promise<void>;
}

export function CarFormModal({
  open,
  onOpenChange,
  carToEdit,
  initialMode = 'add',
  onSave
}: CarFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [isReadOnly, setIsReadOnly] = useState(initialMode === 'view')
  const [formData, setFormData] = useState<Partial<Car>>({
    status: 'Available', customer_name: '', chassis_no: '', number_plate: '',
    price_jpy: '' as unknown as number, price_usd: '' as unknown as number,
    port_clearance: '' as unknown as number, total_cost_dollars: '' as unknown as number,
    total_cost_kes: '' as unknown as number, tax: '' as unknown as number,
    vat: '' as unknown as number, clearance: '' as unknown as number,
    total_own_cost: '' as unknown as number, sold_price: '' as unknown as number,
    profit_kes: '' as unknown as number, profit_dollars: '' as unknown as number,
    profit_jpy: '' as unknown as number,
  })

  const [usdJpyRate, setUsdJpyRate] = useState<number>(150)
  const [usdkesRate, setUsdkesRate] = useState<number>(130)

  useEffect(() => {
    if (formData.price_jpy && usdJpyRate) {
      const priceUsd = Number((formData.price_jpy / usdJpyRate).toFixed(2))
      const portClearance = formData.port_clearance || 0
      const totalCostDollars = Number((priceUsd + portClearance).toFixed(2))
      const totalCostkes = Math.round(totalCostDollars * usdkesRate)
      const tax = formData.tax || 0
      const vat = formData.vat || 0
      const clearance = formData.clearance || 0
      const totalOwnCost = totalCostkes + tax + vat + clearance
      const soldPrice = formData.sold_price || 0
      const profitkes = soldPrice > 0 ? (soldPrice - totalOwnCost) : 0
      const profitDollars = Number((profitkes / usdkesRate).toFixed(2))
      const profitJpy = Math.round(profitDollars * usdJpyRate)

      setFormData(prev => ({
        ...prev, price_usd: priceUsd, total_cost_dollars: totalCostDollars,
        total_cost_kes: totalCostkes, total_own_cost: totalOwnCost,
        profit_kes: profitkes, profit_dollars: profitDollars, profit_jpy: profitJpy
      }))
    }
  }, [formData.price_jpy, formData.port_clearance, formData.tax, formData.vat, formData.clearance, formData.sold_price, usdJpyRate, usdkesRate])

  useEffect(() => {
    if (open) {
      setIsReadOnly(initialMode === 'view')
      if (initialMode === 'add') {
        const getRates = async () => {
          const rates = await fetchExchangeRates()
          if (rates) {
            setUsdJpyRate(rates.usdToJpy)
            setUsdkesRate(rates.usdToKes)
          }
        }
        getRates()
      }
    }
  }, [open, initialMode])

  useEffect(() => {
    if (carToEdit) { setFormData(carToEdit) } else {
      setFormData({
        status: 'Available', customer_name: '', chassis_no: '', number_plate: '',
        price_jpy: '' as unknown as number, price_usd: '' as unknown as number,
        port_clearance: '' as unknown as number, total_cost_dollars: '' as unknown as number,
        total_cost_kes: '' as unknown as number, tax: '' as unknown as number,
        vat: '' as unknown as number, clearance: '' as unknown as number,
        total_own_cost: '' as unknown as number, sold_price: '' as unknown as number,
        profit_kes: '' as unknown as number, profit_dollars: '' as unknown as number,
        profit_jpy: '' as unknown as number,
      })
    }
  }, [carToEdit, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value }))
  }

  const handleStatusChange = (val: CarStatus) => { setFormData(prev => ({ ...prev, status: val })) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const sanitized = { ...formData }
    const numFields = ['price_jpy', 'price_usd', 'port_clearance', 'total_cost_dollars', 'total_cost_kes', 'tax', 'vat', 'clearance', 'total_own_cost', 'sold_price', 'profit_kes', 'profit_dollars', 'profit_jpy']
    numFields.forEach(k => { if ((sanitized as any)[k] === '') { (sanitized as any)[k] = 0; } })
    await onSave(sanitized)
    setLoading(false)
    onOpenChange(false)
  }

  const fmtNum = (val: number | string | undefined | null, decimals = 0) =>
    Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

  const ReadOnlyField = ({ label, value, prefix = '' }: { label: string; value: string; prefix?: string }) => (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.1em]">{label}</Label>
      <div className="h-9 flex items-center px-3 rounded-none bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 text-[13px] font-semibold text-zinc-600 dark:text-zinc-300">
        {prefix}{value}
      </div>
    </div>
  )

  const profitColor = (val: number | string | undefined | null) => Number(val || 0) >= 0
    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'
    : 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-none border dark:border-zinc-800 shadow-2xl gap-0 bg-white dark:bg-zinc-950">
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-extrabold flex items-center justify-between">
            <span>{carToEdit ? (isReadOnly ? 'Vehicle Details' : 'Edit Record') : 'New Vehicle'}</span>
            {isReadOnly && (
              <Button variant="outline" size="sm" type="button" onClick={() => setIsReadOnly(false)} className="rounded-none text-[12px] font-semibold gap-1.5 h-8">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Exchange Rates */}
          {!isReadOnly && (
            <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-none border border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Conversion Rates</span>
                </div>
                {!isReadOnly && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 px-2 text-[9px] uppercase font-bold gap-1 text-zinc-400 hover:text-zinc-900"
                    onClick={async () => {
                      const rates = await fetchExchangeRates();
                      if (rates) {
                        setUsdJpyRate(rates.usdToJpy);
                        setUsdkesRate(rates.usdToKes);
                      }
                    }}
                  >
                    <RefreshCw className="h-2.5 w-2.5" />
                    Fetch Live
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.1em]">1 USD → JPY</Label>
                  <div className="relative">
                    <JapaneseYen className="absolute left-3 top-2 h-4 w-4 text-zinc-400" />
                    <Input type="number" className="pl-9 h-9 text-[13px] rounded-none bg-white dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800" value={usdJpyRate} onChange={(e) => setUsdJpyRate(Number(e.target.value) || 0)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.1em]">1 USD → kes</Label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-2 h-4 w-4 text-zinc-400" />
                    <Input type="number" className="pl-9 h-9 text-[13px] rounded-none bg-white dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-800" value={usdkesRate} onChange={(e) => setUsdkesRate(Number(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Two columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left: Vehicle Info */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Vehicle Information</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold">Chassis No.</Label>
                  <Input name="chassis_no" value={formData.chassis_no || ''} onChange={handleChange} required readOnly={isReadOnly} placeholder="JZA80-001234" className="h-9 text-[13px] rounded-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold">Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange} disabled={isReadOnly}>
                    <SelectTrigger className="h-9 text-[13px] rounded-none"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold">Customer Name</Label>
                  <Input name="customer_name" value={formData.customer_name || ''} onChange={handleChange} readOnly={isReadOnly} placeholder="Optional" className="h-9 text-[13px] rounded-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold">Number Plate</Label>
                  <Input name="number_plate" value={formData.number_plate || ''} onChange={handleChange} readOnly={isReadOnly} placeholder="KDA 123X" className="h-9 text-[13px] rounded-none" />
                </div>
              </div>
            </div>

            {/* Right: Pricing */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Pricing & Costs</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold">Purchase Price (JPY)</Label>
                  <div className="relative">
                    <JapaneseYen className="absolute left-3 top-2 h-4 w-4 text-zinc-400" />
                    <Input type="number" name="price_jpy" className="pl-9 h-9 text-[13px] rounded-none" value={formData.price_jpy} onChange={handleChange} required readOnly={isReadOnly} />
                  </div>
                </div>
                <ReadOnlyField label="Price (USD)" value={fmtNum(formData.price_usd, 2)} prefix="$" />
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-semibold">Port Clearance (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2 h-4 w-4 text-zinc-400" />
                    <Input type="number" name="port_clearance" className="pl-9 h-9 text-[13px] rounded-none" value={formData.port_clearance} onChange={handleChange} required readOnly={isReadOnly} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ReadOnlyField label="Total (USD)" value={fmtNum(formData.total_cost_dollars, 2)} prefix="$" />
                  <ReadOnlyField label="Total (kes)" value={fmtNum(formData.total_cost_kes)} />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-zinc-100 dark:bg-zinc-800" />

          {/* Bottom section: Fees & Profit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-3 w-3 text-zinc-400" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Local Fees (kes)</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-400">Tax</Label>
                  <Input type="number" name="tax" value={formData.tax} onChange={handleChange} required readOnly={isReadOnly} className="h-9 text-[13px] rounded-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-400">VAT</Label>
                  <Input type="number" name="vat" value={formData.vat} onChange={handleChange} required readOnly={isReadOnly} className="h-9 text-[13px] rounded-none" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold text-zinc-400">Clearance</Label>
                  <Input type="number" name="clearance" value={formData.clearance} onChange={handleChange} required readOnly={isReadOnly} className="h-9 text-[13px] rounded-none" />
                </div>
              </div>
              <ReadOnlyField label="Total Own Cost (kes)" value={fmtNum(formData.total_own_cost)} />
            </div>

            {/* Profit */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.15em]">Sales & Profit</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] font-semibold text-emerald-700">Sold Price (kes)</Label>
                <Input type="number" name="sold_price" value={formData.sold_price ?? ''} onChange={handleChange} readOnly={isReadOnly} placeholder="Enter sale price" className="h-9 text-[13px] rounded-none border-emerald-200 focus:ring-emerald-500/20" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold text-zinc-400">kes</Label>
                  <div className={`px-2 py-1.5 rounded-none text-[12px] font-bold border text-center ${profitColor(formData.profit_kes)}`}>
                    {fmtNum(formData.profit_kes)}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold text-zinc-400">USD</Label>
                  <div className={`px-2 py-1.5 rounded-none text-[12px] font-bold border text-center ${profitColor(formData.profit_dollars)}`}>
                    ${fmtNum(formData.profit_dollars, 2)}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[9px] uppercase font-bold text-zinc-400">JPY</Label>
                  <div className={`px-2 py-1.5 rounded-none text-[12px] font-bold border text-center ${profitColor(formData.profit_jpy)}`}>
                    ¥{fmtNum(formData.profit_jpy)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="pt-4 border-t border-zinc-100 dark:border-zinc-800 pb-4 pr-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading} className="rounded-none">
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" disabled={loading} className="rounded-none font-semibold gap-2">
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : carToEdit ? 'Update Record' : 'Save Vehicle'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
