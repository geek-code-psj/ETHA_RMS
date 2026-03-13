
from sqlalchemy import Column, Integer, String, Date, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base

class Employee(Base):
    __tablename__ = "employees"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    department = Column(String)
    job_title = Column(String)
    join_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"))
    date = Column(Date, nullable=False)
    status = Column(String) # Present, Absent, Late
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
