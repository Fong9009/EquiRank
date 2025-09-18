import { NextRequest, NextResponse } from 'next/server';
import {insertRecentSearch} from "@/database/recentSearches";
import {getLenderID} from "@/database/profile";
import {auth} from "@/lib/auth";

export async function PUT(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { loanId } = body;

        if (!loanId) {
            return NextResponse.json({
                success: false,
                message: 'loan Id is required'
            }, { status: 400 });
        }

        const userId = parseInt(session.user.id);
        const lenderID = await getLenderID(userId);
        if(!lenderID) {
            return NextResponse.json({ error: 'Lender Profile Not Found' }, { status: 404 });
        }

        const insertSearch = await insertRecentSearch(lenderID.id, loanId);
        if (!insertSearch.success) {
            return NextResponse.json({ error: 'Recent Search Cannot be Inserted' }, { status: 404 });
        } else {
            return NextResponse.json(
                { message: 'Search updated successfully' },
                { status: 200 }
            );
        }

    } catch(error) {
        console.error('Error fetching data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}