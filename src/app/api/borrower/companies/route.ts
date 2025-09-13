import { getAllArchivedMessages} from '@/database/contact';
import { NextRequest, NextResponse } from 'next/server';
import {auth} from "@/lib/auth";
import {getBorrowerID} from "@/database/profile";
import {getAllCompaniesById} from "@/database/companyValues";

// GET This is to get the list of companies owned by a single user
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = parseInt(session.user.id);
        const borrowerID = await getBorrowerID(userId);
        if(!borrowerID) {
            return NextResponse.json({ error: 'Borrower Profile Not Found' }, { status: 404 });
        }

        const companyList = await getAllCompaniesById(borrowerID.id);

        return NextResponse.json(companyList);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}
