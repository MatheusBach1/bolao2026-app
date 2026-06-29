-- penalty_winner: 'home' | 'away' | null (null = no penalties / group stage)
alter table matches add column if not exists penalty_winner text;

-- guess_penalty_winner: 'home' | 'away' | null
alter table guesses add column if not exists guess_penalty_winner text;
