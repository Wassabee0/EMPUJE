drop policy if exists "evidence_insert_own_pending" on public.evidence_items;

create policy "evidence_insert_own_pending"
on public.evidence_items for insert to authenticated
with check (
  profile_id = (select auth.uid())
  and status = 'pending'
  and (
    offer_id is null
    or exists (
      select 1
      from public.offers o
      where o.id = evidence_items.offer_id
        and o.profile_id = (select auth.uid())
    )
  )
);
