import { createClient } from "@supabase/supabase-js";

import { env, hasSupabaseServerConfig } from "@/lib/env";

export function createAdminSupabaseClient() {
  if (!hasSupabaseServerConfig()) return null;

  return createClient(env.supabaseUrl!, env.supabaseSecretKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
