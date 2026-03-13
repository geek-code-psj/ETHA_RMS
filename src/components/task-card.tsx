"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Circle, Clock, Trash2, Edit2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type Task = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
}

interface TaskCardProps {
  task: Task
  onDelete: (id: string) => void
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
}

export function TaskCard({ task, onDelete, onToggle, onEdit }: TaskCardProps) {
  const StatusIcon = {
    pending: Circle,
    'in-progress': Clock,
    completed: CheckCircle2,
  }[task.status]

  const statusColors = {
    pending: "text-muted-foreground bg-muted",
    'in-progress': "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
    completed: "text-green-600 bg-green-50 dark:bg-green-900/20",
  }

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200 border-border/50">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
            {task.title}
          </CardTitle>
          <CardDescription className="line-clamp-2 text-sm">
            {task.description}
          </CardDescription>
        </div>
        <Badge variant="outline" className={cn("capitalize flex gap-1 items-center font-medium", statusColors[task.status])}>
          <StatusIcon className="h-3 w-3" />
          {task.status.replace('-', ' ')}
        </Badge>
      </CardHeader>
      <CardFooter className="flex justify-end gap-2 pt-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(task)} className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onToggle(task)} className="h-8 w-8 text-muted-foreground hover:text-green-600">
          <CheckCircle2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
