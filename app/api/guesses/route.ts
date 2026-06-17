import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { PLAYERS } from '@/lib/players'

export async function GET(req: NextRequest) {
  const player = req.nextUrl.searchParams.get('player')
  if (!player || !PLAYERS.includes(player as typeof PLAYERS[number])) {
    return NextResponse.json({ error: 'Participante inválido.' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('guesses')
    .select('match_id, guess_home, guess_away')
    .eq('player_name', player)

  if (error) return NextResponse.json({ error: 'Erro ao buscar palpites.' }, { status: 500 })

  return NextResponse.json({ guesses: data ?? [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { player_name, match_id, guess_home, guess_away } = body

  if (!PLAYERS.includes(player_name)) {
    return NextResponse.json({ error: 'Participante inválido.' }, { status: 400 })
  }
  if (typeof guess_home !== 'number' || typeof guess_away !== 'number') {
    return NextResponse.json({ error: 'Palpite inválido.' }, { status: 400 })
  }

  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('match_time')
    .eq('id', match_id)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Jogo não encontrado.' }, { status: 404 })
  }

  const deadline = new Date(match.match_time).getTime() - 5 * 60 * 1000
  if (Date.now() >= deadline) {
    return NextResponse.json({ error: 'Prazo para palpite encerrado.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('guesses').insert({
    player_name,
    match_id,
    guess_home,
    guess_away,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Você já enviou um palpite para este jogo.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao salvar palpite.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
