create table if not exists public.wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  attendees integer not null default 0 check (attendees >= 0 and attendees <= 10),
  attending boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists wedding_rsvps_created_at_idx
  on public.wedding_rsvps (created_at desc);

create or replace function public.register_wedding_rsvp(
  p_full_name text,
  p_email text,
  p_phone text,
  p_attendees integer,
  p_attending boolean,
  p_note text,
  p_capacity integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_total integer;
  normalized_attendees integer;
begin
  perform pg_advisory_xact_lock(20260822);

  normalized_attendees := case
    when p_attending then greatest(1, least(coalesce(p_attendees, 1), 10))
    else 0
  end;

  select coalesce(sum(attendees), 0)
    into current_total
    from public.wedding_rsvps
    where attending = true;

  if p_attending and current_total + normalized_attendees > p_capacity then
    return jsonb_build_object(
      'status', 'closed',
      'remaining', greatest(p_capacity - current_total, 0)
    );
  end if;

  insert into public.wedding_rsvps (
    full_name,
    email,
    phone,
    attendees,
    attending,
    note
  ) values (
    trim(p_full_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_phone, '')), ''),
    normalized_attendees,
    p_attending,
    nullif(trim(coalesce(p_note, '')), '')
  );

  return jsonb_build_object(
    'status', 'accepted',
    'remaining', greatest(p_capacity - current_total - normalized_attendees, 0)
  );
end;
$$;
