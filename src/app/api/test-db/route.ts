import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/database';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const connectionTest = await executeQuery('SELECT 1 as test');
    console.log('Connection test result:', connectionTest);
    
    // Check if loan_requests table exists
    const tableCheck = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name = 'loan_requests'
    `);
    console.log('Table check result:', tableCheck);
    
    // Check loan_requests table structure
    let tableStructure = null;
    try {
      tableStructure = await executeQuery('DESCRIBE loan_requests');
      console.log('Table structure:', tableStructure);
    } catch (error) {
      console.log('Error describing table:', error);
    }
    
    // Check if there are any loan requests
    let loanRequestsCount = null;
    let loanRequestsData = null;
    try {
      loanRequestsCount = await executeQuery('SELECT COUNT(*) as count FROM loan_requests');
      console.log('Loan requests count:', loanRequestsCount);
      
      // Get actual loan request data
      loanRequestsData = await executeQuery(`
        SELECT lr.*, 
               CONCAT(u.first_name, ' ', u.last_name) as borrower_name,
               u.company as borrower_company,
               lr.funded_by,
               lr.funded_at,
               CONCAT(lender.first_name, ' ', lender.last_name) as funded_by_name
        FROM loan_requests lr
        JOIN users u ON lr.borrower_id = u.id
        LEFT JOIN users lender ON lr.funded_by = lender.id
        ORDER BY lr.created_at DESC
      `);
      console.log('Loan requests data:', loanRequestsData);
    } catch (error) {
      console.log('Error counting loan requests:', error);
    }
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      tableExists: tableCheck[0]?.count > 0,
      tableStructure: tableStructure,
      loanRequestsCount: loanRequestsCount?.[0]?.count || 0,
      loanRequestsData: loanRequestsData
    });
    
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
