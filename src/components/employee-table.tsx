"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, User, Mail, Calendar, MapPin, ExternalLink } from "lucide-react"
import { Employee } from "@/app/page"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface EmployeeTableProps {
  employees: Employee[]
  onDelete: (id: string) => void
  compact?: boolean
}

export function EmployeeTable({ employees, onDelete, compact }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
          <User className="h-10 w-10 text-slate-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No employees found</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Start building your team by adding your first employee record.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader className={cn("bg-slate-50/50 dark:bg-slate-800/50", compact && "hidden")}>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="w-[300px] font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider">Employee Profile</TableHead>
            {!compact && <TableHead className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider">Department & Role</TableHead>}
            {!compact && <TableHead className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider">Onboarding Date</TableHead>}
            <TableHead className="text-right font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider pr-6">Management</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors border-slate-100 dark:border-slate-800">
              <TableCell className="py-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold shadow-sm">
                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{employee.name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                      <Mail className="h-3 w-3" /> {employee.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              {!compact && (
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Badge variant="secondary" className="w-fit bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800 text-[10px] font-bold uppercase tracking-tight">
                      {employee.department}
                    </Badge>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">{employee.jobTitle}</span>
                  </div>
                </TableCell>
              )}
              {!compact && (
                <TableCell>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {new Date(employee.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </TableCell>
              )}
              <TableCell className="text-right pr-6">
                <div className="flex items-center justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(employee.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
