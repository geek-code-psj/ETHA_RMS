"use client"

import * as React from "react"
import { Task, TaskCard } from "@/components/task-card"
import { WakingIndicator } from "@/components/waking-indicator"
import { TaskDialog } from "@/components/task-dialog"
import { Button } from "@/components/ui/button"
import { Plus, LayoutGrid, ListTodo, CheckCircle, RefreshCcw, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function RenderTasksHome() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isWaking, setIsWaking] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const { toast } = useToast()

  const fetchTasks = React.useCallback(async (isRetry = false) => {
    let timer: NodeJS.Timeout | null = null;
    
    // If the request takes > 2s, show the waking indicator
    timer = setTimeout(() => {
      setIsWaking(true)
    }, 2000)

    try {
      const res = await fetch('/api/tasks')
      
      if (res.status === 503) {
        throw new Error('SERVER_WAKING')
      }
      
      if (!res.ok) throw new Error('FETCH_FAILED')
      
      const data = await res.json()
      setTasks(data)
      setIsWaking(false)
    } catch (err: any) {
      if (err.message === 'SERVER_WAKING') {
        // Retry logic with a small delay
        setIsWaking(true)
        setTimeout(() => fetchTasks(true), 2000)
      } else {
        toast({
          title: "Connection Error",
          description: "Failed to communicate with the Python API backend.",
          variant: "destructive"
        })
      }
    } finally {
      if (timer) clearTimeout(timer)
      setIsLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTasks(prev => prev.filter(t => t.id !== id))
      toast({ title: "Task Deleted", description: "Successfully removed from database." })
    } catch {
      toast({ title: "Error", description: "Failed to delete task.", variant: "destructive" })
    }
  }

  const handleToggle = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    handleSave({ ...task, status: newStatus })
  }

  const handleSave = async (taskData: Partial<Task>) => {
    const method = taskData.id ? 'PUT' : 'POST'
    try {
      const res = await fetch('/api/tasks', {
        method,
        body: JSON.stringify(taskData),
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) throw new Error()
      const savedTask = await res.json()
      
      if (method === 'POST') {
        setTasks(prev => [...prev, savedTask])
        toast({ title: "Task Created", description: "New task added to board." })
      } else {
        setTasks(prev => prev.map(t => t.id === savedTask.id ? savedTask : t))
        toast({ title: "Task Updated", description: "Changes saved to database." })
      }
    } catch {
      toast({ title: "Error", description: "Failed to save task.", variant: "destructive" })
    }
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    pending: tasks.filter(t => t.status !== 'completed').length
  }

  return (
    <div className="min-h-screen bg-background">
      <WakingIndicator isVisible={isWaking} />
      
      {/* Header */}
      <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-1.5 shadow-lg shadow-primary/20">
              <RefreshCcw className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold font-headline tracking-tight">RenderTasks</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => fetchTasks()} disabled={isLoading} className="hidden sm:flex gap-2">
              <Activity className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Sync API
            </Button>
            <Button size="sm" onClick={() => { setEditingTask(null); setDialogOpen(true) }} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <LayoutGrid className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Stored in Render PostgreSQL</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Work</CardTitle>
              <ListTodo className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Pending FastAPI processing</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground mt-1">Successfully deployed</p>
            </CardContent>
          </Card>
        </div>

        {/* Task Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold font-headline">Task Management</h2>
          </div>
          
          {isLoading && tasks.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 rounded-lg border bg-card animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
              <ListTodo className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
              <p className="text-muted-foreground">No tasks found. Create your first task above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onEdit={(t) => { setEditingTask(t); setDialogOpen(true) }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <TaskDialog
        isOpen={dialogOpen}
        task={editingTask}
        onClose={() => { setDialogOpen(false); setEditingTask(null) }}
        onSave={handleSave}
      />
    </div>
  )
}
