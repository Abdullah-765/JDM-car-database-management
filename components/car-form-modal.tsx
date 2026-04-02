import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, CarStatus } from "@/lib/supabase"
import { Calculator, Car as CarIcon, DollarSign, JapaneseYen, Receipt, TrendingUp, Edit2 } from "lucide-react"

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
    status: 'Available',
    customer_name: '',
    chassis_no: '',
    price_jpy: '' as unknown as number,
    price_usd: '' as unknown as number,
    port_clearance: '' as unknown as number,
    total_cost_dollars: '' as unknown as number,
    total_cost_shs: '' as unknown as number,
    tax: '' as unknown as number,
    number_plate: '',
    vat: '' as unknown as number,
    clearance: '' as unknown as number,
    total_own_cost: '' as unknown as number,
    sold_price: '' as unknown as number,
    profit_shs: '' as unknown as number,
    profit_dollars: '' as unknown as number,
    profit_jpy: '' as unknown as number,
  })

  // Local state for calculation rates (not saved to DB)
  const [usdJpyRate, setUsdJpyRate] = useState<number>(150)
  const [usdShsRate, setUsdShsRate] = useState<number>(130)

  // Use effect to handle automatic calculations when inputs change
  useEffect(() => {
    // Only calculate if we have a JPY price
    if (formData.price_jpy && usdJpyRate) {
      const priceUsd = Number((formData.price_jpy / usdJpyRate).toFixed(2))
      const portClearance = formData.port_clearance || 0
      const totalCostDollars = Number((priceUsd + portClearance).toFixed(2))
      const totalCostShs = Math.round(totalCostDollars * usdShsRate)
      
      const tax = formData.tax || 0
      const vat = formData.vat || 0
      const clearance = formData.clearance || 0
      const totalOwnCost = totalCostShs + tax + vat + clearance
      
      const soldPrice = formData.sold_price || 0
      const profitShs = soldPrice > 0 ? (soldPrice - totalOwnCost) : 0
      const profitDollars = Number((profitShs / usdShsRate).toFixed(2))
      const profitJpy = Math.round(profitDollars * usdJpyRate)

      setFormData(prev => ({
        ...prev,
        price_usd: priceUsd,
        total_cost_dollars: totalCostDollars,
        total_cost_shs: totalCostShs,
        total_own_cost: totalOwnCost,
        profit_shs: profitShs,
        profit_dollars: profitDollars,
        profit_jpy: profitJpy
      }))
    }
  }, [
    formData.price_jpy, 
    formData.port_clearance, 
    formData.tax, 
    formData.vat, 
    formData.clearance, 
    formData.sold_price,
    usdJpyRate, 
    usdShsRate
  ])

  useEffect(() => {
    if (open) {
      setIsReadOnly(initialMode === 'view')
    }
  }, [open, initialMode])

  useEffect(() => {
    if (carToEdit) {
      setFormData(carToEdit)
    } else {
      setFormData({
        status: 'Available',
        customer_name: '',
        chassis_no: '',
        price_jpy: '' as unknown as number,
        price_usd: '' as unknown as number,
        port_clearance: '' as unknown as number,
        total_cost_dollars: '' as unknown as number,
        total_cost_shs: '' as unknown as number,
        tax: '' as unknown as number,
        number_plate: '',
        vat: '' as unknown as number,
        clearance: '' as unknown as number,
        total_own_cost: '' as unknown as number,
        sold_price: '' as unknown as number,
        profit_shs: '' as unknown as number,
        profit_dollars: '' as unknown as number,
        profit_jpy: '' as unknown as number,
      })
    }
  }, [carToEdit, open])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
    }))
  }

  const handleStatusChange = (val: CarStatus) => {
    setFormData(prev => ({ ...prev, status: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const sanitized = { ...formData }
    const numFields = ['price_jpy', 'price_usd', 'port_clearance', 'total_cost_dollars', 'total_cost_shs', 'tax', 'vat', 'clearance', 'total_own_cost', 'sold_price', 'profit_shs', 'profit_dollars', 'profit_jpy']
    numFields.forEach(k => {
      if ((sanitized as any)[k] === '') {
        (sanitized as any)[k] = 0;
      }
    })
    await onSave(sanitized)
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-3xl max-h-[90vh] overflow-y-auto p-0 rounded-xl border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <CarIcon className="h-6 w-6" />
                </div>
                {carToEdit ? (isReadOnly ? 'Car Details' : 'Edit Car Record') : 'Register New Car'}
              </div>
              {isReadOnly && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  type="button"
                  onClick={() => setIsReadOnly(false)}
                  className="mr-12"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit Record
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-8">
          {/* Exchange Rates Section */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-xl border border-primary/20 shadow-inner">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Conversion Rates</h3>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">1 USD = (JPY)</Label>
                <div className="relative">
                  <JapaneseYen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    className="pl-9 bg-white dark:bg-zinc-950 border-primary/20 focus:ring-primary/30"
                    value={usdJpyRate} 
                    onChange={(e) => setUsdJpyRate(Number(e.target.value) || 0)} 
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-muted-foreground uppercase">1 USD = (SHS)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    className="pl-9 bg-white dark:bg-zinc-950 border-primary/20 focus:ring-primary/30"
                    value={usdShsRate} 
                    onChange={(e) => setUsdShsRate(Number(e.target.value) || 0)} 
                    readOnly={isReadOnly}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* General Info */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Vehicle Identity
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Chassis No.</Label>
                  <Input name="chassis_no" value={formData.chassis_no || ''} onChange={handleChange} required placeholder="e.g., JZA80-001234" readOnly={isReadOnly} />
                </div>

                <div className="space-y-2">
                  <Label>Current Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange} disabled={isReadOnly}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Available">Available</SelectItem>
                      <SelectItem value="Sold">Sold</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input name="customer_name" value={formData.customer_name || ''} onChange={handleChange} placeholder="Optional" readOnly={isReadOnly} />
                </div>

                <div className="space-y-2">
                  <Label>Number Plate</Label>
                  <Input name="number_plate" value={formData.number_plate || ''} onChange={handleChange} placeholder="e.g., KDA 123X" readOnly={isReadOnly} />
                </div>
              </div>
            </div>

            {/* Financial Info */}
            <div className="space-y-6">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Acquisition & Costs
              </h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex justify-between">
                    <span>Price (JPY)</span>
                    <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono uppercase font-bold">Input Required</span>
                  </Label>
                  <div className="relative">
                    <JapaneseYen className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="number" name="price_jpy" className="pl-9" value={formData.price_jpy} onChange={handleChange} required readOnly={isReadOnly} />
                  </div>
                </div>
                
                <div className="space-y-2 opacity-80">
                  <Label className="flex justify-between">
                    <span>Price (USD)</span>
                    <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-mono uppercase font-bold">Calculated</span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <div className="flex h-9 w-full rounded-md border border-input bg-secondary/30 pl-9 px-3 py-2 text-sm font-medium text-muted-foreground shadow-sm">
                      {Number(formData.price_usd || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Port Clearance (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input type="number" name="port_clearance" className="pl-9" value={formData.port_clearance} onChange={handleChange} required readOnly={isReadOnly} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 opacity-80">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Total Cost (USD)</Label>
                    <div className="flex h-9 w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
                      ${Number(formData.total_cost_dollars || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="space-y-2 opacity-80">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Total Cost (SHS)</Label>
                    <div className="flex h-9 w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm font-semibold text-muted-foreground shadow-sm">
                      {Number(formData.total_cost_shs || 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px bg-border my-6" />

          {/* Local Fees & Profit */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Receipt className="h-3 w-3" />
                Local Fees (SHS)
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">Tax (SHS)</Label>
                  <Input type="number" name="tax" value={formData.tax} onChange={handleChange} required readOnly={isReadOnly} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">VAT (SHS)</Label>
                  <Input type="number" name="vat" value={formData.vat} onChange={handleChange} required readOnly={isReadOnly} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Clearance (SHS)</Label>
                  <Input type="number" name="clearance" value={formData.clearance} onChange={handleChange} required readOnly={isReadOnly} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-primary">Total Own Cost (SHS)</Label>
                  <div className="flex h-9 w-full rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm font-bold text-primary shadow-sm" >
                    {Number(formData.total_own_cost || 0).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-dashed border-muted-foreground/30">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                Sales & Profitability
              </h4>
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label className="font-bold text-green-700 dark:text-green-400">Sold Price (SHS)</Label>
                  <Input type="number" name="sold_price" className="border-green-500/50 shadow-sm focus:ring-green-500" value={formData.sold_price ?? ''} onChange={handleChange} placeholder="Enter Sale Price" readOnly={isReadOnly} />
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Profit (SHS)</Label>
                    <div className={`px-2 py-1.5 rounded-md text-xs font-bold border ${Number(formData.profit_shs) >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      {Number(formData.profit_shs).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Profit (USD)</Label>
                    <div className={`px-2 py-1.5 rounded-md text-xs font-bold border ${Number(formData.profit_dollars) >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      ${Number(formData.profit_dollars).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[9px] uppercase font-bold text-muted-foreground">Profit (JPY)</Label>
                    <div className={`px-2 py-1.5 rounded-md text-xs font-bold border ${Number(formData.profit_jpy) >= 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                      ¥{Number(formData.profit_jpy).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 pt-6 border-t">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
              {isReadOnly ? 'Close' : 'Cancel'}
            </Button>
            {!isReadOnly && (
              <Button type="submit" size="lg" className="px-8 font-bold" disabled={loading}>
                {loading ? 'Saving Changes...' : carToEdit ? 'Update Vehicle Record' : 'Complete Registration'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
