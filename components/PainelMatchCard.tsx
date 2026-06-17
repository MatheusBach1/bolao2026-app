'use client'
import { useState } from 'react'
import { PLAYERS } from '@/lib/players'
import { getFlag } from '@/lib/flags'
import type { Match, Guess } from '@/lib/supabase'

function pointsBadge(points: number | null) {
  if (points === null) return null
  if (points === 2)
    return <span className="ml-1 text-xs bg-nlw-yellow/20 text-nlw-yellow px-1.5 py-0.5 rounded-full font-bold">⭐ 2pts</span>
  if (points === 1)
    return <span className="ml-1 text-xs bg-nlw-green/20 text-nlw-green px-1.5 py-0.5 rounded-full font-bold">✓ 1pt</span>
  return <span className="ml-1 text-xs bg-nlw-input text-nlw-textMuted px-1.5 py-0.5 rounded-full">✗ 0pts</span>
}

interface Props {
  match: Match
  guesses: Guess[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function PainelMatchCard({ match, guesses }: Props) {
  const [open, setOpen] = useState(false)

  const teams = match.teams.split(' x ')
  const home = teams[0] ?? 'Time A'
  const away = teams[1] ?? 'Time B'
  const hasResult = match.result_home !== null && match.result_away !== null

  const guessByPlayer = new Map<string, Guess>()
  for (const g of guesses) guessByPlayer.set(g.player_name, g)

  const guessCount = guesses.length

  return (
    <div className="bg-nlw-card rounded-xl overflow-hidden">
      {/* Header — sempre visível, clicável */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-nlw-input px-5 py-3 flex items-center justify-between text-left hover:bg-[#1a1a1e] transition-colors"
      >
        <div className="flex-1 min-w-0">
          <span className="text-xs text-nlw-yellow uppercase tracking-wide font-semibold">{match.group_name}</span>
          <p className="font-bold mt-0.5 text-white truncate">
            {getFlag(home)} {home} × {getFlag(away)} {away}
          </p>
          <p className="text-xs text-nlw-textMuted">{formatTime(match.match_time)}</p>
        </div>

        <div className="flex items-center gap-3 ml-3 shrink-0">
          {hasResult ? (
            <div className="text-center">
              <p className="text-[10px] text-nlw-textMuted mb-0.5">Resultado</p>
              <span className="text-xl font-bold text-white">
                {match.result_home} × {match.result_away}
              </span>
            </div>
          ) : (
            <span className="text-xs text-nlw-textHover">{guessCount}/6 palpites</span>
          )}

          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-nlw-textHover transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown de palpites */}
      {open && (
        <div className="divide-y divide-nlw-input">
          {PLAYERS.map((player) => {
            const g = guessByPlayer.get(player)
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
      )}
    </div>
  )
}
