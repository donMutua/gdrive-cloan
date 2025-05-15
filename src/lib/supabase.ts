import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

// Initialize the Supabase client with service role key for server-side operations
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      persistSession: false,
    },
    // Add global headers for improved debugging
    global: {
      headers: {
        "x-client-info": `@supabase/js-v2`,
      },
    },
  }
);

// Client-side Supabase instance with anon key
export const createClientComponentClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
    // Add global headers for improved debugging
    global: {
      headers: {
        "x-client-info": `@supabase/js-v2`,
      },
    },
  });
};

// Export direct function to get a properly configured client (add this)
export const getSupabaseClient = () => {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });
};
