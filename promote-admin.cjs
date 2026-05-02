const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const targetEmail = 'info@tambuaafrica.com';

async function promoteToAdmin() {
  console.log(`Searching for user: ${targetEmail}...`);
  
  // 1. Get user ID from auth.users (via admin API)
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Auth Error:', authError.message);
    return;
  }

  const user = users.find(u => u.email === targetEmail);
  
  if (!user) {
    console.error(`User with email ${targetEmail} not found in Auth!`);
    return;
  }

  console.log(`Found user ID: ${user.id}. Promoting to Admin...`);

  // 2. Upsert into public.profiles
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ 
      id: user.id, 
      role: 'admin',
      full_name: user.user_metadata?.full_name || 'Tambua Africa Admin',
      updated_at: new Date().toISOString()
    });

  if (profileError) {
    console.error('Profile Update Error:', profileError.message);
  } else {
    console.log('✅ Success! Account promoted to Admin.');
    console.log('Please log out and log back in to see the changes.');
  }
}

promoteToAdmin();
