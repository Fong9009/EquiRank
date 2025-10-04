import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { computeCompanyRisk, upsertCompanyRisk } from '@/lib/risk';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const resolvedParams = await params;
        const id = parseInt(resolvedParams.id);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid Company ID' }, { status: 400 });
        }

        const risk = await computeCompanyRisk(id);
        // Best-effort persist
        await upsertCompanyRisk(id, risk);
        return NextResponse.json(risk, { status: 200 });
    } catch (error) {
        console.error('Error computing company risk:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}


