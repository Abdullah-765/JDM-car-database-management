"use client"

import { useEffect, useState } from "react"
import { Car, supabase } from "@/lib/supabase"
import { DashboardStats } from "@/components/dashboard-stats"
import { CarsTable } from "@/components/cars-table"
import { CarFormModal } from "@/components/car-form-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search } from "lucide-react"

export default function DashboardPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtering
  const [statusFilter, setStatusFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [carToEdit, setCarToEdit] = useState<Car | null>(null)
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'add'>('add')

  useEffect(() => {
    fetchCars()
  }, [])

  const fetchCars = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error("Error fetching cars:", error)
    } else {
      setCars(data || [])
    }
    setLoading(false)
  }

  const handleSaveCar = async (carData: Partial<Car>) => {
    if (carToEdit) {
      // Update
      const { error } = await supabase
        .from('cars')
        .update(carData)
        .eq('id', carToEdit.id)
      if (error) console.error("Update error:", error)
    } else {
      // Insert
      const { error } = await supabase
        .from('cars')
        .insert([carData])
      if (error) console.error("Insert error:", error)
    }
    await fetchCars()
  }

  const handleDelete = async (id: number) => {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id)
    if (error) console.error("Delete error:", error)
    await fetchCars()
  }

  const openAddModal = () => {
    setCarToEdit(null)
    setModalMode('add')
    setIsModalOpen(true)
  }

  const openEditModal = (car: Car) => {
    setCarToEdit(car)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const openViewModal = (car: Car) => {
    setCarToEdit(car)
    setModalMode('view')
    setIsModalOpen(true)
  }

  // Derived state: filtered cars
  const filteredCars = cars.filter(car => {
    const matchesStatus = statusFilter === "All" || car.status === statusFilter;
    const searchLower = searchQuery.toLowerCase();
    const chassisMatch = car.chassis_no?.toLowerCase().includes(searchLower);
    const customerMatch = car.customer_name?.toLowerCase().includes(searchLower);
    // User requested year/model, we implement by scanning arbitrary fields
    const plateMatch = car.number_plate?.toLowerCase().includes(searchLower);
    
    const matchesSearch = !searchLower || (chassisMatch || customerMatch || plateMatch);
    
    return matchesStatus && matchesSearch;
  })

  return (
    <div className="min-h-screen bg-muted/20 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary">JDM Import Dealership</h1>
            <p className="text-muted-foreground mt-1">Manage all your cars, inventory routing, and profit margins natively.</p>
          </div>
          <Button onClick={openAddModal} className="w-full md:w-auto font-semibold">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Car
          </Button>
        </div>

        {/* Stats */}
        <DashboardStats cars={cars} />

        {/* Filters and Table wrapper */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by chassis no, customer, or number plate..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
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

          {loading ? (
            <div className="h-64 flex items-center justify-center rounded-lg border bg-card/50">
              <div className="animate-pulse flex items-center text-muted-foreground text-sm font-medium">Fetching cars array...</div>
            </div>
          ) : (
            <CarsTable 
              cars={filteredCars} 
              onEdit={openEditModal} 
              onView={openViewModal}
              onDelete={handleDelete} 
            />
          )}

        </div>

      </div>

      <CarFormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        carToEdit={carToEdit}
        initialMode={modalMode}
        onSave={handleSaveCar}
      />
    </div>
  )
}
