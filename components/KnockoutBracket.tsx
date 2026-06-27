'use client'
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

function MatchCard({ match, size = 'md' }: { match: Match | null; size?: 'sm' | 'md' }) {
  const isPlaceholder = !match
  const hasResult = match && match.result_home !== null && match.result_away !== null
  const { home, away } = match ? parseTeams(match) : { home: 'A definir', away: 'A definir' }

  const homeWon = hasResult && match!.result_home! > match!.result_away!
  const awayWon = hasResult && match!.result_away! > match!.result_home!

  const padding = size === 'sm' ? 'px-2.5 py-2' : 'px-3 py-2.5'
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-xs'

  return (
    <div className={`bg-nlw-card rounded-lg overflow-hidden border border-nlw-input w-full ${size === 'sm' ? 'min-w-[130px]' : 'min-w-[160px]'}`}>
      {/* Home */}
      <div className={`${padding} flex items-center justify-between gap-1.5 border-b border-nlw-input ${homeWon ? 'bg-nlw-green/10' : ''}`}>
        <div className={`flex items-center gap-1 ${textSize} font-semibold truncate ${isPlaceholder ? 'text-nlw-textHover italic' : homeWon ? 'text-nlw-green' : 'text-white'}`}>
          {!isPlaceholder && home !== 'A definir' && <span>{getFlag(home)}</span>}
          <span className="truncate">{home}</span>
        </div>
        {hasResult && (
          <span className={`text-xs font-bold shrink-0 ${homeWon ? 'text-nlw-green' : 'text-nlw-textMuted'}`}>
            {match!.result_home}
          </span>
        )}
      </div>
      {/* Away */}
      <div className={`${padding} flex items-center justify-between gap-1.5 ${awayWon ? 'bg-nlw-green/10' : ''}`}>
        <div className={`flex items-center gap-1 ${textSize} font-semibold truncate ${isPlaceholder ? 'text-nlw-textHover italic' : awayWon ? 'text-nlw-green' : 'text-white'}`}>
          {!isPlaceholder && away !== 'A definir' && <span>{getFlag(away)}</span>}
          <span className="truncate">{away}</span>
        </div>
        {hasResult && (
          <span className={`text-xs font-bold shrink-0 ${awayWon ? 'text-nlw-green' : 'text-nlw-textMuted'}`}>
            {match!.result_away}
          </span>
        )}
      </div>
      {/* Date */}
      {match && (
        <div className="px-2.5 py-1 bg-nlw-input/50 text-[9px] text-nlw-textHover text-right">
          {new Date(match.match_time).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  )
}

export default function KnockoutBracket({ matchesByRound }: Props) {
  // Build lookup: round → sorted by slot
  function getSlotted(roundKey: string, totalSlots: number): (Match | null)[] {
    const matches = matchesByRound[roundKey] ?? []
    const arr: (Match | null)[] = Array(totalSlots).fill(null)
    for (const m of matches) {
      const idx = (m.slot ?? 1) - 1
      if (idx >= 0 && idx < totalSlots) arr[idx] = m
    }
    return arr
  }

  const segunda  = getSlotted('segunda-rodada', 16)
  const oitavas  = getSlotted('oitavas', 8)
  const quartas  = getSlotted('quartas', 4)
  const semis    = getSlotted('semifinal', 2)
  const finalR   = getSlotted('final', 1)

  // Mobile: show rounds as stacked sections
  // Desktop: show horizontal bracket
  return (
    <div>
      {/* Mobile view — stacked rounds */}
      <div className="md:hidden space-y-6">
        {ROUNDS.map((round) => {
          const roundMatches = matchesByRound[round.key] ?? []
          return (
            <div key={round.key}>
              <h2 className="text-sm font-bold text-nlw-yellow uppercase tracking-wide mb-3">{round.label}</h2>
              {roundMatches.length === 0 ? (
                <p className="text-nlw-textHover text-xs italic">Nenhum jogo cadastrado.</p>
              ) : (
                <div className="space-y-2">
                  {roundMatches
                    .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
                    .map((m) => <MatchCard key={m.id} match={m} />)
                  }
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Desktop bracket — horizontal scroll */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <div className="flex gap-0 min-w-max">

          {/* Segunda Rodada — 16 matches in 2 halves of 8 */}
          <BracketRound label="Segunda Rodada" count={16}>
            <div className="flex flex-col gap-3">
              {segunda.map((m, i) => (
                <MatchCard key={i} match={m} size="sm" />
              ))}
            </div>
          </BracketRound>

          <Connector count={8} />

          {/* Oitavas */}
          <BracketRound label="Oitavas de Final" count={8}>
            <div className="flex flex-col gap-3">
              {oitavas.map((m, i) => (
                <MatchCard key={i} match={m} size="sm" />
              ))}
            </div>
          </BracketRound>

          <Connector count={4} />

          {/* Quartas */}
          <BracketRound label="Quartas de Final" count={4}>
            <div className="flex flex-col gap-3">
              {quartas.map((m, i) => (
                <MatchCard key={i} match={m} size="sm" />
              ))}
            </div>
          </BracketRound>

          <Connector count={2} />

          {/* Semis */}
          <BracketRound label="Semifinais" count={2}>
            <div className="flex flex-col gap-3">
              {semis.map((m, i) => (
                <MatchCard key={i} match={m} />
              ))}
            </div>
          </BracketRound>

          <Connector count={1} />

          {/* Final */}
          <BracketRound label="Final" count={1}>
            <MatchCard match={finalR[0]} />
          </BracketRound>

        </div>
      </div>
    </div>
  )
}

function BracketRound({ label, children, count }: { label: string; children: React.ReactNode; count: number }) {
  // Vertical padding to center round relative to bracket height
  const topPad = count <= 1 ? 'py-0' : count <= 2 ? 'py-6' : count <= 4 ? 'py-4' : 'py-2'
  return (
    <div className={`flex flex-col ${topPad}`} style={{ minWidth: 180 }}>
      <p className="text-[10px] font-bold text-nlw-yellow uppercase tracking-wider mb-3 text-center">{label}</p>
      {children}
    </div>
  )
}

function Connector({ count }: { count: number }) {
  // Simple visual connector lines between rounds
  const items = Array(count).fill(null)
  return (
    <div className="flex flex-col justify-around" style={{ width: 24 }}>
      {items.map((_, i) => (
        <div key={i} className="flex-1 flex items-center">
          <div className="w-full h-px bg-nlw-textHover/30" />
        </div>
      ))}
    </div>
  )
}
