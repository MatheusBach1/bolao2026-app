import { createClient } from '@supabase/supabase-js'

export type Round = 'grupo' | 'segunda-rodada' | 'oitavas' | 'quartas' | 'semifinal' | 'final'
export type PenaltyWinner = 'home' | 'away'

export type Match = {
  id: number
  teams: string
  match_time: string
  group_name: string
  round: Round
  slot: number | null
  result_home: number | null
  result_away: number | null
  penalty_winner: PenaltyWinner | null
  api_match_id: string | null
  created_at: string
}

export type Guess = {
  id: number
  player_name: string
  match_id: number
  guess_home: number
  guess_away: number
  guess_penalty_winner: PenaltyWinner | null
  submitted_at: string
  points: number | null
}

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
}

function getServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
}

export const supabase = createClient(getSupabaseUrl(), getAnonKey())
export const supabaseAdmin = createClient(getSupabaseUrl(), getServiceRoleKey())
