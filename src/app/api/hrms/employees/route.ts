
import { NextResponse } from 'next/server';

// Simulation of DB state and Cold Start
let employees = [
  { id: '1', name: 'Alice Johnson', email: 'alice@company.com', department: 'Engineering', jobTitle: 'Senior Dev', joinDate: '2023-01-15' },
  { id: '2', name: 'Bob Smith', email: 'bob@company.com', department: 'Product', jobTitle: 'PM', joinDate: '2023-05-10' },
  { id: '3', name: 'Charlie Davis', email: 'charlie@company.com', department: 'Design', jobTitle: 'UI/UX Designer', joinDate: '2023-08-22' },
];

let lastWokeAt = 0;
const COLD_START_THRESHOLD = 30000; // 30s simulation

async function handleDatabaseConnection() {
  const isCold = Date.now() - lastWokeAt > COLD_START_THRESHOLD;
  if (isCold) {
    lastWokeAt = Date.now();
    // Simulate Render connection retry / exponential backoff delay
    await new Promise(resolve => setTimeout(resolve, 4000));
    return true; 
  }
  await new Promise(resolve => setTimeout(resolve, 300));
  return false;
}

export async function GET() {
  const wasCold = await handleDatabaseConnection();
  if (wasCold && Math.random() > 0.4) {
    return new NextResponse('Database waking up...', { status: 503 });
  }
  return NextResponse.json(employees);
}

export async function POST(request: Request) {
  await handleDatabaseConnection();
  const body = await request.json();
  const newEmployee = {
    id: Math.random().toString(36).substring(7),
    ...body,
    createdAt: new Date().toISOString()
  };
  employees.push(newEmployee);
  return NextResponse.json(newEmployee);
}

export async function DELETE(request: Request) {
  await handleDatabaseConnection();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  employees = employees.filter(e => e.id !== id);
  return NextResponse.json({ success: true });
}
