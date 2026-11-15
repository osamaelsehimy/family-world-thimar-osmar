-- Trusted membership and one-time / multi-use invitation foundation.
create schema if not exists private;
create sequence if not exists private.member_code_seq;

alter table public.profiles
  add column if not exists member_code text,
  add column if not exists membership_status text not null default 'pending'
    check (membership_status in ('pending','active','suspended','rejected'));

create unique index if not exists profiles_member_code_uidx
  on public.profiles(member_code);

create table if not exists private.invite_codes (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  code_prefix text not null,
  code_type text not null check (code_type in ('FAM','TRU','NET','OSM','TEAM')),
  created_by uuid references public.profiles(id) on delete set null,
  source_label text,
  max_uses integer not null default 1 check (max_uses > 0),
  uses_count integer not null default 0 check (uses_count >= 0 and uses_count <= max_uses),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists private.member_referrals (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null unique references public.profiles(id) on delete cascade,
  inviter_id uuid references public.profiles(id) on delete set null,
  invite_code_id uuid not null references private.invite_codes(id) on delete restrict,
  referral_type text not null check (referral_type in ('FAM','TRU','NET','OSM','TEAM')),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint referral_source_required check (referral_type='OSM' or inviter_id is not null)
);

create index if not exists invite_codes_created_by_idx on private.invite_codes(created_by);
create index if not exists invite_codes_active_idx on private.invite_codes(code_type,expires_at) where revoked_at is null;
create index if not exists member_referrals_inviter_idx on private.member_referrals(inviter_id);
create index if not exists member_referrals_status_idx on private.member_referrals(status,created_at desc);

alter table private.invite_codes enable row level security;
alter table private.member_referrals enable row level security;
revoke all on private.invite_codes from anon,authenticated;
revoke all on private.member_referrals from anon,authenticated;
