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

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-2">🏆 Placar</h1>
      <p className="text-gray-500 mb-6 text-sm">Ranking por pontuação total</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-brand-dark text-white text-sm">
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Participante</th>
              <th className="py-3 px-4 text-center">Pts</th>
              <th className="py-3 px-4 text-center hidden sm:table-cell">⭐ Exatos</th>
              <th className="py-3 px-4 text-center hidden sm:table-cell">✓ Vencedor</th>
              <th className="py-3 px-4 text-center hidden sm:table-cell">✗ Erros</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ranking.map((r, i) => (
              <tr
                key={r.name}
                className={`${i === 0 ? 'bg-yellow-50' : ''} hover:bg-gray-50 transition-colors`}
              >
                <td className="py-3 px-4 text-sm font-bold text-gray-400">
                  {medals[i] ?? i + 1}
                </td>
                <td className="py-3 px-4 font-semibold text-brand-dark">{r.name}</td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block bg-brand-green text-white text-sm font-bold px-3 py-0.5 rounded-full min-w-[2.5rem] text-center">
                    {r.total}
                  </span>
                </td>
                <td className="py-3 px-4 text-center text-sm text-yellow-600 font-semibold hidden sm:table-cell">{r.exact}</td>
                <td className="py-3 px-4 text-center text-sm text-blue-600 hidden sm:table-cell">{r.winner}</td>
                <td className="py-3 px-4 text-center text-sm text-gray-400 hidden sm:table-cell">{r.zero}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-4 text-xs text-gray-400">
        <span>⭐ Placar exato = 2pts</span>
        <span>✓ Acertou vencedor = 1pt</span>
        <span>✗ Errou = 0pts</span>
      </div>
    </div>
  )
}
