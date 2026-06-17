'use client'
import { useState } from 'react'
import { PLAYERS } from '@/lib/players'
import type { Match } from '@/lib/supabase'

interface Props {
  matches: Match[]
}

interface GuessInput {
  home: string
  away: string
}

export default function GuessForm({ matches }: Props) {
  const [player, setPlayer] = useState<string>('')
  const [guesses, setGuesses] = useState<Record<number, GuessInput>>({})
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({})
  const [loading, setLoading] = useState<Record<number, boolean>>({})
  const [error, setError] = useState<Record<number, string>>({})

  function canGuess(match: Match) {
    const deadline = new Date(match.match_time).getTime() - 5 * 60 * 1000
    return Date.now() < deadline
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function submitGuess(matchId: number) {
    if (!player) return setError((e) => ({ ...e, [matchId]: 'Selecione seu nome.' }))
    const g = guesses[matchId]
    if (!g || g.home === '' || g.away === '') {
      return setError((e) => ({ ...e, [matchId]: 'Preencha o placar.' }))
    }
    setLoading((l) => ({ ...l, [matchId]: true }))
    setError((e) => ({ ...e, [matchId]: '' }))
    try {
      const res = await fetch('/api/guesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_name: player,
          match_id: matchId,
          guess_home: Number(g.home),
          guess_away: Number(g.away),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar palpite.')
      setSubmitted((s) => ({ ...s, [matchId]: true }))
    } catch (err: unknown) {
      setError((e) => ({ ...e, [matchId]: (err as Error).message }))
    } finally {
      setLoading((l) => ({ ...l, [matchId]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <label className="block text-sm font-semibold text-brand-dark mb-2">Quem é você?</label>
        <div className="flex flex-wrap gap-2">
          {PLAYERS.map((p) => (
            <button
              key={p}
              onClick={() => setPlayer(p)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                player === p
                  ? 'bg-brand-green text-white border-brand-green'
                  : 'bg-white text-brand-dark border-gray-200 hover:border-brand-green'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {matches.map((match) => {
        const teams = match.teams.split(' x ')
        const home = teams[0] ?? 'Time A'
        const away = teams[1] ?? 'Time B'
        const open = canGuess(match)
        const done = submitted[match.id]

        return (
          <div key={match.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-xs font-semibold text-brand-green uppercase tracking-wide">
                  {match.group_name}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">{formatTime(match.match_time)}</p>
              </div>
              {!open && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                  Encerrado
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="flex-1 text-right font-semibold text-brand-dark">{home}</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={99}
                  disabled={!open || done || !player}
                  value={guesses[match.id]?.home ?? ''}
                  onChange={(e) =>
                    setGuesses((g) => ({ ...g, [match.id]: { ...g[match.id], home: e.target.value } }))
                  }
                  className="w-12 h-10 text-center border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:border-brand-green disabled:bg-gray-50 disabled:text-gray-400"
                />
                <span className="text-gray-400 font-bold">×</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  disabled={!open || done || !player}
                  value={guesses[match.id]?.away ?? ''}
                  onChange={(e) =>
                    setGuesses((g) => ({ ...g, [match.id]: { ...g[match.id], away: e.target.value } }))
                  }
                  className="w-12 h-10 text-center border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:border-brand-green disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <span className="flex-1 font-semibold text-brand-dark">{away}</span>
            </div>

            {error[match.id] && (
              <p className="text-red-500 text-xs mb-2">{error[match.id]}</p>
            )}

            {done ? (
              <div className="text-center text-sm text-brand-green font-semibold">
                ✓ Palpite enviado!
              </div>
            ) : (
              <button
                onClick={() => submitGuess(match.id)}
                disabled={!open || loading[match.id] || !player}
                className="w-full bg-brand-green text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading[match.id] ? 'Enviando...' : 'Enviar Palpite'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
