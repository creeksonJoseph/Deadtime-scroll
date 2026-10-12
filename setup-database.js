// Database setup script for new Supabase project
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = 'https://oxaamwppdrfkimekykrf.supabase.co'
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94YWFtd3BwZHJma2ltZWt5a3JmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTQ3NzU2MiwiZXhwIjoyMDc3MDUzNTYyfQ.lVktjV8gAJLBJD8xeNSsYwPBNqKwuarRtRGqCgmR4to'

const supabase = createClient(supabaseUrl, serviceKey)

async function runMigration(filename) {
  console.log(`Running migration: ${filename}`)
  const sql = readFileSync(join(__dirname, 'supabase/migrations', filename), 'utf8')
  
  const { error } = await supabase.rpc('exec_sql', { sql })
  
  if (error) {
    console.error(`Error in ${filename}:`, error)
    throw error
  }
  
  console.log(`✅ ${filename} completed`)
}

async function setupDatabase() {
  try {
    console.log('🚀 Setting up DeadTime database...')
    
    // Run migrations in order
    await runMigration('001_initial_schema.sql')
    await runMigration('002_rls_policies.sql')
    await runMigration('003_bounty_system.sql')
    
    console.log('✅ Database setup complete!')
    console.log('🎯 Ready to use new Supabase project')
    
  } catch (error) {
    console.error('❌ Database setup failed:', error)
    process.exit(1)
  }
}

setupDatabase()