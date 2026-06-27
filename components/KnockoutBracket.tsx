'use client'
import { useRef, useState, useCallback } from 'react'
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

function MatchCard({ match }: { match: Match | null }) {
  const hasResult = match && match.result_home !== null && match.result_away !== null
  const { home, away } = match ? parseTeams(match) : { home: 'A definir', away: 'A definir' }
  const homeWon = hasResult && match!.result_home! > match!.result_away!
  const awayWon = hasResult && match!.result_away! > match!.result_home!

  return (
    <div className="bg-[#1c1c1f] rounded-xl overflow-hidden border border-[#2c2c30]">
      {match && (
        <div className="px-3 pt-2.5 pb-1 text-[11px] text-nlw-textHover">
          {new Date(match.match_time).toLocaleString('pt-BR', {
            weekday: 'short', day: '2-digit', month: '2-digit',
            hour: '2-digit', minute: '2-digit',
          })}
        </div>
      )}
      {!match && (
        <div className="px-3 pt-2.5 pb-1 text-[11px] text-nlw-textHover">A definir</div>
      )}

      {/* home row */}
      <div className={`px-3 py-2.5 flex items-center gap-2.5 border-b border-[#2c2c30] ${homeWon ? 'bg-nlw-green/10' : ''}`}>
        {match && home !== 'A definir'
          ? <span className="text-lg leading-none shrink-0">{getFlag(home)}</span>
          : <span className="w-5 h-5 rounded-full border border-[#3c3c40] shrink-0" />
        }
        <span className={`flex-1 text-sm font-semibold truncate ${!match ? 'text-nlw-textHover italic' : homeWon ? 'text-nlw-green' : 'text-white'}`}>
          {home}
        </span>
        {hasResult && (
          <span className={`text-sm font-bold shrink-0 ml-2 ${homeWon ? 'text-nlw-green' : 'text-nlw-textMuted'}`}>
            {match!.result_home}
          </span>
        )}
      </div>

      {/* away row */}
      <div className={`px-3 py-2.5 flex items-center gap-2.5 ${awayWon ? 'bg-nlw-green/10' : ''}`}>
        {match && away !== 'A definir'
          ? <span className="text-lg leading-none shrink-0">{getFlag(away)}</span>
          : <span className="w-5 h-5 rounded-full border border-[#3c3c40] shrink-0" />
        }
        <span className={`flex-1 text-sm font-semibold truncate ${!match ? 'text-nlw-textHover italic' : awayWon ? 'text-nlw-green' : 'text-white'}`}>
          {away}
        </span>
        {hasResult && (
          <span className={`text-sm font-bold shrink-0 ml-2 ${awayWon ? 'text-nlw-green' : 'text-nlw-textMuted'}`}>
            {match!.result_away}
          </span>
        )}
      </div>
    </div>
  )
}

// Layout: [top card] \
//                     |--- [next card (partially visible)]
//         [bot card] /
//
// The bracket connector is 24px wide.
// The next card sits to the right, vertically centered between top+bottom.
// Lines: horizontal from right edge of top card → vertical bar → horizontal from right edge of bot card.
// The vertical bar's midpoint connects horizontally to the left edge of the next card.
function MatchPair({ top, bottom, next }: { top: Match | null; bottom: Match | null; next?: Match | null }) {
  return (
    <div className="flex items-stretch gap-0">
      {/* left pair */}
      <div className="flex flex-col gap-3 min-w-0" style={{ flex: '0 0 auto', width: 'calc(55% - 12px)' }}>
        <MatchCard match={top} />
        <MatchCard match={bottom} />
      </div>

      {/* bracket connector */}
      <div className="relative flex-none" style={{ width: 24 }}>
        {/* top horizontal — from left to center */}
        <div className="absolute bg-[#3c3c45]" style={{ height: 1, left: 0, right: '50%', top: '25%' }} />
        {/* bottom horizontal — from left to center */}
        <div className="absolute bg-[#3c3c45]" style={{ height: 1, left: 0, right: '50%', bottom: '25%' }} />
        {/* vertical bar connecting top and bottom at center */}
        <div className="absolute bg-[#3c3c45]" style={{ width: 1, left: '50%', top: '25%', bottom: '25%' }} />
        {/* horizontal to next card */}
        <div className="absolute bg-[#3c3c45]" style={{ height: 1, left: '50%', right: 0, top: '50%' }} />
      </div>

      {/* next round card — vertically centered, partially clipped to hint at more */}
      <div className="flex items-center" style={{ flex: '0 0 auto', width: 'calc(45% + 12px)' }}>
        <div className="w-full">
          <MatchCard match={next ?? null} />
        </div>
      </div>
    </div>
  )
}

export default function KnockoutBracket({ matchesByRound }: Props) {
  const [activeIdx, setActiveIdx] = useState(0)
  const tabsRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)
  const touchStartY = useRef(0)
  const maybeSwipe = useRef(false)

  const goTo = useCallback((idx: number) => {
    const clamped = Math.max(0, Math.min(ROUNDS.length - 1, idx))
    setActiveIdx(clamped)
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
        <div className="p-4 max-w-sm mx-auto">
          <MatchCard match={slots[0]} />
        </div>
      )
    }

    const pairs: Array<[Match | null, Match | null]> = []
    for (let i = 0; i < slots.length; i += 2) {
      pairs.push([slots[i] ?? null, slots[i + 1] ?? null])
    }

    // next round slots — each pair feeds into one slot of the next round
    const nextRound = ROUNDS[roundIdx + 1]
    const nextSlots = nextRound ? getSlotted(nextRound.key, nextRound.slots) : []

    return (
      <div className="p-4 space-y-6 overflow-hidden">
        {pairs.map((pair, pi) => (
          <MatchPair key={pi} top={pair[0]} bottom={pair[1]} next={nextSlots[pi] ?? null} />
        ))}
      </div>
    )
  }

  return (
    <div className="select-none">
      {/* Tab bar */}
      <div
        ref={tabsRef}
        className="flex overflow-x-auto border-b border-[#2c2c30]"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        {ROUNDS.map((r, i) => (
          <button
            key={r.key}
            onClick={() => goTo(i)}
            className={`shrink-0 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeIdx === i
                ? 'text-nlw-yellow border-nlw-yellow'
                : 'text-nlw-textHover border-transparent hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Swipeable panels */}
      <div
        className="overflow-hidden"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
          touchStartY.current = e.touches[0].clientY
          maybeSwipe.current = false
        }}
        onTouchMove={(e) => {
          const dx = Math.abs(e.touches[0].clientX - touchStartX.current)
          const dy = Math.abs(e.touches[0].clientY - touchStartY.current)
          if (!maybeSwipe.current && dx > dy + 5) maybeSwipe.current = true
        }}
        onTouchEnd={(e) => {
          if (!maybeSwipe.current) return
          const dx = e.changedTouches[0].clientX - touchStartX.current
          if (Math.abs(dx) > 40) goTo(activeIdx + (dx < 0 ? 1 : -1))
          maybeSwipe.current = false
        }}
      >
        <div
          style={{
            display: 'flex',
            width: `${ROUNDS.length * 100}%`,
            transform: `translateX(-${(activeIdx / ROUNDS.length) * 100}%)`,
            transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {ROUNDS.map((_, i) => (
            <div key={i} style={{ width: `${100 / ROUNDS.length}%` }} className="min-h-64">
              {getRoundContent(i)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
