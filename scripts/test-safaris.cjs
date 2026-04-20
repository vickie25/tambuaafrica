// Test script to check safaris table
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testSafarisTable() {
  console.log('Testing safaris table...\n');
  
  try {
    // Check if table exists and get count
    console.log('1. Fetching all safaris:');
    const { data: safaris, error: safarisError } = await supabase
      .from('safaris')
      .select('*');
    
    if (safarisError) {
      console.log('   ❌ Error:', safarisError.message);
      console.log('   Code:', safarisError.code);
    } else {
      console.log('   ✅ Found', safaris?.length || 0, 'safaris in Supabase');
      if (safaris && safaris.length > 0) {
        console.log('   Safari IDs:', safaris.map(s => s.id).join(', '));
      }
    }
    
    // Check local safaris count
    console.log('\n2. Local safaris count:');
    console.log('   ✅ Local fallback safaris are in src/data/safaris.ts');
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testSafarisTable();