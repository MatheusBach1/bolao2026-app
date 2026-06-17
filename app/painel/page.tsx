import { supabase } from '@/lib/supabase'
import type { Match, Guess } from '@/lib/supabase'
import { PLAYERS } from '@/lib/players'

export const revalidate = 60

async function getData() {
  const [{ data: matches }, { data: guesses }] = await Promise.all([
    supabase.from('matches').select('*').order('match_time', { ascending: true }),
    supabase.from('guesses').select('*'),
  ])
  return { matches: (matches ?? []) as Match[], guesses: (guesses ?? []) as Guess[] }
}

function pointsBadge(points: number | null) {
  if (points === null) return null
  if (points === 2)
    return <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full font-bold">⭐ 2pts</span>
  if (points === 1)
    return <span className="ml-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">✓ 1pt</span>
  return <span className="ml-1 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">✗ 0pts</span>
}

export default async function PainelPage() {
  const { matches, guesses } = await getData()

  const guessByMatchPlayer = new Map<string, Guess>()
  for (const g of guesses) {
    guessByMatchPlayer.set(`${g.match_id}:${g.player_name}`, g)
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      weekday: 'short', day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-2">📋 Painel de Palpites</h1>
      <p className="text-gray-500 mb-6 text-sm">Todos os palpites por jogo</p>

      <div className="space-y-6">
        {matches.map((match) => {
          const teams = match.teams.split(' x ')
          const home = teams[0] ?? 'Time A'
          const away = teams[1] ?? 'Time B'
          const hasResult = match.result_home !== null && match.result_away !== null

          return (
            <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-brand-dark text-white px-5 py-3 flex justify-between items-center">
                <div>
                  <span className="text-xs text-green-300 uppercase tracking-wide font-semibold">{match.group_name}</span>
                  <p className="font-bold mt-0.5">{home} × {away}</p>
                  <p className="text-xs text-gray-300">{formatTime(match.match_time)}</p>
                </div>
                {hasResult && (
                  <div className="text-center">
                    <p className="text-xs text-gray-300 mb-1">Resultado</p>
                    <span className="text-2xl font-bold">
                      {match.result_home} × {match.result_away}
                    </span>
                  </div>
                )}
              </div>
              <div className="divide-y divide-gray-50">
                {PLAYERS.map((player) => {
                  const g = guessByMatchPlayer.get(`${match.id}:${player}`)
                  return (
                    <div key={player} className="px-5 py-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-brand-dark">{player}</span>
                      {g ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-700">
                            {g.guess_home} × {g.guess_away}
                          </span>
                          {hasResult && pointsBadge(g.points)}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">sem palpite</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {matches.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
            <p className="text-gray-400">Nenhum jogo cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
