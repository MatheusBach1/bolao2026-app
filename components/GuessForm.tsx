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
  penaltyWinner: '' | 'home' | 'away'
}

type ExistingGuess = {
  match_id: number
  guess_home: number
  guess_away: number
  guess_penalty_winner: 'home' | 'away' | null
}

export default function GuessForm({ matches }: Props) {
  const [player, setPlayer] = useState<string>('')
  const [guesses, setGuesses] = useState<Record<number, GuessInput>>({})
  const [existing, setExisting] = useState<Record<number, ExistingGuess>>({})
  const [loadingPlayer, setLoadingPlayer] = useState(false)
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

  async function selectPlayer(name: string) {
    setPlayer(name)
    setGuesses({})
    setSubmitted({})
    setError({})
    setExisting({})
    setLoadingPlayer(true)
    try {
      const res = await fetch(`/api/guesses?player=${encodeURIComponent(name)}`)
      const data = await res.json()
      if (res.ok && data.guesses) {
        const map: Record<number, ExistingGuess> = {}
        for (const g of data.guesses as ExistingGuess[]) {
          map[g.match_id] = g
        }
        setExisting(map)
      }
    } finally {
      setLoadingPlayer(false)
    }
  }

  async function submitGuess(matchId: number, isKnockout: boolean) {
    if (!player) return setError((e) => ({ ...e, [matchId]: 'Selecione seu nome.' }))
    const g = guesses[matchId]
    if (!g || g.home === '' || g.away === '') {
      return setError((e) => ({ ...e, [matchId]: 'Preencha o placar.' }))
    }
    const isDraw = Number(g.home) === Number(g.away)
    if (isKnockout && isDraw && !g.penaltyWinner) {
      return setError((e) => ({ ...e, [matchId]: 'Selecione quem vence nos pênaltis.' }))
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
          guess_penalty_winner: (isKnockout && isDraw && g.penaltyWinner) ? g.penaltyWinner : null,
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
      {/* Seleção de jogador */}
      <div className="bg-nlw-card rounded-xl p-4">
        <label className="block text-sm font-semibold text-white mb-2">Quem é você?</label>
        <div className="flex flex-wrap gap-2">
          {PLAYERS.map((p) => (
            <button
              key={p}
              onClick={() => selectPlayer(p)}
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
        {loadingPlayer && (
          <p className="text-xs text-nlw-textHover mt-2">Carregando palpites...</p>
        )}
      </div>

      {matches.map((match) => {
        const teams = match.teams.split(' x ')
        const home = teams[0] ?? 'Time A'
        const away = teams[1] ?? 'Time B'
        const isKnockout = match.round !== 'grupo'
        const open = canGuess(match)
        const existingGuess = existing[match.id]
        const done = submitted[match.id] || !!existingGuess

        const currentHome = existingGuess ? String(existingGuess.guess_home) : (guesses[match.id]?.home ?? '')
        const currentAway = existingGuess ? String(existingGuess.guess_away) : (guesses[match.id]?.away ?? '')
        const isDraw = currentHome !== '' && currentAway !== '' && Number(currentHome) === Number(currentAway)
        const showPenalties = isKnockout && isDraw && !done

        const existingPenalty = existingGuess?.guess_penalty_winner ?? null
        const selectedPenalty = done ? existingPenalty : (guesses[match.id]?.penaltyWinner ?? '')

        return (
          <div key={match.id} className="bg-nlw-card rounded-xl p-5 border-b-4 border-b-nlw-yellow">
            <div className="flex justify-center items-center mb-1 text-center">
              <div>
                <span className="text-sm font-bold text-white tracking-wide">
                  {getFlag(home)} {home} vs. {getFlag(away)} {away}
                </span>
                <p className="text-xs text-nlw-textMuted mt-0.5">{formatTime(match.match_time)}</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {match.group_name && (
                    <span className="text-[10px] text-nlw-yellow uppercase">{match.group_name}</span>
                  )}
                  {isKnockout && (
                    <span className="text-[10px] text-blue-400 uppercase font-semibold">· Eliminatória</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mb-4 mt-4">
              <span className="flex-1 text-right font-bold text-white text-sm">
                <span className="text-xl mr-1">{getFlag(home)}</span>
                {home}
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={99}
                  disabled={!open || done || !player || loadingPlayer}
                  value={currentHome}
                  onChange={(e) =>
                    setGuesses((g) => { const prev = g[match.id] ?? { home: '', away: '', penaltyWinner: '' as const }; return { ...g, [match.id]: { ...prev, home: e.target.value } } })
                  }
                  className="w-12 h-12 bg-nlw-input text-white text-center rounded text-xl font-bold focus:outline-none disabled:opacity-50"
                />
                <span className="text-nlw-textMuted font-bold">×</span>
                <input
                  type="number"
                  min={0}
                  max={99}
                  disabled={!open || done || !player || loadingPlayer}
                  value={currentAway}
                  onChange={(e) =>
                    setGuesses((g) => { const prev = g[match.id] ?? { home: '', away: '', penaltyWinner: '' as const }; return { ...g, [match.id]: { ...prev, away: e.target.value } } })
                  }
                  className="w-12 h-12 bg-nlw-input text-white text-center rounded text-xl font-bold focus:outline-none disabled:opacity-50"
                />
              </div>
              <span className="flex-1 text-left font-bold text-white text-sm">
                {away}
                <span className="text-xl ml-1">{getFlag(away)}</span>
              </span>
            </div>

            {/* Penalty winner picker — appears when knockout + draw */}
            {(showPenalties || (done && isKnockout && isDraw)) && (
              <div className="mb-4 p-3 bg-nlw-input rounded-lg">
                <p className="text-xs text-nlw-yellow font-semibold mb-2 text-center">
                  Empate — quem vence nos pênaltis?
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={done || !open || !player}
                    onClick={() =>
                      setGuesses((g) => ({ ...g, [match.id]: { ...g[match.id], penaltyWinner: 'home' } }))
                    }
                    className={`flex-1 py-2 rounded text-sm font-bold transition-colors disabled:cursor-default ${
                      selectedPenalty === 'home'
                        ? 'bg-nlw-yellow text-black'
                        : 'bg-nlw-card text-white hover:bg-[#2a2a2e] disabled:opacity-60'
                    }`}
                  >
                    {getFlag(home)} {home}
                  </button>
                  <button
                    disabled={done || !open || !player}
                    onClick={() =>
                      setGuesses((g) => ({ ...g, [match.id]: { ...g[match.id], penaltyWinner: 'away' } }))
                    }
                    className={`flex-1 py-2 rounded text-sm font-bold transition-colors disabled:cursor-default ${
                      selectedPenalty === 'away'
                        ? 'bg-nlw-yellow text-black'
                        : 'bg-nlw-card text-white hover:bg-[#2a2a2e] disabled:opacity-60'
                    }`}
                  >
                    {getFlag(away)} {away}
                  </button>
                </div>
              </div>
            )}

            {error[match.id] && (
              <p className="text-red-500 text-xs mb-2 text-center">{error[match.id]}</p>
            )}

            {done ? (
              <div className="w-full bg-nlw-bg text-nlw-green py-3 rounded text-sm font-bold text-center uppercase">
                ✓ Palpite Confirmado
              </div>
            ) : !open ? (
              <div className="w-full bg-nlw-input text-nlw-textMuted py-3 rounded text-sm font-bold text-center uppercase">
                Tempo Esgotado
              </div>
            ) : (
              <button
                onClick={() => submitGuess(match.id, isKnockout)}
                disabled={loading[match.id] || !player || loadingPlayer}
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
