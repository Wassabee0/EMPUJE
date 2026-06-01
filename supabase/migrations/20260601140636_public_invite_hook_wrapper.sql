create or replace function public.require_beta_invite(event jsonb)
returns jsonb
language sql
set search_path = public, app_private
as $$
  select app_private.require_beta_invite(event);
$$;

grant usage on schema public to supabase_auth_admin;
revoke execute on function public.require_beta_invite(jsonb) from public, anon, authenticated;
grant execute on function public.require_beta_invite(jsonb) to supabase_auth_admin;
