
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models, schemas, database
from database import engine, get_db
import time

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="ETHA_RMS API")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your actual Render Static Site URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "online", "timestamp": time.time()}

@app.get("/employees", response_model=list[schemas.Employee])
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

@app.post("/employees", response_model=schemas.Employee)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = models.Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.post("/attendance", response_model=schemas.Attendance)
def log_attendance(attendance: schemas.AttendanceCreate, db: Session = Depends(get_db)):
    db_attendance = models.Attendance(**attendance.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance
