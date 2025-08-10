import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser } from '@/database/db';

// GET /api/users - Get all users (admin only)
export async function GET() {
  try {
    const users = await getAllUsers();
    
    // Remove password hashes from response for security
    const safeUsers = users.map(user => {
      const { password_hash, ...safeUser } = user;
      return safeUser;
    });
    
    return NextResponse.json(safeUsers, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      userType, 
      company, 
      phone, 
      address 
    } = body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, firstName, lastName, userType' },
        { status: 400 }
      );
    }

    // Validate user type
    if (!['borrower', 'lender', 'admin'].includes(userType)) {
      return NextResponse.json(
        { error: 'Invalid user type. Must be: borrower, lender, or admin' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Hash the password before storing
    // For now, we'll store it as-is (NOT recommended for production!)
    const passwordHash = password;

    // Create user
    const userId = await createUser(
      email, 
      passwordHash, 
      firstName, 
      lastName, 
      userType, 
      company, 
      phone, 
      address
    );

    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: userId
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
