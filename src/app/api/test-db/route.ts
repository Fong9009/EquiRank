import { NextRequest, NextResponse } from 'next/server';
import { testConnection, executeQuery } from '@/database/index';
import { createLoanRequest } from '@/database/loanRequest';

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    const isConnected = await testConnection();
    
    if (!isConnected) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Database connection failed' 
      }, { status: 500 });
    }

    // Test loan_requests table structure
    let tableStructure;
    try {
      const structureResult = await executeQuery(`
        DESCRIBE loan_requests
      `);
      tableStructure = structureResult;
    } catch (error) {
      tableStructure = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    // Test if we can insert a test loan request
    let testInsert;
    try {
      const testData = {
        borrower_id: 1,
        amount_requested: 1000,
        currency: 'USD' as const,
        company_description: 'Test company',
        social_media_links: null,
        loan_purpose: 'Test purpose',
        loan_type: 'working_capital' as const,
        status: 'pending' as const,
        expires_at: undefined
      };
      
      const testId = await createLoanRequest(testData);
      testInsert = { success: true, id: testId };
      
      // Clean up test data
      if (testId) {
        await executeQuery('DELETE FROM loan_requests WHERE id = ?', [testId]);
      }
    } catch (error) {
      testInsert = { error: error instanceof Error ? error.message : 'Unknown error' };
    }

    return NextResponse.json({
      status: 'success',
      connection: 'Connected',
      tableStructure,
      testInsert,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
