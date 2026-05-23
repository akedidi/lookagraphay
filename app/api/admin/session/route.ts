import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/admin-auth';

export async function GET(req: NextRequest) {
  const authenticated = await isAdminAuthenticated(req);
  return NextResponse.json({ authenticated });
}
