import 'dotenv/config';
import { createLoanRequest, getLoanRequestById, getLoanRequestsByBorrower } from './loanRequest';
import { upsertCompanyStatistics, getCompanyStatisticsByUserId } from './companyStats';

async function testModels() {
  try {
    console.log('🧪 Testing database models...');
    
    // Test company statistics
    console.log('\n📊 Testing company statistics...');
    const testStats = {
      user_id: 2, // borrower1@company.com
      annual_revenue: 2500000.00,
      employee_count: 25,
      years_in_business: 5,
      credit_score: 720,
      industry: 'Manufacturing',
      financial_ratios: {
        debt_to_equity: 0.45,
        current_ratio: 1.8,
        profit_margin: 0.15
      }
    };
    
    const statsResult = await upsertCompanyStatistics(testStats);
    console.log('✅ Company statistics upsert:', statsResult);
    
    const retrievedStats = await getCompanyStatisticsByUserId(2);
    console.log('✅ Retrieved company statistics:', retrievedStats);
    
    // Test loan request
    console.log('\n💰 Testing loan request...');
    const testRequest = {
      borrower_id: 2,
      amount_requested: 50000.00,
      currency: 'USD' as const,
      company_photo_url: '/uploads/company-photos/tech_startup.jpg',
      company_description: 'Tech startup specializing in AI-powered manufacturing solutions',
      social_media_links: {
        linkedin: 'https://linkedin.com/company/techstartup',
        twitter: 'https://twitter.com/techstartup',
        website: 'https://techstartup.com'
      },
      loan_purpose: 'Equipment purchase for manufacturing expansion and new product development',
      loan_type: 'equipment' as const,
      status: 'pending' as const
    };
    
    const requestId = await createLoanRequest(testRequest);
    console.log('✅ Created loan request with ID:', requestId);
    
    const retrievedRequest = await getLoanRequestById(requestId);
    console.log('✅ Retrieved loan request:', retrievedRequest);
    
    const borrowerRequests = await getLoanRequestsByBorrower(2);
    console.log('✅ Retrieved borrower requests:', borrowerRequests.length);
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testModels();
}

export { testModels };
