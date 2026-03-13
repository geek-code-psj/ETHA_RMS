
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, User, Mail, Calendar, ExternalLink, UserCircle2 } from "lucide-react"
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
      <div className="py-24 text-center flex flex-col items-center justify-center space-y-6">
        <div className="h-24 w-24 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center shadow-inner">
          <UserCircle2 className="h-12 w-12 text-slate-200 dark:text-slate-700" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">The directory is empty</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">No staff records found. Click "Add Staff" to begin building your organization.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader className={cn("bg-slate-50/50 dark:bg-slate-800/50 border-y", compact && "hidden")}>
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="w-[300px] font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest py-4">Employee Profile</TableHead>
            {!compact && <TableHead className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest py-4">Department & Role</TableHead>}
            {!compact && <TableHead className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest py-4">Onboarding</TableHead>}
            <TableHead className="text-right font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-widest py-4 pr-8">Management</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors border-slate-100 dark:border-slate-800">
              <TableCell className="py-5">
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black shadow-sm group-hover:border-blue-200 transition-colors">
                    {employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight">{employee.name}</span>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                      <Mail className="h-3 w-3 opacity-70" /> {employee.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              {!compact && (
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0">
                      {employee.department}
                    </Badge>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">{employee.jobTitle}</span>
                  </div>
                </TableCell>
              )}
              {!compact && (
                <TableCell>
                  <div className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-slate-300" />
                    {new Date(employee.joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </TableCell>
              )}
              <TableCell className="text-right pr-8">
                <div className="flex items-center justify-end gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onDelete(employee.id)}
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
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
