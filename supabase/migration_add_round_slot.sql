-- Run this on your existing Supabase project via the SQL Editor
alter table matches add column if not exists round text not null default 'grupo';
alter table matches add column if not exists slot integer;
create index if not exists idx_matches_round on matches(round);
