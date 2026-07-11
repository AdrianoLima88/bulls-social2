import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, publicAnonKey } from './info';

// Single supabase client — force WebSocket transport to avoid 406 HTTP polling errors
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  realtime: {
    params: { eventsPerSecond: 10 },
  },
});
