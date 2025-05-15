import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Runtime validation for client-side environment variables
if (typeof window !== "undefined") {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`
      Missing Supabase client credentials!
      Add these to your .env.local file:
      NEXT_PUBLIC_SUPABASE_URL=your-url
      NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    `);
  }
}

// Type-safe server client initialization
export const getSupabaseServerClient = () => {
  if (typeof window !== "undefined") {
    throw new Error("Server client cannot be used in browser environment");
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(`
      Missing Supabase server credentials!
      Add these to your .env.local file:
      NEXT_PUBLIC_SUPABASE_URL=your-url
      SUPABASE_SERVICE_ROLE_KEY=your-service-key
    `);
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        "x-client-info": "nextjs-server-client",
      },
    },
  });
};

// Client-side instance with auto-refresh
export const getSupabaseBrowserClient = () => {
  if (typeof window === "undefined") {
    throw new Error("Browser client cannot be used in server environment");
  }

  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        "x-client-info": "nextjs-browser-client",
      },
    },
  });
};

// Type helpers
export type SupabaseClient = ReturnType<typeof createClient<Database>>;
