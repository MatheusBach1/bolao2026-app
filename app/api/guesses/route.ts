import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PLAYERS } from '@/lib/players'
import { maybeSetHiddenPlayer } from '@/lib/guessDelay'

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get('player')
  if (!player || !PLAYERS.includes(player as typeof PLAYERS[number])) {
    return NextResponse.json({ error: 'Participante inválido.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('guesses')
    .select('match_id, guess_home, guess_away, guess_penalty_winner')
    .eq('player_name', player)

  if (error) return NextResponse.json({ error: 'Erro ao buscar palpites.' }, { status: 500 })

  return NextResponse.json({ guesses: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { player_name, match_id, guess_home, guess_away, guess_penalty_winner = null } = body

  if (!PLAYERS.includes(player_name)) {
    return NextResponse.json({ error: 'Participante inválido.' }, { status: 400 })
  }
  if (typeof guess_home !== 'number' || typeof guess_away !== 'number') {
    return NextResponse.json({ error: 'Palpite inválido.' }, { status: 400 })
  }
  if (guess_penalty_winner !== null && guess_penalty_winner !== 'home' && guess_penalty_winner !== 'away') {
    return NextResponse.json({ error: 'Vencedor nos pênaltis inválido.' }, { status: 400 })
  }

  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('match_time, round, hidden_delay_set')
    .eq('id', match_id)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Jogo não encontrado.' }, { status: 404 })
  }

  const deadline = new Date(match.match_time).getTime() - 5 * 60 * 1000
  if (Date.now() >= deadline) {
    return NextResponse.json({ error: 'Prazo para palpite encerrado.' }, { status: 400 })
  }

  const isKnockout = match.round !== 'grupo'
  const isDraw = guess_home === guess_away

  // In knockout, a draw guess requires a penalty winner
  if (isKnockout && isDraw && !guess_penalty_winner) {
    return NextResponse.json({ error: 'Em fases eliminatórias com empate, informe o vencedor nos pênaltis.' }, { status: 400 })
  }

  // Only store penalty winner when it's a knockout draw guess
  const penaltyToStore = (isKnockout && isDraw) ? guess_penalty_winner : null

  const { error } = await supabaseAdmin.from('guesses').insert({
    player_name,
    match_id,
    guess_home,
    guess_away,
    guess_penalty_winner: penaltyToStore,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Você já enviou um palpite para este jogo.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao salvar palpite.' }, { status: 500 })
  }

  // Fire-and-forget: roll the hidden-player lottery for this match (only on first submission)
  maybeSetHiddenPlayer(match_id, match.match_time).catch(() => {})

  return NextResponse.json({ success: true })
}
