
"use client"

import * as React from "react"
import { WakingIndicator } from "@/components/waking-indicator"
import { EmployeeTable } from "@/components/employee-table"
import { AttendanceGrid } from "@/components/attendance-grid"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CalendarCheck2, LayoutDashboard, RefreshCcw, LogOut, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { EmployeeDialog } from "@/components/employee-dialog"

export type Employee = {
  id: string
  name: string
  email: string
  department: string
  jobTitle: string
  joinDate: string
}

export type AttendanceLog = {
  employeeId: string
  status: 'Present' | 'Absent' | 'Late'
  date: string
}

export default function HRMSDashboard() {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [attendance, setAttendance] = React.useState<AttendanceLog[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isWaking, setIsWaking] = React.useState(false)
  const [employeeDialogOpen, setEmployeeDialogOpen] = React.useState(false)
  const { toast } = useToast()

  const fetchHRData = React.useCallback(async () => {
    let wakingTimer = setTimeout(() => setIsWaking(true), 2000)
    
    try {
      const [empRes, attRes] = await Promise.all([
        fetch('/api/hrms/employees'),
        fetch('/api/hrms/attendance')
      ])

      if (empRes.status === 503) throw new Error('SERVER_WAKING')
      
      const empData = await empRes.json()
      const attData = await attRes.json()
      
      setEmployees(empData)
      setAttendance(attData)
      setIsWaking(false)
    } catch (err: any) {
      if (err.message === 'SERVER_WAKING') {
        setTimeout(fetchHRData, 2500)
      } else {
        toast({ title: "API Error", description: "Failed to connect to Render Backend.", variant: "destructive" })
      }
    } finally {
      clearTimeout(wakingTimer)
      setIsLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchHRData()
  }, [fetchHRData])

  const handleAddEmployee = async (data: Partial<Employee>) => {
    try {
      const res = await fetch('/api/hrms/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const newEmp = await res.json()
      setEmployees(prev => [...prev, newEmp])
      toast({ title: "Success", description: "Employee added to roster." })
    } catch {
      toast({ title: "Error", description: "Could not save employee.", variant: "destructive" })
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    try {
      await fetch(`/api/hrms/employees?id=${id}`, { method: 'DELETE' })
      setEmployees(prev => prev.filter(e => e.id !== id))
      toast({ title: "Deleted", description: "Employee removed." })
    } catch {
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" })
    }
  }

  const toggleAttendance = async (employeeId: string, currentStatus: string) => {
    const statuses: ('Present' | 'Absent' | 'Late')[] = ['Present', 'Absent', 'Late']
    const nextStatus = statuses[(statuses.indexOf(currentStatus as any) + 1) % 3]
    const date = new Date().toISOString().split('T')[0]

    try {
      const res = await fetch('/api/hrms/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, date, status: nextStatus })
      })
      const updatedLog = await res.json()
      setAttendance(prev => {
        const filtered = prev.filter(a => a.employeeId !== employeeId)
        return [...filtered, updatedLog]
      })
    } catch {
      toast({ title: "Sync Error", description: "Failed to log attendance.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-body">
      <WakingIndicator isVisible={isWaking} />
      
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 rounded-lg p-2 shadow-lg shadow-blue-500/20">
              <RefreshCcw className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">RenderHRMS</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Admin Panel • v2026</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="hidden sm:flex text-slate-500 hover:text-blue-600 transition-colors">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Button size="sm" onClick={() => setEmployeeDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
              <Plus className="h-4 w-4 mr-1" />
              Add Employee
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-white dark:bg-slate-900 border shadow-sm">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="employees" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <Users className="h-4 w-4 mr-2" />
                Staff Directory
              </TabsTrigger>
              <TabsTrigger value="attendance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <CalendarCheck2 className="h-4 w-4 mr-2" />
                Live Attendance
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Backend: Always On
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-80 uppercase tracking-wider">Total Headcount</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{employees.length}</div>
                  <p className="text-xs mt-1 opacity-70">Active Employee Records</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Present Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-blue-600">
                    {attendance.filter(a => a.status === 'Present').length}
                  </div>
                  <p className="text-xs mt-1 text-slate-400">Syncing with FastAPI</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Departments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-slate-800 dark:text-slate-100">
                    {new Set(employees.map(e => e.department)).size}
                  </div>
                  <p className="text-xs mt-1 text-slate-400">PostgreSQL Data Clusters</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Roster Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <EmployeeTable employees={employees.slice(0, 3)} onDelete={handleDeleteEmployee} compact />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="employees">
            <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
              <CardContent className="p-0">
                <EmployeeTable employees={employees} onDelete={handleDeleteEmployee} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm">
              <CardHeader className="border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">Staff Attendance Grid</CardTitle>
                  <div className="text-sm font-medium text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <AttendanceGrid employees={employees} attendance={attendance} onToggle={toggleAttendance} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <EmployeeDialog 
        isOpen={employeeDialogOpen} 
        onClose={() => setEmployeeDialogOpen(false)} 
        onSave={handleAddEmployee} 
      />
    </div>
  )
}
