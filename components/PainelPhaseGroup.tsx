'use client'
import { useState } from 'react'
import type { Match, Guess } from '@/lib/supabase'
import PainelMatchCard from './PainelMatchCard'

interface Props {
  label: string
  matches: Match[]
  guessesByMatch: Record<number, Guess[]>
  defaultOpen?: boolean
}

export default function PainelPhaseGroup({ label, matches, guessesByMatch, defaultOpen = true }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  const totalGuesses = matches.reduce((sum, m) => sum + (guessesByMatch[m.id]?.length ?? 0), 0)
  const withResult = matches.filter((m) => m.result_home !== null).length

  return (
    <div className="rounded-xl overflow-hidden border border-[#2c2c30]">
      {/* Phase header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full bg-[#18181b] px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#1f1f23] transition-colors"
      >
        <div className="flex items-center gap-3">
          <svg
            className={`w-4 h-4 text-nlw-textHover transition-transform duration-200 shrink-0 ${open ? 'rotate-90' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-bold text-white">{label}</span>
          <span className="text-xs text-nlw-textHover">
            {matches.length} jogo{matches.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-nlw-textHover shrink-0">
          {withResult > 0 && (
            <span className="bg-nlw-green/15 text-nlw-green px-2 py-0.5 rounded-full font-semibold">
              {withResult}/{matches.length} concluídos
            </span>
          )}
          <span>{totalGuesses} palpites</span>
        </div>
      </button>

      {/* Matches list */}
      {open && (
        <div className="space-y-2 p-2 bg-nlw-bg">
          {matches.map((match) => (
            <PainelMatchCard
              key={match.id}
              match={match}
              guesses={guessesByMatch[match.id] ?? []}
            />
          ))}
        </div>
      )}
    </div>
  )
}
