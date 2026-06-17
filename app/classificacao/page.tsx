import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 300

type TeamStats = {
  name: string
  played: number; win: number; draw: number; lose: number
  gf: number; ga: number; points: number
  form: string[]
}

type Group = {
  name: string
  standings: TeamStats[]
}

async function getStandingsFromMatches(): Promise<Group[]> {
  const { data: matches } = await supabaseAdmin
    .from('matches')
    .select('*')
    .not('group_name', 'ilike', '%final%')
    .not('group_name', 'ilike', '%oitava%')
    .not('group_name', 'ilike', '%quarta%')
    .not('group_name', 'ilike', '%semi%')
    .order('match_time', { ascending: true })

  if (!matches || matches.length === 0) return []

  const groups: Record<string, Record<string, TeamStats>> = {}

  for (const match of matches) {
    const g = match.group_name
    if (!groups[g]) groups[g] = {}

    const teams = match.teams.split(' x ')
    const home = teams[0]?.trim()
    const away = teams[1]?.trim()
    if (!home || !away) continue

    if (!groups[g][home]) groups[g][home] = { name: home, played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, points: 0, form: [] }
    if (!groups[g][away]) groups[g][away] = { name: away, played: 0, win: 0, draw: 0, lose: 0, gf: 0, ga: 0, points: 0, form: [] }

    if (match.result_home === null || match.result_away === null) continue

    const rh: number = match.result_home
    const ra: number = match.result_away

    groups[g][home].played++
    groups[g][away].played++
    groups[g][home].gf += rh
    groups[g][home].ga += ra
    groups[g][away].gf += ra
    groups[g][away].ga += rh

    if (rh > ra) {
      groups[g][home].win++; groups[g][home].points += 3; groups[g][home].form.push('W')
      groups[g][away].lose++; groups[g][away].form.push('L')
    } else if (rh < ra) {
      groups[g][away].win++; groups[g][away].points += 3; groups[g][away].form.push('W')
      groups[g][home].lose++; groups[g][home].form.push('L')
    } else {
      groups[g][home].draw++; groups[g][home].points++; groups[g][home].form.push('D')
      groups[g][away].draw++; groups[g][away].points++; groups[g][away].form.push('D')
    }
  }

  return Object.entries(groups)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, teams]) => ({
      name: groupName,
      standings: Object.values(teams).sort((a, b) =>
        b.points - a.points ||
        (b.gf - b.ga) - (a.gf - a.ga) ||
        b.gf - a.gf
      ),
    }))
}

function FormDot({ result }: { result: string }) {
  if (result === 'W')
    return <span className="w-5 h-5 rounded-full bg-nlw-green flex items-center justify-center text-[9px] font-bold text-black">V</span>
  if (result === 'L')
    return <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[9px] font-bold text-white">D</span>
  return <span className="w-5 h-5 rounded-full bg-nlw-textHover flex items-center justify-center text-[9px] font-bold text-white">E</span>
}

export default async function ClassificacaoPage() {
  const groups = await getStandingsFromMatches()

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">📊 Classificação</h1>
      <p className="text-nlw-textHover mb-6 text-sm">Fase de Grupos — Copa do Mundo 2026</p>

      {groups.length === 0 ? (
        <div className="bg-nlw-card rounded-xl p-8 text-center">
          <p className="text-nlw-textMuted">Nenhum resultado disponível ainda.</p>
          <p className="text-nlw-textHover text-xs mt-2">A tabela será atualizada conforme os jogos forem encerrados.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((group) => (
            <div key={group.name} className="bg-nlw-card rounded-xl overflow-hidden">
              <div className="bg-nlw-input px-4 py-2.5">
                <h2 className="font-bold text-white text-sm">{group.name}</h2>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-nlw-textHover border-b border-nlw-input">
                    <th className="py-2 px-3 text-left w-5">#</th>
                    <th className="py-2 px-3 text-left">Equipe</th>
                    <th className="py-2 px-1 text-center w-7" title="Pontos">Pts</th>
                    <th className="py-2 px-1 text-center w-7" title="Jogos">PJ</th>
                    <th className="py-2 px-1 text-center w-7 hidden sm:table-cell" title="Vitórias">V</th>
                    <th className="py-2 px-1 text-center w-7 hidden sm:table-cell" title="Empates">E</th>
                    <th className="py-2 px-1 text-center w-7 hidden sm:table-cell" title="Derrotas">D</th>
                    <th className="py-2 px-1 text-center w-10 hidden sm:table-cell" title="Saldo de Gols">SG</th>
                    <th className="py-2 px-3 text-center">Últimas 5</th>
                  </tr>
                </thead>
                <tbody>
                  {group.standings.map((team, i) => {
                    const gd = team.gf - team.ga
                    const last5 = team.form.slice(-5)
                    const qualified = i < 2
                    return (
                      <tr
                        key={team.name}
                        className={`border-b border-nlw-input/50 ${qualified ? 'border-l-2 border-l-nlw-green' : 'border-l-2 border-l-transparent'}`}
                      >
                        <td className="py-2.5 px-3 text-nlw-textHover font-semibold">{i + 1}</td>
                        <td className="py-2.5 px-3 text-white font-medium">{team.name}</td>
                        <td className="py-2.5 px-1 text-center font-bold text-white">{team.points}</td>
                        <td className="py-2.5 px-1 text-center text-nlw-textMuted">{team.played}</td>
                        <td className="py-2.5 px-1 text-center text-nlw-textMuted hidden sm:table-cell">{team.win}</td>
                        <td className="py-2.5 px-1 text-center text-nlw-textMuted hidden sm:table-cell">{team.draw}</td>
                        <td className="py-2.5 px-1 text-center text-nlw-textMuted hidden sm:table-cell">{team.lose}</td>
                        <td className={`py-2.5 px-1 text-center hidden sm:table-cell font-semibold ${gd > 0 ? 'text-nlw-green' : gd < 0 ? 'text-red-400' : 'text-nlw-textMuted'}`}>
                          {gd > 0 ? `+${gd}` : gd}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex gap-0.5 justify-center">
                            {last5.length === 0
                              ? <span className="text-nlw-textHover">—</span>
                              : last5.map((r, idx) => <FormDot key={idx} result={r} />)
                            }
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="px-3 py-2 flex items-center gap-1.5 text-[10px] text-nlw-textHover border-t border-nlw-input">
                <span className="inline-block w-2 h-3 bg-nlw-green rounded-sm mr-0.5"></span>
                Classificado para as oitavas de final
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
