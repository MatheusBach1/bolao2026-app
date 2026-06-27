import { supabaseAdmin } from '@/lib/supabase'
import type { Match } from '@/lib/supabase'
import KnockoutBracket from '@/components/KnockoutBracket'

export const revalidate = 60

const KNOCKOUT_ROUNDS = ['segunda-rodada', 'oitavas', 'quartas', 'semifinal', 'final']

async function getKnockoutMatches(): Promise<Record<string, Match[]>> {
  const { data } = await supabaseAdmin
    .from('matches')
    .select('*')
    .in('round', KNOCKOUT_ROUNDS)
    .order('slot', { ascending: true })

  const byRound: Record<string, Match[]> = {}
  for (const m of (data ?? []) as Match[]) {
    if (!byRound[m.round]) byRound[m.round] = []
    byRound[m.round].push(m)
  }
  return byRound
}

export default async function EliminatoriasPage() {
  const matchesByRound = await getKnockoutMatches()
  const total = Object.values(matchesByRound).flat().length

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">🏆 Eliminatórias</h1>
      <p className="text-nlw-textHover mb-4 text-sm">Copa do Mundo 2026</p>

      <div className="bg-nlw-card rounded-xl overflow-hidden">
        {total === 0 ? (
          <div className="p-8 text-center">
            <p className="text-nlw-textMuted">Nenhum jogo de eliminatórias cadastrado ainda.</p>
            <p className="text-nlw-textHover text-xs mt-2">
              No admin, cadastre um jogo com a fase{' '}
              <span className="text-nlw-yellow font-mono">oitavas</span> (por exemplo).
            </p>
          </div>
        ) : (
          <KnockoutBracket matchesByRound={matchesByRound} />
        )}
      </div>
    </div>
  )
}
