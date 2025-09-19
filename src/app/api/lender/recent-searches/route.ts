import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {getLenderID} from "@/database/profile";
import {getAllSearches} from "@/database/recentSearches";

export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is a lender
        if (session.user.userType !== 'lender') {
            return NextResponse.json(
                { error: 'Access denied. Only lenders can view recent searches.' },
                { status: 403 }
            );
        }
        const userId = parseInt(session.user.id);
        const lenderId = await getLenderID(userId);
        if(!lenderId){
            return NextResponse.json(
                { error: 'Lender ID Unavailable' },
                { status: 404 }
            );
        }

        const recentSearches = await getAllSearches(lenderId.id)
        return NextResponse.json(recentSearches, { status: 200 });
    } catch (error) {
        console.error('Error fetching funded loans:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
