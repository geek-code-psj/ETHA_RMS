"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Clock, UserCheck, ChevronRight } from "lucide-react"
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
      <div className="py-24 text-center flex flex-col items-center justify-center space-y-4">
        <div className="h-20 w-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
          <CalendarCheck2 className="h-10 w-10 text-slate-300" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Roster is empty</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">Add staff members to begin tracking daily attendance status.</p>
        </div>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
        <TableRow className="border-none hover:bg-transparent">
          <TableHead className="w-[350px] font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider">Employee Name</TableHead>
          <TableHead className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider">Current Status</TableHead>
          <TableHead className="text-right font-bold text-slate-600 dark:text-slate-400 uppercase text-[11px] tracking-wider pr-6">Activity Control</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => {
          const status = getStatus(employee.id)
          
          return (
            <TableRow key={employee.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-slate-100 dark:border-slate-800">
              <TableCell className="py-5">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 dark:text-slate-100">{employee.name}</span>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">{employee.department}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm border",
                  status === 'Present' && "bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                  status === 'Absent' && "bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
                  status === 'Late' && "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                )}>
                  {status === 'Present' && <CheckCircle2 className="h-4 w-4" />}
                  {status === 'Absent' && <XCircle className="h-4 w-4" />}
                  {status === 'Late' && <Clock className="h-4 w-4" />}
                  {status}
                </div>
              </TableCell>
              <TableCell className="text-right pr-6">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onToggle(employee.id, status)}
                  className="bg-white hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:hover:bg-blue-700 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs h-9 px-4 transition-all"
                >
                  Cycle Status <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

import { CalendarCheck2 } from "lucide-react"
