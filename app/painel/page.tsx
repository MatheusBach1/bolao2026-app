import { supabaseAdmin as supabase } from '@/lib/supabase'
import type { Match, Guess } from '@/lib/supabase'
import PainelMatchCard from '@/components/PainelMatchCard'

export const revalidate = 60

async function getData() {
  const [{ data: matches }, { data: guesses }] = await Promise.all([
    supabase.from('matches').select('*').order('match_time', { ascending: true }),
    supabase.from('guesses').select('*'),
  ])
  return { matches: (matches ?? []) as Match[], guesses: (guesses ?? []) as Guess[] }
}

export default async function PainelPage() {
  const { matches, guesses } = await getData()

  const guessesByMatch = new Map<number, Guess[]>()
  for (const g of guesses) {
    const list = guessesByMatch.get(g.match_id) ?? []
    list.push(g)
    guessesByMatch.set(g.match_id, list)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">📋 Painel de Palpites</h1>
      <p className="text-nlw-textHover mb-6 text-sm">Toque em um jogo para ver os palpites</p>

      <div className="space-y-2">
        {matches.map((match) => (
          <PainelMatchCard
            key={match.id}
            match={match}
            guesses={guessesByMatch.get(match.id) ?? []}
          />
        ))}
        {matches.length === 0 && (
          <div className="bg-nlw-card rounded-xl p-8 text-center">
            <p className="text-nlw-textMuted">Nenhum jogo cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
