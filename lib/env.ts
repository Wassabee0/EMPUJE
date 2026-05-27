export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export function hasSupabasePublicConfig() {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey);
}

export function hasSupabaseServerConfig() {
  return Boolean(env.supabaseUrl && env.supabaseSecretKey);
}

export function getMissingSupabaseKeys() {
  const missing: string[] = [];
  if (!env.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!env.supabasePublishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  if (!env.supabaseSecretKey) missing.push("SUPABASE_SECRET_KEY");
  return missing;
}
