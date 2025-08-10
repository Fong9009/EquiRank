import { NextRequest, NextResponse } from 'next/server';
import { getBorrowers, getLenders, getAdmins } from '@/database/db';

// GET /api/users/[type] - Get users by type
export async function GET(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const { type } = params;
    
    let users;
    
    switch (type) {
      case 'borrowers':
        users = await getBorrowers();
        break;
      case 'lenders':
        users = await getLenders();
        break;
      case 'admins':
        users = await getAdmins();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid user type. Must be: borrowers, lenders, or admins' },
          { status: 400 }
        );
    }
    
    // Remove password hashes from response for security
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });
    
    return NextResponse.json(safeUsers, { status: 200 });
    
  } catch (error) {
    console.error(`Error fetching ${params.type}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${params.type}` },
      { status: 500 }
    );
  }
}
