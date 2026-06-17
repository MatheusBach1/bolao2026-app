import { supabase } from '@/lib/supabase'
import AdminPanel from '@/components/AdminPanel'
import type { Match } from '@/lib/supabase'

export const revalidate = 0

async function getPendingMatches(): Promise<Match[]> {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .lt('match_time', new Date().toISOString())
    .is('result_home', null)
    .order('match_time', { ascending: false })
  return data ?? []
}

async function getAllMatches(): Promise<Match[]> {
  const { data } = await supabase
    .from('matches')
    .select('*')
    .order('match_time', { ascending: false })
  return data ?? []
}

export default async function AdminPage() {
  const [pending, all] = await Promise.all([getPendingMatches(), getAllMatches()])

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark mb-2">🔧 Admin</h1>
      <p className="text-gray-500 mb-6 text-sm">Inserir resultados e cadastrar jogos</p>
      <AdminPanel pendingMatches={pending} allMatches={all} />
    </div>
  )
}
