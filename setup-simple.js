// Simple database setup using direct queries
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oxaamwppdrfkimekykrf.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWFtd3BwZHJma2ltZWt5a3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NzU2MiwiZXhwIjoyMDc3MDUzNTYyfQ.lVktjV8gAJLBJD8xeNSsYwPBNqKwuarRtRGqCgmR4to'

const supabase = createClient(supabaseUrl, serviceKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  const { data, error } = await supabase
    .from('profiles')
    .select('count')
    .limit(1)
  
  if (error && error.code === 'PGRST116') {
    console.log('✅ Connected! Tables need to be created.')
    return false
  } else if (error) {
    console.error('❌ Connection error:', error)
    throw error
  } else {
    console.log('✅ Connected! Tables already exist.')
    return true
  }
}

async function createBasicTables() {
  console.log('📝 Creating basic tables...')
  
  // Create profiles table first
  const { error: profilesError } = await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        wallet_address TEXT UNIQUE NOT NULL,
        username TEXT,
        bio TEXT,
        avatar_url TEXT,
        total_blessings INTEGER DEFAULT 0,
        projects_count INTEGER DEFAULT 0,
        revivals_count INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `
  })
  
  if (profilesError) {
    console.log('Using direct query approach...')
    // Try direct approach
    const { error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Tables need to be created manually in Supabase dashboard')
      console.log('Go to: https://supabase.com/dashboard/project/oxaamwppdrfkimekykrf/editor')
      return false
    }
  }
  
  console.log('✅ Tables ready!')
  return true
}

async function setup() {
  try {
    const tablesExist = await testConnection()
    
    if (!tablesExist) {
      await createBasicTables()
    }
    
    console.log('🎯 Backend setup complete!')
    console.log('📊 Dashboard: https://supabase.com/dashboard/project/oxaamwppdrfkimekykrf')
    
  } catch (error) {
    console.error('❌ Setup failed:', error)
  }
}

setup()