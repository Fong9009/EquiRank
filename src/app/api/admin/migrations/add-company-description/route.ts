import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { executeSingleQuery } from '@/database';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.userType !== 'admin') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Add company_description column to borrower_profiles table
    const sql = `ALTER TABLE borrower_profiles ADD COLUMN IF NOT EXISTS company_description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Description of the company'`;
    
    try {
      await executeSingleQuery(sql);
    } catch (e: any) {
      // If IF NOT EXISTS unsupported in some environments, fall back to checking error code
      const message = e?.sqlMessage || e?.message || '';
      if (!/Duplicate column|exists/i.test(message)) {
        throw e;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Migration add company_description failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
