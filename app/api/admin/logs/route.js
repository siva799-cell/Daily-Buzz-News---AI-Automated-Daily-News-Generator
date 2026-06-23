import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import FetchLog from '@/models/FetchLog';
import DuplicateCheckLog from '@/models/DuplicateCheckLog';
import { verifyAdminToken } from '@/lib/adminAuth';

export async function GET(request) {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ success: false, error: 'Unauthorized. Admin access required.' }, { status: 401 });
  }

  await dbConnect();

  try {
    const fetchLogs = await FetchLog.find().sort({ createdAt: -1 }).limit(20);
    const duplicateLogs = await DuplicateCheckLog.find().sort({ checkedAt: -1 }).limit(20);

    return NextResponse.json({
      success: true,
      fetchLogs,
      duplicateLogs,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
