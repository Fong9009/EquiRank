import { NextRequest, NextResponse } from 'next/server';
import { updateUserByID } from '@/database/user';
import { auth } from '@/lib/auth';

export async function PUT(
    request: NextRequest,
    { params }: { params: Record<string, string> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if ((session.user as any).userType !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden: Admin access required' },
                { status: 403 }
            );
        }

        const userId = parseInt(params.id, 10);
        const body = await request.json();

        const updatedUser = await updateUserByID(
            body.email,
            body.first_name,
            body.last_name,
            body.phone,
            body.address,
            userId
        );

        return NextResponse.json(updatedUser, { status: 200 });
    } catch (err) {
        console.error('Error updating user:', err);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
