
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { WakingIndicator } from "@/components/waking-indicator"
import { EmployeeTable } from "@/components/employee-table"
import { AttendanceGrid } from "@/components/attendance-grid"
import { TaskCard, Task } from "@/components/task-card"
import { TaskDialog } from "@/components/task-dialog"
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
  UserPlus,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Clock
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
import { collection, doc, query, where, orderBy } from "firebase/firestore"
import { 
  addDocumentNonBlocking, 
  deleteDocumentNonBlocking, 
  setDocumentNonBlocking,
  updateDocumentNonBlocking
} from "@/firebase/non-blocking-updates"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

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
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [currentDate, setCurrentDate] = React.useState<string>("")

  // Hydration-safe date initialization
  React.useEffect(() => {
    setCurrentDate(new Date().toISOString().split('T')[0])
    // Simulate Render connection retry / handshake period
    const timer = setTimeout(() => setIsWaking(false), 2000)
    return () => clearTimeout(timer)
  }, [])

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

  const attendanceQuery = useMemoFirebase(() => {
    if (!db || !user || !currentDate) return null
    return query(
      collection(db, "users", user.uid, "attendance"),
      where("date", "==", currentDate)
    )
  }, [db, user, currentDate])

  const tasksQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "tasks"),
      orderBy("createdAt", "desc")
    )
  }, [db, user])

  const { data: employeesData, isLoading: empsLoading } = useCollection<Employee>(employeesQuery)
  const { data: attendanceData, isLoading: attsLoading } = useCollection<AttendanceLog>(attendanceQuery)
  const { data: tasksData, isLoading: tasksLoading } = useCollection<Task>(tasksQuery)

  const employees = employeesData ?? []
  const attendance = attendanceData ?? []
  const tasks = tasksData ?? []

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
    if (!user || !db || !currentDate) return
    const statuses: ('Present' | 'Absent' | 'Late')[] = ['Present', 'Absent', 'Late']
    const nextStatus = statuses[(statuses.indexOf(currentStatus as any) + 1) % 3]
    
    const attendanceId = `${employeeId}_${currentDate}`
    const docRef = doc(db, "users", user.uid, "attendance", attendanceId)
    
    setDocumentNonBlocking(docRef, {
      employeeId,
      date: currentDate,
      status: nextStatus,
      timestamp: new Date().toISOString()
    }, { merge: true })
  }

  const handleSaveTask = (data: Partial<Task>) => {
    if (!user || !db) return
    if (data.id) {
      const docRef = doc(db, "users", user.uid, "tasks", data.id)
      updateDocumentNonBlocking(docRef, data)
      toast({ title: "Task Updated", description: "The task has been successfully modified." })
    } else {
      const colRef = collection(db, "users", user.uid, "tasks")
      addDocumentNonBlocking(colRef, {
        ...data,
        createdAt: new Date().toISOString()
      })
      toast({ title: "Task Created", description: "New internal objective added." })
    }
  }

  const handleToggleTaskStatus = (task: Task) => {
    if (!user || !db) return
    const nextStatus = task.status === 'completed' ? 'pending' : 'completed'
    const docRef = doc(db, "users", user.uid, "tasks", task.id)
    updateDocumentNonBlocking(docRef, { status: nextStatus })
  }

  const handleDeleteTask = (id: string) => {
    if (!user || !db) return
    const docRef = doc(db, "users", user.uid, "tasks", id)
    deleteDocumentNonBlocking(docRef)
    toast({ variant: "destructive", title: "Task Deleted", description: "The task has been removed." })
  }

  const handleSignOut = () => {
    auth.signOut()
    router.push("/login")
  }

  if (isUserLoading || !user) return null

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <WakingIndicator isVisible={isWaking} />
      
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 rounded-xl p-2 shadow-lg shadow-blue-600/20">
              <RefreshCcw className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">RenderHRMS</h1>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Session Active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 mr-4 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {user.isAnonymous ? 'Guest Admin' : user.email?.split('@')[0]}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-500 hover:text-blue-600 h-9">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
            <Button size="sm" onClick={() => setEmployeeDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-sm h-9">
              <Plus className="h-4 w-4 mr-1" />
              Add Staff
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <TabsList className="bg-white dark:bg-slate-900 border p-1 rounded-xl shadow-sm h-auto overflow-x-auto">
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
              <TabsTrigger value="tasks" className="rounded-lg px-4 py-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                <ClipboardList className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border shadow-sm">
              <div className="h-2 w-2 rounded-full bg-blue-600" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 tracking-wide">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-8 outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden">
                <CardHeader className="pb-2">
                  <CardDescription className="text-blue-100 font-bold uppercase tracking-wider text-[10px]">Active Roster</CardDescription>
                  <CardTitle className="text-4xl font-black">{empsLoading ? <Skeleton className="h-10 w-16 bg-white/20" /> : employees.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-blue-100 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>Growth monitoring enabled</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Present Today</CardDescription>
                  <CardTitle className="text-4xl font-black text-slate-900 dark:text-white">
                    {attsLoading ? <Skeleton className="h-10 w-16" /> : attendance.filter(a => a.status === 'Present').length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <UserCheck className="h-3 w-3" />
                    <span>Real-time status sync</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pending Tasks</CardDescription>
                  <CardTitle className="text-4xl font-black text-slate-900 dark:text-white">
                    {tasksLoading ? <Skeleton className="h-10 w-16" /> : tasks.filter(t => t.status !== 'completed').length}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                    <Clock className="h-3 w-3" />
                    <span>Admin priorities active</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-white dark:bg-slate-900">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">Task Completion</CardDescription>
                  <CardTitle className="text-4xl font-black text-slate-900 dark:text-white">
                    {tasksLoading ? <Skeleton className="h-10 w-16" /> : tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100) : 0}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Objective progress</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-none shadow-md overflow-hidden">
                <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-800/50 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base font-bold">Recent Staff Additions</CardTitle>
                      <CardDescription className="text-xs">Latest organizational onboarding</CardDescription>
                    </div>
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
                  {employees.length === 0 && !empsLoading && (
                    <div className="p-12 text-center text-slate-400 text-sm font-medium">
                      No staff records available.
                    </div>
                  )}
                  {employees.length > 5 && (
                    <div className="p-4 border-t bg-slate-50/30 dark:bg-slate-800/30 text-center">
                      <Button variant="link" size="sm" className="text-blue-600 font-bold text-xs" onClick={() => router.push("#employees")}>
                        View Full Directory <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="bg-white dark:bg-slate-900 border-none shadow-md h-fit">
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-base font-bold">Pipeline Overview</CardTitle>
                    <CardDescription className="text-xs">Top priorities</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {tasksLoading ? (
                      [1, 2].map(i => <Skeleton key={i} className="h-16 w-full" />)
                    ) : tasks.length > 0 ? (
                      tasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg border bg-slate-50/50 dark:bg-slate-800/50">
                          <div className={cn(
                            "mt-1 p-1 rounded-full",
                            task.status === 'completed' ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                          )}>
                            {task.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold truncate">{task.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{task.description}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-xs text-slate-400 font-medium">
                        No active tasks in pipeline.
                      </div>
                    )}
                    <Button variant="outline" className="w-full h-10 text-xs font-bold mt-2" onClick={() => setTaskDialogOpen(true)}>
                      <Plus className="h-3 w-3 mr-2" />
                      Create Objective
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-900 border-none shadow-md h-fit">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
                    <CardDescription className="text-xs">Common HR procedures</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 h-11 text-xs font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setEmployeeDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 text-blue-600" />
                      Onboard New Staff
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 h-11 text-xs font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => router.push("#attendance")}>
                      <CalendarCheck2 className="h-4 w-4 text-emerald-600" />
                      Review Daily Logs
                    </Button>
                    <div className="mt-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <p className="text-[10px] text-blue-700 dark:text-blue-400 font-bold uppercase tracking-widest mb-1">System Health</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Securely connected to Firestore. Data parity verified.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="employees" className="outline-none">
            <Card className="bg-white dark:bg-slate-900 border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-white dark:bg-slate-900 border-b py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Staff Directory</CardTitle>
                    <CardDescription className="text-sm">Manage employee profiles and organizational roles</CardDescription>
                  </div>
                  <Button onClick={() => setEmployeeDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 h-10 px-6 font-bold shadow-md shadow-blue-600/20">
                    <Plus className="h-4 w-4 mr-2" />
                    New Hire
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

          <TabsContent value="attendance" className="outline-none">
            <Card className="bg-white dark:bg-slate-900 border-none shadow-lg overflow-hidden">
              <CardHeader className="bg-white dark:bg-slate-900 border-b py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-black text-slate-900 dark:text-white">Daily Attendance</CardTitle>
                    <CardDescription className="text-sm">Record and sync daily status for all active staff</CardDescription>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl border border-blue-100 dark:border-blue-800 text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">
                    {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
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

          <TabsContent value="tasks" className="outline-none">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Internal Objectives</h2>
                  <p className="text-sm text-slate-500">Track HR priorities and onboarding requirements</p>
                </div>
                <Button onClick={() => setTaskDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700 font-bold px-6">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              </div>

              {tasksLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full" />)}
                </div>
              ) : tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tasks.map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onDelete={handleDeleteTask} 
                      onToggle={handleToggleTaskStatus}
                      onEdit={(task) => {
                        setSelectedTask(task)
                        setTaskDialogOpen(true)
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-white/50 dark:bg-slate-900/50">
                  <div className="h-20 w-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-10 w-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No tasks found</h3>
                  <p className="text-sm text-slate-500 mb-6">Start by creating a new objective for your HR portal.</p>
                  <Button onClick={() => setTaskDialogOpen(true)} variant="outline">Create Your First Task</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <EmployeeDialog 
        isOpen={employeeDialogOpen} 
        onClose={() => setEmployeeDialogOpen(false)} 
        onSave={handleAddEmployee} 
      />

      <TaskDialog 
        task={selectedTask}
        isOpen={taskDialogOpen}
        onClose={() => {
          setTaskDialogOpen(false)
          setSelectedTask(null)
        }}
        onSave={handleSaveTask}
      />
      
      <footer className="container mx-auto px-4 py-12 text-center border-t mt-12 bg-white/50 max-w-7xl">
        <div className="flex items-center justify-center gap-2 mb-4">
          <RefreshCcw className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tighter">RenderHRMS <span className="text-blue-600">v1.1</span></span>
        </div>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Optimized for Render Cloud High Availability</p>
      </footer>
    </div>
  )
}
