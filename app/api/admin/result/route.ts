import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calcPoints } from '@/lib/scoring'

export async function POST(req: NextRequest) {
  const { match_id, result_home, result_away } = await req.json()

  if (typeof result_home !== 'number' || typeof result_away !== 'number') {
    return NextResponse.json({ error: 'Resultado inválido.' }, { status: 400 })
  }

  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('result_home')
    .eq('id', match_id)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Jogo não encontrado.' }, { status: 404 })
  }

  if (match.result_home !== null) {
    return NextResponse.json({ error: 'Resultado já inserido.' }, { status: 409 })
  }

  const { error: matchErr } = await supabaseAdmin
    .from('matches')
    .update({ result_home, result_away })
    .eq('id', match_id)

  if (matchErr) {
    return NextResponse.json({ error: 'Erro ao salvar resultado.' }, { status: 500 })
  }

  const { data: guesses } = await supabaseAdmin
    .from('guesses')
    .select('id, guess_home, guess_away')
    .eq('match_id', match_id)

  if (guesses && guesses.length > 0) {
    const updates = guesses.map((g) => ({
      id: g.id,
      points: calcPoints(g.guess_home, g.guess_away, result_home, result_away),
    }))

    for (const u of updates) {
      await supabaseAdmin.from('guesses').update({ points: u.points }).eq('id', u.id)
    }
  }

  return NextResponse.json({ success: true })
}
