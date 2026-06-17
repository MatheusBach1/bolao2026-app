'use client'
import { useState } from 'react'
import { PLAYERS } from '@/lib/players'
import { getFlag } from '@/lib/flags'
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
      <div className="bg-nlw-card rounded-xl p-4 border-none">
        <label className="block text-sm font-semibold text-white mb-2">Quem é você?</label>
        <div className="flex flex-wrap gap-2">
          {PLAYERS.map((p) => (
            <button
              key={p}
              onClick={() => setPlayer(p)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                player === p
                  ? 'bg-nlw-yellow text-black'
                  : 'bg-nlw-bg text-nlw-textMuted hover:text-white'
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
          <div key={match.id} className="bg-nlw-card rounded-xl p-5 border-none border-b-4 border-b-nlw-yellow">
            <div className="flex justify-center items-center mb-1 text-center">
              <div>
                <span className="text-sm font-bold text-white tracking-wide">
                  {getFlag(home)} {home} vs. {getFlag(away)} {away}
                </span>
                <p className="text-xs text-nlw-textMuted mt-0.5">{formatTime(match.match_time)}</p>
                {match.group_name && (
                   <div className="mt-1 text-[10px] text-nlw-yellow uppercase">{match.group_name}</div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-5 mt-4">
              <span className="flex-1 text-right font-bold text-white text-sm">
                <span className="text-xl mr-1">{getFlag(home)}</span>
                {home}
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={99}
                  disabled={!open || done || !player}
                  value={guesses[match.id]?.home ?? ''}
                  onChange={(e) =>
                    setGuesses((g) => ({ ...g, [match.id]: { ...g[match.id], home: e.target.value } }))
                  }
                  className="w-12 h-12 bg-nlw-input text-white text-center rounded text-xl font-bold focus:outline-none disabled:opacity-50"
                />
                <span className="text-nlw-textMuted font-bold">×</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  disabled={!open || done || !player}
                  value={guesses[match.id]?.away ?? ''}
                  onChange={(e) =>
                    setGuesses((g) => ({ ...g, [match.id]: { ...g[match.id], away: e.target.value } }))
                  }
                  className="w-12 h-12 bg-nlw-input text-white text-center rounded text-xl font-bold focus:outline-none disabled:opacity-50"
                />
              </div>
              <span className="flex-1 text-left font-bold text-white text-sm">
                {away}
                <span className="text-xl ml-1">{getFlag(away)}</span>
              </span>
            </div>

            {error[match.id] && (
              <p className="text-red-500 text-xs mb-2">{error[match.id]}</p>
            )}

            {done ? (
              <div className="w-full bg-nlw-bg text-nlw-green py-3 rounded text-sm font-bold text-center uppercase">
                ✓ Palpite Confimado
              </div>
            ) : !open ? (
              <div className="w-full bg-nlw-input text-nlw-textMuted py-3 rounded text-sm font-bold text-center uppercase">
                Tempo Esgotado
              </div>
            ) : (
              <button
                onClick={() => submitGuess(match.id)}
                disabled={loading[match.id] || !player}
                className="w-full bg-nlw-green text-white py-3 rounded text-sm font-bold uppercase transition-colors hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading[match.id] ? 'Enviando...' : 'Confirmar Palpite ✓'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
