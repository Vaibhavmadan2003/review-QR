import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/app/lib/firebase-admin';

interface Business {
  id: string;
  name: string;
  description: string;
  googleBusinessUrl: string;
  category: string;
  customCategory?: string;
  location: string;
  reviews: string[];
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('id');

    const db = getDatabase();

    if (businessId) {
      // Get single business
      const snapshot = await db.ref(`businesses/${businessId}`).get();
      if (snapshot.exists()) {
        return NextResponse.json(snapshot.val());
      }
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    // Get all businesses
    const snapshot = await db.ref('businesses').get();
    if (snapshot.exists()) {
      const businesses = snapshot.val();
      const businessArray = Object.values(businesses) as Business[];
      return NextResponse.json(businessArray);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const business: Business = await request.json();

    if (!business.id || !business.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = getDatabase();
    await db.ref(`businesses/${business.id}`).set(business);

    return NextResponse.json({ success: true, business });
  } catch (error) {
    console.error('Error creating business:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const business: Business = await request.json();

    if (!business.id) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const db = getDatabase();
    await db.ref(`businesses/${business.id}`).update(business);

    return NextResponse.json({ success: true, business });
  } catch (error) {
    console.error('Error updating business:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('id');

    if (!businessId) {
      return NextResponse.json({ error: 'Business ID required' }, { status: 400 });
    }

    const db = getDatabase();
    await db.ref(`businesses/${businessId}`).remove();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting business:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
