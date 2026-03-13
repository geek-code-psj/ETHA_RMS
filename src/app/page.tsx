"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { WakingIndicator } from "@/components/waking-indicator"
import { EmployeeTable } from "@/components/employee-table"
import { AttendanceGrid } from "@/components/attendance-grid"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  CalendarCheck2, 
  LayoutDashboard, 
  RefreshCcw, 
  LogOut, 
  Plus, 
  ShieldCheck, 
  TrendingUp,
  UserCheck,
  UserPlus
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"

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

  const { data: employeesData, isLoading: empsLoading } = useCollection<Employee>(employeesQuery)
  const { data: attendanceData, isLoading: attsLoading } = useCollection<AttendanceLog>(attendanceQuery)

  const employees = employeesData ?? []
  const attendance = attendanceData ?? []

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
    toast({ title: "Employee Added", description: `${data.name} has been added to the roster.` })
  }

  const handleDeleteEmployee = (id: string) => {
    if (!user || !db) return
    const docRef = doc(db, "users", user.uid, "employees", id)
    deleteDocumentNonBlocking(docRef)
    toast({ variant: "destructive", title: "Employee Removed", description: "The record has been permanently deleted." })
  }

  const toggleAttendance = (employeeId: string, currentStatus: string) => {
    if (!user || !db) return
    const statuses: ('Present' | 'Absent' | 'Late')[] = ['Present', 'Absent', 'Late']
    const nextStatus = statuses[(statuses.indexOf(currentStatus as any) + 1) % 3]
    
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 font-body">
      <WakingIndicator isVisible={isWaking} />
      
      <header className="sticky top-0 z-40 w-full border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-500/30">
              <RefreshCcw className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">RenderHRMS</h1>
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                Admin: {user.email?.split('@')[0]}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-500 hover:text-blue-600">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Button size="sm" onClick={() => setEmployeeDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-md">
              <Plus className="h-4 w-4 mr-1" />
              Add Staff
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <TabsList className="bg-white dark:bg-slate-900 border p-1 rounded-xl shadow-sm">
              <TabsTrigger value="dashboard" className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="employees" className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <Users className="h-4 w-4 mr-2" />
                Employees
              </TabsTrigger>
              <TabsTrigger value="attendance" className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <CalendarCheck2 className="h-4 w-4 mr-2" />
                Attendance
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Identity: {user.isAnonymous ? 'Guest Admin' : 'Secure Session'}
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Users className="h-24 w-24" />
                </div>
                <CardHeader className="pb-2">
                  <CardDescription className="text-blue-100 font-medium uppercase tracking-wider text-xs">Total Roster</CardDescription>
                  <CardTitle className="text-4xl font-extrabold">{empsLoading ? <Skeleton className="h-10 w-16 bg-white/20" /> : employees.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-blue-100">
                    <TrendingUp className="h-3 w-3" />
                    <span>Active employees under management</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">Present Today</CardDescription>
                  <CardTitle className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {attsLoading ? <Skeleton className="h-10 w-16" /> : attendance.filter(a => a.status === 'Present').length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                    <UserCheck className="h-3 w-3" />
                    <span>Real-time status sync active</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider text-xs">Departments</CardDescription>
                  <CardTitle className="text-4xl font-extrabold text-slate-900 dark:text-white">
                    {empsLoading ? <Skeleton className="h-10 w-16" /> : new Set(employees.map(e => e.department)).size}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                    <LayoutDashboard className="h-3 w-3" />
                    <span>Distinct operational groups</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-none shadow-md overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Recent Staff Activity</CardTitle>
                      <CardDescription>Latest additions to your organization</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs h-8" onClick={() => router.push("#employees")}>
                      View All
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {empsLoading ? (
                    <div className="p-8 space-y-4">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <EmployeeTable employees={employees.slice(0, 5)} onDelete={handleDeleteEmployee} compact />
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900 border-none shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                  <CardDescription>Common HR operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => setEmployeeDialogOpen(true)}>
                    <UserPlus className="h-4 w-4 text-blue-600" />
                    Hire New Employee
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-3 h-12" onClick={() => router.push("#attendance")}>
                    <CalendarCheck2 className="h-4 w-4 text-green-600" />
                    Manage Today's Logs
                  </Button>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-dashed mt-4 text-center">
                    <p className="text-xs text-slate-500 font-medium">All data is encrypted and synced to Render Cloud PostgreSQL simulation.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="employees">
            <Card className="bg-white dark:bg-slate-900 border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl">Staff Directory</CardTitle>
                    <CardDescription>Comprehensive list of all registered employees</CardDescription>
                  </div>
                  <Button onClick={() => setEmployeeDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add New Employee
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {empsLoading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <EmployeeTable employees={employees} onDelete={handleDeleteEmployee} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card className="bg-white dark:bg-slate-900 border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl">Attendance Management</CardTitle>
                    <CardDescription>Record and update daily status logs</CardDescription>
                  </div>
                  <div className="bg-white dark:bg-slate-800 px-4 py-1.5 rounded-lg border shadow-sm text-sm font-semibold text-blue-600">
                    {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {attsLoading || empsLoading ? (
                  <div className="p-8 space-y-4">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <AttendanceGrid employees={employees} attendance={attendance} onToggle={toggleAttendance} />
                )}
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
