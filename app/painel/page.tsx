import { supabaseAdmin as supabase } from '@/lib/supabase'
import type { Match, Guess } from '@/lib/supabase'
import PainelPhaseGroup from '@/components/PainelPhaseGroup'

export const revalidate = 60

const PHASE_ORDER = ['grupo', 'segunda-rodada', 'oitavas', 'quartas', 'semifinal', 'final']
const PHASE_LABEL: Record<string, string> = {
  'grupo':          'Fase de Grupos',
  'segunda-rodada': 'Segunda Rodada',
  'oitavas':        'Oitavas de Final',
  'quartas':        'Quartas de Final',
  'semifinal':      'Semifinais',
  'final':          'Final',
}

async function getData() {
  const [{ data: matches }, { data: guesses }] = await Promise.all([
    supabase.from('matches').select('*').order('match_time', { ascending: true }),
    supabase.from('guesses').select('*'),
  ])
  return { matches: (matches ?? []) as Match[], guesses: (guesses ?? []) as Guess[] }
}

export default async function PainelPage() {
  const { matches, guesses } = await getData()

  // Group guesses by match id
  const guessesByMatch: Record<number, Guess[]> = {}
  for (const g of guesses) {
    guessesByMatch[g.match_id] = guessesByMatch[g.match_id] ?? []
    guessesByMatch[g.match_id].push(g)
  }

  // Group matches by phase, preserving PHASE_ORDER
  const matchesByPhase: Record<string, Match[]> = {}
  for (const m of matches) {
    matchesByPhase[m.round] = matchesByPhase[m.round] ?? []
    matchesByPhase[m.round].push(m)
  }
  const phases = PHASE_ORDER.filter((p) => matchesByPhase[p]?.length)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">📋 Painel de Palpites</h1>
      <p className="text-nlw-textHover mb-6 text-sm">Toque em uma fase para expandir, e em um jogo para ver os palpites</p>

      {phases.length === 0 ? (
        <div className="bg-nlw-card rounded-xl p-8 text-center">
          <p className="text-nlw-textMuted">Nenhum jogo cadastrado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {phases.map((phase) => (
            <PainelPhaseGroup
              key={phase}
              label={PHASE_LABEL[phase] ?? phase}
              matches={matchesByPhase[phase]}
              guessesByMatch={guessesByMatch}
              defaultOpen={phase === 'grupo'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
