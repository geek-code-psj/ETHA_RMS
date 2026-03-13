"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { WakingIndicator } from "@/components/waking-indicator"
import { EmployeeTable } from "@/components/employee-table"
import { AttendanceGrid } from "@/components/attendance-grid"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, CalendarCheck2, LayoutDashboard, RefreshCcw, LogOut, Plus, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { EmployeeDialog } from "@/components/employee-dialog"
import { 
  useUser, 
  useAuth, 
  useFirestore, 
  useCollection, 
  useMemoFirebase 
} from "@/firebase"
import { collection, doc, query, where } from "firebase/firestore"
import { 
  addDocumentNonBlocking, 
  deleteDocumentNonBlocking, 
  setDocumentNonBlocking 
} from "@/firebase/non-blocking-updates"

export type Employee = {
  id: string
  name: string
  email: string
  department: string
  jobTitle: string
  joinDate: string
}

export type AttendanceLog = {
  id: string
  employeeId: string
  status: 'Present' | 'Absent' | 'Late'
  date: string
}

export default function HRMSDashboard() {
  const { user, isUserLoading } = useUser()
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const [isWaking, setIsWaking] = React.useState(true)
  const [employeeDialogOpen, setEmployeeDialogOpen] = React.useState(false)

  // Redirect if not logged in
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  // Memoized Firestore Queries
  const employeesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "employees")
  }, [db, user])

  const todayDate = new Date().toISOString().split('T')[0]
  const attendanceQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "attendance"),
      where("date", "==", todayDate)
    )
  }, [db, user, todayDate])

  const { data: employees = [], isLoading: empsLoading } = useCollection<Employee>(employeesQuery)
  const { data: attendance = [], isLoading: attsLoading } = useCollection<AttendanceLog>(attendanceQuery)

  // Simulation effect for "Waking Up" UX
  React.useEffect(() => {
    const timer = setTimeout(() => setIsWaking(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  const handleAddEmployee = (data: Partial<Employee>) => {
    if (!user || !db) return
    const colRef = collection(db, "users", user.uid, "employees")
    addDocumentNonBlocking(colRef, {
      ...data,
      createdAt: new Date().toISOString()
    })
    toast({ title: "Success", description: "Employee record created." })
  }

  const handleDeleteEmployee = (id: string) => {
    if (!user || !db) return
    const docRef = doc(db, "users", user.uid, "employees", id)
    deleteDocumentNonBlocking(docRef)
    toast({ title: "Deleted", description: "Employee removed from roster." })
  }

  const toggleAttendance = (employeeId: string, currentStatus: string) => {
    if (!user || !db) return
    const statuses: ('Present' | 'Absent' | 'Late')[] = ['Present', 'Absent', 'Late']
    const nextStatus = statuses[(statuses.indexOf(currentStatus as any) + 1) % 3]
    
    // Use a composite ID for daily attendance tracking: employeeId_date
    const attendanceId = `${employeeId}_${todayDate}`
    const docRef = doc(db, "users", user.uid, "attendance", attendanceId)
    
    setDocumentNonBlocking(docRef, {
      employeeId,
      date: todayDate,
      status: nextStatus,
      timestamp: new Date().toISOString()
    }, { merge: true })
  }

  const handleSignOut = () => {
    auth.signOut()
    router.push("/login")
  }

  if (isUserLoading || !user) return null

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
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                Verified Admin: {user.email?.split('@')[0]}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="hidden sm:flex text-slate-500 hover:text-blue-600 transition-colors">
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
              Identity: {user.isAnonymous ? 'Guest Mode' : 'Authenticated'}
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
                  <p className="text-xs mt-1 opacity-70">Active Roster Records</p>
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
                  <p className="text-xs mt-1 text-slate-400">Live Status Sync</p>
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
                  <p className="text-xs mt-1 text-slate-400">Scoped to Your Account</p>
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
