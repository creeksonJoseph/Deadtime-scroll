// Test Supabase connection and explain limitations
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oxaamwppdrfkimekykrf.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWFtd3BwZHJma2ltZWt5a3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NzU2MiwiZXhwIjoyMDc3MDUzNTYyfQ.lVktjV8gAJLBJD8xeNSsYwPBNqKwuarRtRGqCgmR4to'

const supabase = createClient(supabaseUrl, serviceKey)

async function testConnection() {
  console.log('🔍 Testing Supabase connection...')
  console.log('URL:', supabaseUrl)
  
  try {
    // Test basic connection with a simple query
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('Auth test result:', error.message)
    } else {
      console.log('✅ Basic connection successful!')
    }
    
    // Try to access database
    const { data: dbData, error: dbError } = await supabase
      .rpc('version')
    
    if (dbError) {
      console.log('Database access:', dbError.message)
      
      // Try alternative method
      const { data: altData, error: altError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .limit(1)
        
      if (altError) {
        console.log('Alternative access:', altError.message)
      } else {
        console.log('✅ Database connection successful!')
        console.log('Available tables:', altData)
      }
    } else {
      console.log('✅ Database connection successful!')
      console.log('PostgreSQL version:', dbData)
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
  }
}

testConnection()