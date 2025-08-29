import 'dotenv/config';
import { executeMigration } from './migrations';
import { readFileSync } from 'fs';
import { join } from 'path';

async function fixMigrationRecord() {
  try {
    console.log('🔧 Fixing migration record for loan system...');
    
    // Read the migration SQL file
    const migrationPath = join(process.cwd(), 'src', 'database', 'migrations', '001_add_loan_system.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration record (this will just record it, not run the SQL again)
    const result = await executeMigration('001_add_loan_system', migrationSQL);
    
    if (result.success) {
      console.log('✅ Migration record created successfully!');
      console.log('📋 Migration details:', result.migration);
    } else {
      console.log('⚠️ Migration record issue:', result.message);
    }
    
  } catch (error) {
    console.error('❌ Failed to fix migration record:', error);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  fixMigrationRecord();
}

export { fixMigrationRecord };
