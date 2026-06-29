import { NextResponse } from 'next/server';

// Simple in-memory storage (Vercel will reset on redeploy, but works for demo)
const businesses: Record<string, any> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    // Get single business
    return NextResponse.json(businesses[id] || null);
  }

  // Get all businesses
  return NextResponse.json(Object.values(businesses));
}

export async function POST(request: Request) {
  const data = await request.json();
  
  if (!data.id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  businesses[data.id] = data;
  return NextResponse.json({ success: true, business: data });
}

export async function PUT(request: Request) {
  const data = await request.json();
  
  if (!data.id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  businesses[data.id] = { ...businesses[data.id], ...data };
  return NextResponse.json({ success: true, business: businesses[data.id] });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  delete businesses[id];
  return NextResponse.json({ success: true });
}
