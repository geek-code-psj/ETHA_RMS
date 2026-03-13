import { NextResponse } from 'next/server';

// Simulating a persistent-ish state for the demo
let tasks = [
  { id: '1', title: 'Implement Backend Waking UI', description: 'Show progress bar on 503 or slow response', status: 'completed' },
  { id: '2', title: 'Set up Render PostgreSQL', description: 'Configure connection with retry logic', status: 'in-progress' },
  { id: '3', title: 'FastAPI Schema Definition', description: 'Use Pydantic for robust data exchange', status: 'pending' },
];

let lastWokeAt = 0;
const COLD_START_THRESHOLD = 15000; // 15 seconds simulation

async function simulateDatabaseDelay() {
  const isCold = Date.now() - lastWokeAt > COLD_START_THRESHOLD;
  
  if (isCold) {
    // First request after a while "wakes" the server
    lastWokeAt = Date.now();
    await new Promise(resolve => setTimeout(resolve, 3500));
    return true; // was cold
  }
  
  // Normal small delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return false;
}

export async function GET() {
  const wasCold = await simulateDatabaseDelay();
  
  if (wasCold) {
    // Occasional 503 during cold start simulation
    if (Math.random() > 0.5) {
      return new NextResponse('Server Waking Up', { status: 503 });
    }
  }

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  await simulateDatabaseDelay();
  const body = await request.json();
  const newTask = {
    id: Math.random().toString(36).substring(7),
    ...body,
    status: body.status || 'pending'
  };
  tasks.push(newTask);
  return NextResponse.json(newTask);
}

export async function PUT(request: Request) {
  await simulateDatabaseDelay();
  const body = await request.json();
  tasks = tasks.map(t => t.id === body.id ? { ...t, ...body } : t);
  return NextResponse.json(body);
}

export async function DELETE(request: Request) {
  await simulateDatabaseDelay();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  tasks = tasks.filter(t => t.id !== id);
  return NextResponse.json({ success: true });
}
