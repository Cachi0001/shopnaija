import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are properly configured
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  
  if (import.meta.env.DEV) {
    console.warn('Running in development mode with placeholder Supabase configuration.');
    console.warn('Database functionality will be limited until proper credentials are configured.');
  }
}

// Use fallback values in development to prevent immediate crashes
const url = SUPABASE_URL || 'https://placeholder.supabase.co';
const key = SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});