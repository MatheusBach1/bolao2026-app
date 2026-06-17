import { supabaseAdmin as supabase } from '@/lib/supabase'
import GuessForm from '@/components/GuessForm'
import type { Match } from '@/lib/supabase'

async function getUpcomingMatches(): Promise<Match[]> {
  const now = new Date()
  const cutoff = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const { data } = await supabase
    .from('matches')
    .select('*')
    .gte('match_time', now.toISOString())
    .lte('match_time', cutoff.toISOString())
    .order('match_time', { ascending: true })
  return data ?? []
}

export const revalidate = 60

export default async function HomePage() {
  const matches = await getUpcomingMatches()

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-2">⚽ Palpites</h1>
      <p className="text-gray-500 mb-6 text-sm">Jogos das próximas 24 horas</p>
      {matches.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <p className="text-gray-500">Nenhum jogo nas próximas 24 horas.</p>
        </div>
      ) : (
        <GuessForm matches={matches} />
      )}
    </div>
  )
}
