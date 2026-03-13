
"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Employee } from "@/app/page"

interface EmployeeDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<Employee>) => void
}

export function EmployeeDialog({ isOpen, onClose, onSave }: EmployeeDialogProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    department: "Engineering",
    jobTitle: "",
    joinDate: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create a new record in the Render PostgreSQL database.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                required 
                value={formData.name}
                onChange={e => setFormData(prev => ({...prev, name: e.target.value}))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData(prev => ({...prev, email: e.target.value}))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Select value={formData.department} onValueChange={v => setFormData(prev => ({...prev, department: v}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Engineering">Engineering</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Human Resources">Human Resources</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input 
                id="jobTitle" 
                value={formData.jobTitle}
                onChange={e => setFormData(prev => ({...prev, jobTitle: e.target.value}))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Input 
                id="joinDate" 
                type="date" 
                value={formData.joinDate}
                onChange={e => setFormData(prev => ({...prev, joinDate: e.target.value}))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Sync to Backend</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
