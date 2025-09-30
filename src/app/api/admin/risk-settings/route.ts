import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRiskSettings, upsertRiskSettings } from '@/database/riskSettings';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.userType !== 'admin' || session.user.isSuperAdmin !== true) {
    return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
  }
  const rec = await getRiskSettings();
  return NextResponse.json({ settings: rec?.settings || null, updated_at: rec?.updated_at || null });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.userType !== 'admin' || session.user.isSuperAdmin !== true) {
    return NextResponse.json({ error: 'Super admin only' }, { status: 403 });
  }
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    // Basic validation
    const settings = body.settings ?? body;
    const ok = await upsertRiskSettings(settings);
    return NextResponse.json({ success: ok });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}


