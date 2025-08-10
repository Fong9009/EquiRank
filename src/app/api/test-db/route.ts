import { NextResponse } from 'next/server';
import { testConnection } from '@/database/db';

export async function GET() {
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      return NextResponse.json(
        { 
          status: 'success',
          message: 'Database connection successful',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Database test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
