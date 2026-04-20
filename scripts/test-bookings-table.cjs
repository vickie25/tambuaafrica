// Test script to check bookings table via Supabase Admin API
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testBookingsTable() {
  console.log('Testing bookings table access with service role...\n');
  
  try {
    // Test 1: Check if table exists and get structure
    console.log('1. Fetching bookings (should work with service role):');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(5);
    
    if (bookingsError) {
      console.log('   ❌ Error:', bookingsError.message);
      console.log('   Code:', bookingsError.code);
    } else {
      console.log('   ✅ Success! Found', bookings?.length || 0, 'bookings');
    }
    
    // Test 2: Try insert (will fail if table doesn't exist)
    console.log('\n2. Testing insert (creating test booking):');
    const { data: inserted, error: insertError } = await supabase
      .from('bookings')
      .insert({
        safari_id: 'test-safari',
        safari_title: 'Test Safari',
        preferred_date: '2026-12-01',
        guests: 2,
        total_amount: 50000,
        currency: 'USD',
        notes: 'Test booking',
        user_id: '00000000-0000-0000-0000-000000000000', // placeholder
        status: 'pending'
      })
      .select()
      .single();
    
    if (insertError) {
      console.log('   ❌ Insert error:', insertError.message);
      console.log('   Code:', insertError.code);
      console.log('   Details:', insertError.details);
    } else {
      console.log('   ✅ Inserted:', inserted?.id);
      
      // Clean up test booking
      if (inserted?.id) {
        await supabase.from('bookings').delete().eq('id', inserted.id);
        console.log('   🧹 Cleaned up test booking');
      }
    }
    
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

testBookingsTable();