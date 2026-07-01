-- Tracks the hidden-guess mechanic per match.
-- hidden_player: which player's guess is hidden for this match
-- hidden_visible_at: when the guess becomes visible (match_time + 30-64 min)
-- hidden_delay_set: flag to avoid re-rolling the lottery on subsequent submissions
alter table matches add column if not exists hidden_player text;
alter table matches add column if not exists hidden_visible_at timestamptz;
alter table matches add column if not exists hidden_delay_set boolean not null default false;
