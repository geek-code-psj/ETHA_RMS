
"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, UserCheck } from "lucide-react"
import { Employee, AttendanceLog } from "@/app/page"
import { cn } from "@/lib/utils"

interface AttendanceGridProps {
  employees: Employee[]
  attendance: AttendanceLog[]
  onToggle: (employeeId: string, currentStatus: string) => void
}

export function AttendanceGrid({ employees, attendance, onToggle }: AttendanceGridProps) {
  const getStatus = (empId: string) => {
    return attendance.find(a => a.employeeId === empId)?.status || 'Absent'
  }

  if (employees.length === 0) {
    return (
      <div className="py-12 text-center">
        <UserCheck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
        <p className="text-slate-500">Add employees to start tracking attendance.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-[300px] font-semibold text-slate-500">Employee Name</TableHead>
          <TableHead className="font-semibold text-slate-500">Status</TableHead>
          <TableHead className="text-right font-semibold text-slate-500">Quick Toggle</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const status = getStatus(employee.id)
          
          return (
            <TableRow key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{employee.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{employee.department}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  status === 'Present' && "bg-green-100 text-green-700",
                  status === 'Absent' && "bg-red-100 text-red-700",
                  status === 'Late' && "bg-amber-100 text-amber-700"
                )}>
                  {status === 'Present' && <CheckCircle2 className="h-3.5 w-3.5" />}
                  {status === 'Absent' && <XCircle className="h-3.5 w-3.5" />}
                  {status === 'Late' && <Clock className="h-3.5 w-3.5" />}
                  {status}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onToggle(employee.id, status)}
                  className="bg-white hover:bg-slate-100 border-slate-200 text-slate-600 h-8 shadow-sm"
                >
                  Cycle Status
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
