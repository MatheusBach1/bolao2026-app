import { supabaseAdmin } from './supabase'
import { PLAYERS } from './players'

// How many times a player can be chosen as the hidden player across all matches
const MAX_HIDDEN_TIMES = 2

// Probability a match gets the delay mechanic (0.30 to 0.35)
const DELAY_CHANCE = 0.43

// Only applies to the next N upcoming matches from now
const ELIGIBLE_UPCOMING_MATCHES = 120

// Delay range in minutes after match start
const DELAY_MIN = 30
const DELAY_MAX = 64

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Called on every guess submission. Rolls the lottery for this match if not yet done.
export async function maybeSetHiddenPlayer(matchId: number, matchTime: string): Promise<void> {
  // Only eligible if this match is among the next ELIGIBLE_UPCOMING_MATCHES upcoming matches
  const { data: upcomingMatches } = await supabaseAdmin
    .from('matches')
    .select('id')
    .gt('match_time', new Date().toISOString())
    .order('match_time', { ascending: true })
    .limit(ELIGIBLE_UPCOMING_MATCHES)

  const eligibleIds = new Set((upcomingMatches ?? []).map((m: { id: number }) => m.id))
  if (!eligibleIds.has(matchId)) return

  // Check if already set for this match
  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('hidden_delay_set, hidden_player, hidden_visible_at')
    .eq('id', matchId)
    .single()

  if (!match || match.hidden_delay_set) return

  // Mark as set immediately to avoid race conditions on concurrent submissions
  await supabaseAdmin
    .from('matches')
    .update({ hidden_delay_set: true })
    .eq('id', matchId)

  // Roll the dice — only DELAY_CHANCE probability continues
  if (Math.random() > DELAY_CHANCE) return

  // Count how many times each player has already been chosen
  const { data: allMatches } = await supabaseAdmin
    .from('matches')
    .select('hidden_player')
    .not('hidden_player', 'is', null)

  const timesChosen: Record<string, number> = {}
  for (const m of (allMatches ?? []) as { hidden_player: string | null }[]) {
    if (m.hidden_player) {
      timesChosen[m.hidden_player] = (timesChosen[m.hidden_player] ?? 0) + 1
    }
  }

  // Eligible players are those under the max hidden limit
  const eligible = PLAYERS.filter(
    (p) => (timesChosen[p] ?? 0) < MAX_HIDDEN_TIMES
  )
  if (eligible.length === 0) return

  // Pick a random eligible player
  const chosen = eligible[Math.floor(Math.random() * eligible.length)]

  // Compute visible_at = match_time + random(30, 64) minutes
  const delayMinutes = randomInt(DELAY_MIN, DELAY_MAX)
  const visibleAt = new Date(new Date(matchTime).getTime() + delayMinutes * 60 * 1000).toISOString()

  await supabaseAdmin
    .from('matches')
    .update({ hidden_player: chosen, hidden_visible_at: visibleAt })
    .eq('id', matchId)
}

// Returns the set of (matchId, playerName) pairs that are currently hidden.
// Used by the painel to filter out guesses that shouldn't be visible yet.
export async function getHiddenGuesses(): Promise<Set<string>> {
  const now = new Date().toISOString()

  const { data } = await supabaseAdmin
    .from('matches')
    .select('id, hidden_player, hidden_visible_at')
    .not('hidden_player', 'is', null)
    .gt('hidden_visible_at', now) // still within the hidden window

  const hidden = new Set<string>()
  for (const m of (data ?? []) as { id: number; hidden_player: string; hidden_visible_at: string }[]) {
    hidden.add(`${m.id}:${m.hidden_player}`)
  }
  return hidden
}
