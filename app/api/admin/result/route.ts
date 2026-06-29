import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calcPoints } from '@/lib/scoring'
import { revalidatePath } from 'next/cache'

export async function POST(req: NextRequest) {
  const { match_id, result_home, result_away, penalty_winner = null } = await req.json()

  if (typeof result_home !== 'number' || typeof result_away !== 'number') {
    return NextResponse.json({ error: 'Resultado inválido.' }, { status: 400 })
  }
  if (penalty_winner !== null && penalty_winner !== 'home' && penalty_winner !== 'away') {
    return NextResponse.json({ error: 'Vencedor nos pênaltis inválido.' }, { status: 400 })
  }

  const isDraw = result_home === result_away
  if (!isDraw && penalty_winner !== null) {
    return NextResponse.json({ error: 'Pênaltis só se aplicam a jogos empatados no tempo normal.' }, { status: 400 })
  }

  const { data: match } = await supabaseAdmin
    .from('matches')
    .select('result_home, round')
    .eq('id', match_id)
    .single()

  if (!match) {
    return NextResponse.json({ error: 'Jogo não encontrado.' }, { status: 404 })
  }
  if (match.result_home !== null) {
    return NextResponse.json({ error: 'Resultado já inserido.' }, { status: 409 })
  }

  const isKnockout = match.round !== 'grupo'
  const penaltyToStore = (isKnockout && isDraw) ? penalty_winner : null

  const { error: matchErr } = await supabaseAdmin
    .from('matches')
    .update({ result_home, result_away, penalty_winner: penaltyToStore })
    .eq('id', match_id)

  if (matchErr) {
    return NextResponse.json({ error: 'Erro ao salvar resultado.' }, { status: 500 })
  }

  const { data: guesses } = await supabaseAdmin
    .from('guesses')
    .select('id, guess_home, guess_away, guess_penalty_winner')
    .eq('match_id', match_id)

  if (guesses && guesses.length > 0) {
    for (const g of guesses) {
      const points = calcPoints(
        g.guess_home, g.guess_away,
        result_home, result_away,
        penaltyToStore,
        g.guess_penalty_winner ?? null,
      )
      await supabaseAdmin.from('guesses').update({ points }).eq('id', g.id)
    }
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/placar')
  revalidatePath('/painel')

  return NextResponse.json({ success: true })
}
