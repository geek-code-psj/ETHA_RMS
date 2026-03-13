
from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional

class EmployeeBase(BaseModel):
    name: str
    email: str
    department: str
    job_title: str
    join_date: date

class EmployeeCreate(EmployeeBase):
    pass

class Employee(EmployeeBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: str

class AttendanceCreate(AttendanceBase):
    pass

class Attendance(AttendanceBase):
    id: int
    timestamp: datetime
    class Config:
        from_attributes = True
