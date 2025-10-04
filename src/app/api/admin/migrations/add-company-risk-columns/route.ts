import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeSingleQuery } from '@/database';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Add columns if not exist: risk_score (INT) and risk_band (ENUM)
    try {
      await executeSingleQuery(`ALTER TABLE company_values ADD COLUMN IF NOT EXISTS risk_score INT NULL`);
    } catch (e: any) {
      const msg = e?.sqlMessage || e?.message || '';
      if (!/Duplicate column|exists|Unknown/i.test(msg)) throw e;
    }

    try {
      await executeSingleQuery(`ALTER TABLE company_values ADD COLUMN IF NOT EXISTS risk_band ENUM('low','medium','high') NULL`);
    } catch (e: any) {
      const msg = e?.sqlMessage || e?.message || '';
      if (!/Duplicate column|exists|Unknown/i.test(msg)) throw e;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Migration add company risk columns failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


