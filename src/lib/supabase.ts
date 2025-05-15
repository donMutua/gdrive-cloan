import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Add validation for server-side key
if (typeof window === "undefined" && !supabaseServiceKey) {
  throw new Error(`
    SUPABASE_SERVICE_ROLE_KEY is missing!
    Add it to your .env.local file:
    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  `);
}

export const supabase =
  typeof window === "undefined"
    ? createClient<Database>(supabaseUrl!, supabaseServiceKey!, {
        auth: { persistSession: false },
        global: { headers: { "x-client-info": "@supabase/js-v2" } },
      })
    : null;

// Client-side client creator
export const createClientComponentClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`
      Missing Supabase credentials!
      Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
      to your .env.local file
    `);
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: true, persistSession: true },
    global: { headers: { "x-client-info": "@supabase/js-v2" } },
  });
};
