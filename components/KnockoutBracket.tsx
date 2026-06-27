'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { getFlag } from '@/lib/flags'
import type { Match } from '@/lib/supabase'

interface Props {
  matchesByRound: Record<string, Match[]>
}

const ROUNDS = [
  { key: 'segunda-rodada', label: 'Segunda Rodada', slots: 16 },
  { key: 'oitavas',        label: 'Oitavas de Final', slots: 8 },
  { key: 'quartas',        label: 'Quartas de Final', slots: 4 },
  { key: 'semifinal',      label: 'Semifinais', slots: 2 },
  { key: 'final',          label: 'Final', slots: 1 },
]

function parseTeams(match: Match) {
  const parts = match.teams.split(' x ')
  return { home: parts[0]?.trim() ?? 'A definir', away: parts[1]?.trim() ?? 'A definir' }
}

function MatchCard({ match, nextMatch }: { match: Match | null; nextMatch?: Match | null }) {
  const hasResult = match && match.result_home !== null && match.result_away !== null
  const { home, away } = match ? parseTeams(match) : { home: 'A definir', away: 'A definir' }
  const homeWon = hasResult && match!.result_home! > match!.result_away!
  const awayWon = hasResult && match!.result_away! > match!.result_home!

  return (
    <div className="bg-[#1c1c1f] rounded-xl overflow-hidden border border-[#2c2c30]">
      {/* date */}
      {match && (
        <div className="px-3 pt-2.5 pb-1 text-[11px] text-nlw-textHover">
          {new Date(match.match_time).toLocaleString('pt-BR', {
            weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}
      {!match && (
        <div className="px-3 pt-2.5 pb-1 text-[11px] text-nlw-textHover italic">A definir</div>
      )}

      {/* home */}
      <div className={`px-3 py-2.5 flex items-center gap-2.5 border-b border-[#2c2c30] ${homeWon ? 'bg-nlw-green/10' : ''}`}>
        {match && home !== 'A definir'
          ? <span className="text-lg leading-none shrink-0">{getFlag(home)}</span>
          : <span className="w-5 h-5 rounded-full border border-[#3c3c40] shrink-0" />
        }
        <span className={`flex-1 text-sm font-semibold truncate ${!match ? 'text-nlw-textHover italic' : homeWon ? 'text-nlw-green' : 'text-white'}`}>
          {home}
        </span>
        {hasResult && (
          <span className={`text-sm font-bold shrink-0 ${homeWon ? 'text-nlw-green' : 'text-nlw-textMuted'}`}>
            {match!.result_home}
          </span>
        )}
      </div>

      {/* away */}
      <div className={`px-3 py-2.5 flex items-center gap-2.5 ${awayWon ? 'bg-nlw-green/10' : ''}`}>
        {match && away !== 'A definir'
          ? <span className="text-lg leading-none shrink-0">{getFlag(away)}</span>
          : <span className="w-5 h-5 rounded-full border border-[#3c3c40] shrink-0" />
        }
        <span className={`flex-1 text-sm font-semibold truncate ${!match ? 'text-nlw-textHover italic' : awayWon ? 'text-nlw-green' : 'text-white'}`}>
          {away}
        </span>
        {hasResult && (
          <span className={`text-sm font-bold shrink-0 ${awayWon ? 'text-nlw-green' : 'text-nlw-textMuted'}`}>
            {match!.result_away}
          </span>
        )}
      </div>
    </div>
  )
}

// Pair of matches with connector line to next round match (like Google's bracket)
function MatchPair({ top, bottom, next }: { top: Match | null; bottom: Match | null; next?: Match | null }) {
  return (
    <div className="flex items-stretch gap-0">
      <div className="flex flex-col gap-2 flex-1">
        <MatchCard match={top} />
        <MatchCard match={bottom} />
      </div>
      {/* connector bracket */}
      <div className="flex flex-col items-center" style={{ width: 28 }}>
        {/* top half line */}
        <div className="flex-1 flex justify-center">
          <div className="w-px bg-[#3c3c40] h-full ml-0" />
        </div>
        {/* horizontal mid */}
        <div className="h-px w-full bg-[#3c3c40]" />
        {/* bottom half line */}
        <div className="flex-1 flex justify-center">
          <div className="w-px bg-[#3c3c40] h-full" />
        </div>
      </div>
      {/* next round card — only shown on desktop (hidden on mobile; next round is its own tab) */}
      {next !== undefined && (
        <div className="hidden lg:flex items-center" style={{ minWidth: 260 }}>
          <MatchCard match={next} />
        </div>
      )}
    </div>
  )
}

export default function KnockoutBracket({ matchesByRound }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)

  // Touch swipe
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const swiping = useRef(false)

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(ROUNDS.length - 1, idx))
    setActiveIdx(clamped)
    // scroll tab into view
    const tabEl = tabsRef.current?.children[clamped] as HTMLElement
    tabEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [])

  function getSlotted(roundKey: string, totalSlots: number): (Match | null)[] {
    const matches = matchesByRound[roundKey] ?? []
    const arr: (Match | null)[] = Array(totalSlots).fill(null)
    for (const m of matches) {
      const idx = (m.slot ?? 1) - 1
      if (idx >= 0 && idx < totalSlots) arr[idx] = m
    }
    return arr
  }

  function getRoundContent(roundIdx: number) {
    const round = ROUNDS[roundIdx]
    if (!round) return null
    const slots = getSlotted(round.key, round.slots)

    if (round.slots === 1) {
      return (
        <div className="px-4 pt-4">
          <MatchCard match={slots[0]} />
        </div>
      )
    }

    // Build pairs: every 2 consecutive slots form a pair
    const pairs: Array<[Match | null, Match | null]> = []
    for (let i = 0; i < slots.length; i += 2) {
      pairs.push([slots[i] ?? null, slots[i + 1] ?? null])
    }

    // Next round for connector preview
    const nextRound = ROUNDS[roundIdx + 1]
    const nextSlots = nextRound ? getSlotted(nextRound.key, nextRound.slots) : []

    return (
      <div className="px-4 pt-4 space-y-4 pb-4">
        {pairs.map((pair, pi) => (
          <div key={pi}>
            <MatchPair top={pair[0]} bottom={pair[1]} next={nextSlots[pi] ?? null} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="select-none">
      {/* Tab bar — horizontally scrollable */}
      <div
        ref={tabsRef}
        className="flex overflow-x-auto gap-0 border-b border-[#2c2c30] scrollbar-hide"
        style={{ scrollbarWidth: 'none' }}
      >
        {ROUNDS.map((r, i) => (
          <button
            key={r.key}
            onClick={() => goTo(i)}
            className={`shrink-0 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
              activeIdx === i
                ? 'text-nlw-yellow border-nlw-yellow'
                : 'text-nlw-textHover border-transparent hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Swipeable content */}
      <div
        className="overflow-hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
          touchStartY.current = e.touches[0].clientY
          swiping.current = false
        }}
        onTouchMove={(e) => {
          const dx = e.touches[0].clientX - touchStartX.current
          const dy = e.touches[0].clientY - touchStartY.current
          // Only trigger horizontal swipe if clearly horizontal
          if (!swiping.current && Math.abs(dx) > Math.abs(dy) + 5) {
            swiping.current = true
          }
        }}
        onTouchEnd={(e) => {
          if (!swiping.current) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 40) {
            goTo(activeIdx + (dx < 0 ? 1 : -1))
          }
          swiping.current = false
        }}
      >
        <div
          ref={sliderRef}
          style={{
            display: 'flex',
            width: `${ROUNDS.length * 100}%`,
            transform: `translateX(-${(activeIdx / ROUNDS.length) * 100}%)`,
            transition: 'transform 0.3s ease',
          }}
        >
          {ROUNDS.map((_, i) => (
            <div key={i} style={{ width: `${100 / ROUNDS.length}%` }} className="min-h-[300px]">
              {getRoundContent(i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
