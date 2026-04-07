"use client"

import { useEffect, useState } from "react"
import { Car, supabase } from "@/lib/supabase"
import { DashboardStats } from "@/components/dashboard-stats"
import { CarsTable } from "@/components/cars-table"
import { CarFormModal } from "@/components/car-form-modal"
import { AuthGuard, signOut, useIsGuest } from "@/components/auth-guard"
import LoginPage from "@/components/login-page"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search, LogOut, Sparkles } from "lucide-react"

export default function DashboardPage() {
  const isGuest = useIsGuest()
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [carToEdit, setCarToEdit] = useState<Car | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('add')

  useEffect(() => { fetchCars() }, [])

  const fetchCars = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('cars').select('*').order('created_at', { ascending: false })
    if (error) console.error("Error fetching cars:", error)
    else setCars(data || [])
    setLoading(false)
  }

  const handleSaveCar = async (carData: Partial<Car>) => {
    if (isGuest) {
      if (carToEdit) {
        setCars(cars.map(c => c.id === carToEdit.id ? { ...c, ...carData } as Car : c))
      } else {
        const tempCar: Car = {
          ...carData as Car,
          id: Date.now(),
          created_at: new Date().toISOString()
        }
        setCars([tempCar, ...cars])
      }
      setIsModalOpen(false)
      return
    }
    if (carToEdit) {
      const { error } = await supabase.from('cars').update(carData).eq('id', carToEdit.id)
      if (error) console.error("Update error:", error)
    } else {
      const { error } = await supabase.from('cars').insert([carData])
      if (error) console.error("Insert error:", error)
    }
    await fetchCars()
  }

  const handleDelete = async (id: number) => {
    if (isGuest) {
      setCars(cars.filter(c => c.id !== id))
      return
    }
    const { error } = await supabase.from('cars').delete().eq('id', id)
    if (error) console.error("Delete error:", error)
    await fetchCars()
  }

  const openAddModal = () => { setCarToEdit(null); setModalMode('add'); setIsModalOpen(true) }
  const openEditModal = (car: Car) => { setCarToEdit(car); setModalMode('edit'); setIsModalOpen(true) }
  const openViewModal = (car: Car) => { setCarToEdit(car); setModalMode('view'); setIsModalOpen(true) }

  const filteredCars = cars.filter(car => {
    const matchesStatus = statusFilter === "All" || car.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || car.chassis_no?.toLowerCase().includes(q) || car.customer_name?.toLowerCase().includes(q) || car.number_plate?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  })

  return (
    <AuthGuard fallback={<LoginPage />}>
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-[22px] font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">JDM Import Dealership</h1>
                {isGuest && (
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[9px] font-black uppercase px-2 py-0.5 border border-amber-200 dark:border-amber-700/50">Guest Mode</span>
                )}
              </div>
              <p className="text-[12px] text-zinc-400 font-medium mt-0.5">Inventory & profit management</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ThemeToggle />
            <Button variant="outline" onClick={openAddModal} className="flex-1 md:flex-none h-10 font-bold text-[13px] gap-2 shadow-sm rounded-none bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <PlusCircle className="h-4 w-4" /> Add Vehicle
            </Button>
            <Button variant="outline" size="icon" onClick={signOut} className="h-10 w-10 shrink-0 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors rounded-none" title="Sign Out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <DashboardStats cars={cars} />

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search chassis, customer, plate..."
              className="pl-9 h-10 rounded-none text-[13px] bg-white dark:bg-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full md:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 rounded-none text-[13px] bg-white dark:bg-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 shadow-sm">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
                <SelectItem value="Reserved">Reserved</SelectItem>
                <SelectItem value="In Transit">In Transit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="h-64 flex items-center justify-center rounded-none border dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 border-[3px] border-zinc-200 dark:border-zinc-800 border-t-zinc-600 dark:border-t-zinc-300 rounded-none animate-spin" />
              <p className="text-[12px] text-zinc-400 font-medium">Loading inventory...</p>
            </div>
          </div>
        ) : (
          <CarsTable cars={filteredCars} onEdit={openEditModal} onView={openViewModal} onDelete={handleDelete} />
        )}
      </div>

      <CarFormModal open={isModalOpen} onOpenChange={setIsModalOpen} carToEdit={carToEdit} initialMode={modalMode} onSave={handleSaveCar} />
    </div>
    </AuthGuard>
  )
}
