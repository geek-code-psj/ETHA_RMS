
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2, User, Mail, Briefcase, Calendar } from "lucide-react"
import { Employee } from "@/app/page"
import { Badge } from "@/components/ui/badge"

interface EmployeeTableProps {
  employees: Employee[]
  onDelete: (id: string) => void
  compact?: boolean
}

export function EmployeeTable({ employees, onDelete, compact }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="py-12 text-center">
        <User className="h-12 w-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-500">No employee records found in the database.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader className={compact ? "hidden" : ""}>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[250px] font-semibold text-slate-500">Employee</TableHead>
          {!compact && <TableHead className="font-semibold text-slate-500">Department</TableHead>}
          {!compact && <TableHead className="font-semibold text-slate-500">Join Date</TableHead>}
          <TableHead className="text-right font-semibold text-slate-500">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {employee.name.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{employee.name}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Mail className="h-2 w-2" /> {employee.email}
                  </span>
                </div>
              </div>
            </TableCell>
            {!compact && (
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{employee.department}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-tight">{employee.jobTitle}</span>
                </div>
              </TableCell>
            )}
            {!compact && (
              <TableCell>
                <div className="text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {employee.joinDate}
                </div>
              </TableCell>
            )}
            <TableCell className="text-right">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDelete(employee.id)}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
