import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://weenveknkghlxngpxhvp.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlZW52ZWtua2dobHhuZ3B4aHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Mjg0MzIsImV4cCI6MjA4OTUwNDQzMn0.IM_j2WOrfvvTZuHgsBKYAgLfTc8G0x-TnLx-hA4nZ54'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
