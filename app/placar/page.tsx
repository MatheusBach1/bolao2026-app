import { supabaseAdmin as supabase } from '@/lib/supabase'
import { PLAYERS } from '@/lib/players'
import type { Guess } from '@/lib/supabase'

export const revalidate = 60

async function getRanking() {
  const { data: guesses } = await supabase
    .from('guesses')
    .select('player_name, points')

  const totals: Record<string, { total: number; exact: number; winner: number; zero: number }> = {}
  for (const p of PLAYERS) {
    totals[p] = { total: 0, exact: 0, winner: 0, zero: 0 }
  }

  for (const g of (guesses ?? []) as Guess[]) {
    if (g.points === null) continue
    if (!totals[g.player_name]) continue
    totals[g.player_name].total += g.points
    if (g.points === 2) totals[g.player_name].exact++
    else if (g.points === 1) totals[g.player_name].winner++
    else totals[g.player_name].zero++
  }

  return Object.entries(totals)
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.total - a.total || b.exact - a.exact)
}

export default async function PlacarPage() {
  const ranking = await getRanking()

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">🏆 Placar</h1>
      <p className="text-nlw-textHover mb-6 text-sm">Ranking por pontuação total</p>

      <div className="space-y-4">
        {ranking.map((r, i) => (
          <div
            key={r.name}
            className={`bg-nlw-card rounded-xl p-4 py-5 flex items-center gap-4 border-none relative overflow-hidden ${
              i === 0 ? 'border-b-4 border-b-nlw-yellow' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#121214] flex items-center justify-center text-white font-bold text-xl uppercase shrink-0">
              {r.name.substring(0, 2)}
            </div>
            
            <div className="flex-1">
              <p className="text-white font-bold lg:text-lg">{r.name}</p>
              <p className="text-nlw-textMuted text-sm font-medium">{r.total} ponto(s)</p>
            </div>

            <div className={`px-4 py-1.5 rounded-full font-bold text-sm flex-shrink-0 ${
              i < 3 ? 'bg-nlw-yellow text-nlw-bg' : 'bg-[#121214] text-nlw-textMuted'
            }`}>
              {i + 1}º
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col md:flex-row md:items-center gap-4 md:gap-6 text-xs text-nlw-textMuted border-t border-nlw-card pt-6 justify-center">
        <span><strong className="text-nlw-yellow text-sm">2p</strong> = Placar exato</span>
        <span><strong className="text-nlw-green text-sm">1p</strong> = Acertou o vencedor</span>
      </div>
    </div>
  )
}
