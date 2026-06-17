import { supabaseAdmin as supabase } from '@/lib/supabase'
import type { Match, Guess } from '@/lib/supabase'
import { PLAYERS } from '@/lib/players'
import { getFlag } from '@/lib/flags'

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
    return <span className="ml-1 text-xs bg-nlw-yellow/20 text-nlw-yellow px-1.5 py-0.5 rounded-full font-bold">⭐ 2pts</span>
  if (points === 1)
    return <span className="ml-1 text-xs bg-nlw-green/20 text-nlw-green px-1.5 py-0.5 rounded-full font-bold">✓ 1pt</span>
  return <span className="ml-1 text-xs bg-nlw-input text-nlw-textMuted px-1.5 py-0.5 rounded-full">✗ 0pts</span>
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
      <h1 className="text-2xl font-bold text-white mb-2">📋 Painel de Palpites</h1>
      <p className="text-nlw-textHover mb-6 text-sm">Todos os palpites por jogo</p>

      <div className="space-y-6">
        {matches.map((match) => {
          const teams = match.teams.split(' x ')
          const home = teams[0] ?? 'Time A'
          const away = teams[1] ?? 'Time B'
          const hasResult = match.result_home !== null && match.result_away !== null

          return (
            <div key={match.id} className="bg-nlw-card rounded-xl overflow-hidden">
              <div className="bg-nlw-input px-5 py-3 flex justify-between items-center">
                <div>
                  <span className="text-xs text-nlw-yellow uppercase tracking-wide font-semibold">{match.group_name}</span>
                  <p className="font-bold mt-0.5 text-white">{getFlag(home)} {home} × {getFlag(away)} {away}</p>
                  <p className="text-xs text-nlw-textMuted">{formatTime(match.match_time)}</p>
                </div>
                {hasResult && (
                  <div className="text-center">
                    <p className="text-xs text-nlw-textMuted mb-1">Resultado</p>
                    <span className="text-2xl font-bold text-white">
                      {match.result_home} × {match.result_away}
                    </span>
                  </div>
                )}
              </div>
              <div className="divide-y divide-nlw-input">
                {PLAYERS.map((player) => {
                  const g = guessByMatchPlayer.get(`${match.id}:${player}`)
                  return (
                    <div key={player} className="px-5 py-3 flex items-center justify-between">
                      <span className="text-sm font-medium text-nlw-textMuted">{player}</span>
                      {g ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">
                            {g.guess_home} × {g.guess_away}
                          </span>
                          {hasResult && pointsBadge(g.points)}
                        </div>
                      ) : (
                        <span className="text-xs text-nlw-textHover italic">sem palpite</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
        {matches.length === 0 && (
          <div className="bg-nlw-card rounded-xl p-8 text-center">
            <p className="text-nlw-textMuted">Nenhum jogo cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
