'use client'
import { useState } from 'react'
import type { Match } from '@/lib/supabase'

interface Props {
  pendingMatches: Match[]
  allMatches: Match[]
}

export default function AdminPanel({ pendingMatches, allMatches }: Props) {
  const [results, setResults] = useState<Record<number, { home: string; away: string }>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [saved, setSaved] = useState<Record<number, boolean>>({})
  const [resErr, setResErr] = useState<Record<number, string>>({})

  const [newMatch, setNewMatch] = useState({ teams: '', match_time: '', group_name: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  async function saveResult(matchId: number) {
    const r = results[matchId]
    if (!r || r.home === '' || r.away === '') {
      return setResErr((e) => ({ ...e, [matchId]: 'Preencha os dois placares.' }))
    }
    setSaving((s) => ({ ...s, [matchId]: true }))
    setResErr((e) => ({ ...e, [matchId]: '' }))
    try {
      const res = await fetch('/api/admin/result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_id: matchId,
          result_home: Number(r.home),
          result_away: Number(r.away),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSaved((s) => ({ ...s, [matchId]: true }))
    } catch (err: unknown) {
      setResErr((e) => ({ ...e, [matchId]: (err as Error).message }))
    } finally {
      setSaving((s) => ({ ...s, [matchId]: false }))
    }
  }

  async function addMatch() {
    if (!newMatch.teams || !newMatch.match_time || !newMatch.group_name) {
      return setAddMsg('Preencha todos os campos.')
    }
    setAddLoading(true)
    setAddMsg('')
    try {
      const res = await fetch('/api/admin/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMatch),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAddMsg('Jogo cadastrado com sucesso!')
      setNewMatch({ teams: '', match_time: '', group_name: '' })
    } catch (err: unknown) {
      setAddMsg((err as Error).message)
    } finally {
      setAddLoading(false)
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    })
  }

  return (
    <div className="space-y-8">
      {/* Add Match */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="font-bold text-brand-dark mb-4">Cadastrar Jogo</h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Times (ex: Brasil x Argentina)</label>
            <input
              type="text"
              placeholder="Brasil x Argentina"
              value={newMatch.teams}
              onChange={(e) => setNewMatch((n) => ({ ...n, teams: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Data/Hora</label>
            <input
              type="datetime-local"
              value={newMatch.match_time}
              onChange={(e) => setNewMatch((n) => ({ ...n, match_time: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Grupo / Fase</label>
            <input
              type="text"
              placeholder="Grupo A"
              value={newMatch.group_name}
              onChange={(e) => setNewMatch((n) => ({ ...n, group_name: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>
        <button
          onClick={addMatch}
          disabled={addLoading}
          className="bg-brand-green text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40"
        >
          {addLoading ? 'Salvando...' : 'Cadastrar Jogo'}
        </button>
        {addMsg && <p className="mt-2 text-sm text-gray-600">{addMsg}</p>}
      </div>

      {/* Pending Results */}
      <div>
        <h2 className="font-bold text-brand-dark mb-3">Inserir Resultados ({pendingMatches.length})</h2>
        {pendingMatches.length === 0 ? (
          <p className="text-gray-400 text-sm">Nenhum jogo aguardando resultado.</p>
        ) : (
          <div className="space-y-3">
            {pendingMatches.map((match) => {
              const teams = match.teams.split(' x ')
              const home = teams[0] ?? 'Time A'
              const away = teams[1] ?? 'Time B'
              return (
                <div key={match.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-brand-green/10 text-brand-green px-2 py-0.5 rounded-full font-semibold">{match.group_name}</span>
                    <span className="text-xs text-gray-400">{formatTime(match.match_time)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-right font-semibold text-brand-dark">{home}</span>
                    <input
                      type="number"
                      min={0}
                      disabled={saved[match.id]}
                      value={results[match.id]?.home ?? ''}
                      onChange={(e) =>
                        setResults((r) => ({ ...r, [match.id]: { ...r[match.id], home: e.target.value } }))
                      }
                      className="w-12 h-10 text-center border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:border-brand-green disabled:bg-gray-50"
                    />
                    <span className="text-gray-400">×</span>
                    <input
                      type="number"
                      min={0}
                      disabled={saved[match.id]}
                      value={results[match.id]?.away ?? ''}
                      onChange={(e) =>
                        setResults((r) => ({ ...r, [match.id]: { ...r[match.id], away: e.target.value } }))
                      }
                      className="w-12 h-10 text-center border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:border-brand-green disabled:bg-gray-50"
                    />
                    <span className="flex-1 font-semibold text-brand-dark">{away}</span>
                    {saved[match.id] ? (
                      <span className="text-brand-green text-sm font-semibold ml-2">✓ Salvo</span>
                    ) : (
                      <button
                        onClick={() => saveResult(match.id)}
                        disabled={saving[match.id]}
                        className="ml-2 bg-brand-dark text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40"
                      >
                        {saving[match.id] ? '...' : 'Salvar'}
                      </button>
                    )}
                  </div>
                  {resErr[match.id] && (
                    <p className="text-red-500 text-xs mt-2">{resErr[match.id]}</p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* All Matches */}
      <div>
        <h2 className="font-bold text-brand-dark mb-3">Todos os Jogos ({allMatches.length})</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="py-2 px-4 text-left">Jogo</th>
                <th className="py-2 px-4 text-left">Grupo</th>
                <th className="py-2 px-4 text-center">Horário</th>
                <th className="py-2 px-4 text-center">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allMatches.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 font-medium text-brand-dark">{m.teams}</td>
                  <td className="py-2 px-4 text-gray-500">{m.group_name}</td>
                  <td className="py-2 px-4 text-center text-gray-500">{formatTime(m.match_time)}</td>
                  <td className="py-2 px-4 text-center font-bold">
                    {m.result_home !== null ? `${m.result_home} × ${m.result_away}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
