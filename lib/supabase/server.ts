import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { env, hasSupabasePublicConfig } from "@/lib/env";

export async function createServerSupabaseClient() {
  if (!hasSupabasePublicConfig()) return null;

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl!, env.supabasePublishableKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot always write cookies. The root proxy refreshes sessions.
        }
      },
    },
  });
}

export async function getCurrentUser() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
}
