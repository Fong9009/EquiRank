import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllArchivedUsers } from '@/database/user';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if ((session.user as any).userType !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const users = await getAllArchivedUsers();
    return NextResponse.json(users, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch archived users' }, { status: 500 });
  }
}


