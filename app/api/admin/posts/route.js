import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import NewsPost from '@/models/NewsPost';
import { verifyAdminToken } from '@/lib/adminAuth';

export async function GET(request) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending'; // default list pending

    const posts = await NewsPost.find({ status })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, posts });
  } catch (error) {
    console.error('Admin fetch posts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
