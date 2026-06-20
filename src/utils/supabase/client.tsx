import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, publicAnonKey } from './info';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, publicAnonKey);
