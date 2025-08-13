import { NextRequest, NextResponse } from 'next/server';
import { getBorrowers, getLenders, getAdmins } from '@/database/user';

// GET /api/users/[type] - Get users by type
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const { type } = await params;
    
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
    const { type } = await params;
    console.error(`Error fetching ${type}:`, error);
    return NextResponse.json(
      { error: `Failed to fetch ${type}` },
      { status: 500 }
    );
  }
}
