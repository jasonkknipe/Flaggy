-- Shared, account-free Compete attempt log. Every installation reads and
-- writes the same history. There are deliberately no direct table policies:
-- clients can only use the two narrowly scoped RPC functions below.

create table if not exists public.compete_attempts (
  attempt_id uuid primary key,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.compete_attempts enable row level security;

create or replace function public.save_compete_attempt(p_attempt jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.compete_attempts (attempt_id, started_at, ended_at, payload)
  values (
    (p_attempt ->> 'id')::uuid,
    to_timestamp((p_attempt ->> 'startedAt')::double precision / 1000),
    to_timestamp((p_attempt ->> 'endedAt')::double precision / 1000),
    p_attempt
  )
  on conflict (attempt_id) do update
    set started_at = excluded.started_at,
        ended_at = excluded.ended_at,
        payload = excluded.payload;
end;
$$;

create or replace function public.list_compete_attempts()
returns jsonb
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(jsonb_agg(payload order by ended_at desc), '[]'::jsonb)
  from public.compete_attempts;
$$;

revoke all on table public.compete_attempts from anon, authenticated;
grant execute on function public.save_compete_attempt(jsonb) to anon;
grant execute on function public.list_compete_attempts() to anon;
