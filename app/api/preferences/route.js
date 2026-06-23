import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserPreference from '@/models/UserPreference';

export async function POST(request) {
  await dbConnect();

  try {
    const { userId, preferredLanguage, city, state, country, locationPermission } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const preference = await UserPreference.findOneAndUpdate(
      { userId },
      {
        preferredLanguage,
        city,
        state,
        country,
        locationPermission,
      },
      { new: true, upsert: true }
    );

    return NextResponse.json({ success: true, preference });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const preference = await UserPreference.findOne({ userId });

    return NextResponse.json({ success: true, preference });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
