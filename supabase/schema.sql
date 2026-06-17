create table if not exists matches (
  id serial primary key,
  teams text not null,
  match_time timestamptz not null,
  group_name text not null,
  result_home integer,
  result_away integer,
  api_match_id text,
  created_at timestamptz default now()
);

create table if not exists guesses (
  id serial primary key,
  player_name text not null,
  match_id integer references matches(id) on delete cascade,
  guess_home integer not null,
  guess_away integer not null,
  submitted_at timestamptz default now(),
  points integer,
  unique(player_name, match_id)
);

create index if not exists idx_guesses_match_id on guesses(match_id);
create index if not exists idx_guesses_player_name on guesses(player_name);
create index if not exists idx_matches_match_time on matches(match_time);
