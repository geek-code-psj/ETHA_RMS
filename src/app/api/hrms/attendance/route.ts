
import { NextResponse } from 'next/server';

// Simulation of daily attendance
let attendanceLogs: any[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  
  const dailyLogs = attendanceLogs.filter(log => log.date === date);
  return NextResponse.json(dailyLogs);
}

export async function POST(request: Request) {
  const body = await request.json(); // { employeeId, date, status }
  
  // Update or Create
  const index = attendanceLogs.findIndex(log => log.employeeId === body.employeeId && log.date === body.date);
  
  const logEntry = {
    id: index >= 0 ? attendanceLogs[index].id : Math.random().toString(36).substring(7),
    ...body,
    timestamp: new Date().toISOString()
  };

  if (index >= 0) {
    attendanceLogs[index] = logEntry;
  } else {
    attendanceLogs.push(logEntry);
  }

  return NextResponse.json(logEntry);
}
