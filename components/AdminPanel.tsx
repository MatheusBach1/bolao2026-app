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
      <div className="bg-nlw-card rounded-xl p-5">
        <h2 className="font-bold text-white mb-4">Cadastrar Jogo</h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-xs text-nlw-textMuted mb-1 block">Times (ex: Brasil x Argentina)</label>
            <input
              type="text"
              placeholder="Brasil x Argentina"
              value={newMatch.teams}
              onChange={(e) => setNewMatch((n) => ({ ...n, teams: e.target.value }))}
              className="w-full bg-nlw-input border border-transparent text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-nlw-yellow placeholder:text-nlw-textHover"
            />
          </div>
          <div>
            <label className="text-xs text-nlw-textMuted mb-1 block">Data/Hora</label>
            <input
              type="datetime-local"
              value={newMatch.match_time}
              onChange={(e) => setNewMatch((n) => ({ ...n, match_time: e.target.value }))}
              className="w-full bg-nlw-input border border-transparent text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-nlw-yellow"
            />
          </div>
          <div>
            <label className="text-xs text-nlw-textMuted mb-1 block">Grupo / Fase</label>
            <input
              type="text"
              placeholder="Grupo A"
              value={newMatch.group_name}
              onChange={(e) => setNewMatch((n) => ({ ...n, group_name: e.target.value }))}
              className="w-full bg-nlw-input border border-transparent text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-nlw-yellow placeholder:text-nlw-textHover"
            />
          </div>
        </div>
        <button
          onClick={addMatch}
          disabled={addLoading}
          className="bg-nlw-green text-white px-5 py-2 rounded-lg text-sm font-bold uppercase hover:bg-green-700 transition-colors disabled:opacity-40"
        >
          {addLoading ? 'Salvando...' : 'Cadastrar Jogo'}
        </button>
        {addMsg && <p className="mt-2 text-sm text-nlw-textMuted">{addMsg}</p>}
      </div>

      {/* Pending Results */}
      <div>
        <h2 className="font-bold text-white mb-3">Inserir Resultados ({pendingMatches.length})</h2>
        {pendingMatches.length === 0 ? (
          <p className="text-nlw-textMuted text-sm">Nenhum jogo aguardando resultado.</p>
        ) : (
          <div className="space-y-3">
            {pendingMatches.map((match) => {
              const teams = match.teams.split(' x ')
              const home = teams[0] ?? 'Time A'
              const away = teams[1] ?? 'Time B'
              return (
                <div key={match.id} className="bg-nlw-card rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-nlw-yellow/20 text-nlw-yellow px-2 py-0.5 rounded-full font-semibold">{match.group_name}</span>
                    <span className="text-xs text-nlw-textMuted">{formatTime(match.match_time)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex-1 text-right font-semibold text-white">{home}</span>
                    <input
                      type="number"
                      min={0}
                      disabled={saved[match.id]}
                      value={results[match.id]?.home ?? ''}
                      onChange={(e) =>
                        setResults((r) => ({ ...r, [match.id]: { ...r[match.id], home: e.target.value } }))
                      }
                      className="w-12 h-12 text-center bg-nlw-input text-white rounded text-xl font-bold focus:outline-none disabled:opacity-50"
                    />
                    <span className="text-nlw-textMuted">×</span>
                    <input
                      type="number"
                      min={0}
                      disabled={saved[match.id]}
                      value={results[match.id]?.away ?? ''}
                      onChange={(e) =>
                        setResults((r) => ({ ...r, [match.id]: { ...r[match.id], away: e.target.value } }))
                      }
                      className="w-12 h-12 text-center bg-nlw-input text-white rounded text-xl font-bold focus:outline-none disabled:opacity-50"
                    />
                    <span className="flex-1 font-semibold text-white">{away}</span>
                    {saved[match.id] ? (
                      <span className="text-nlw-green text-sm font-bold ml-2">✓ Salvo</span>
                    ) : (
                      <button
                        onClick={() => saveResult(match.id)}
                        disabled={saving[match.id]}
                        className="ml-2 bg-nlw-input text-white px-4 py-2 rounded text-sm font-bold hover:bg-nlw-card transition-colors disabled:opacity-40 border border-nlw-yellow/40"
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
        <h2 className="font-bold text-white mb-3">Todos os Jogos ({allMatches.length})</h2>
        <div className="bg-nlw-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-nlw-input text-xs text-nlw-textMuted uppercase">
                <th className="py-2 px-4 text-left">Jogo</th>
                <th className="py-2 px-4 text-left">Grupo</th>
                <th className="py-2 px-4 text-center">Horário</th>
                <th className="py-2 px-4 text-center">Resultado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nlw-input">
              {allMatches.map((m) => (
                <tr key={m.id} className="hover:bg-nlw-input/50 transition-colors">
                  <td className="py-2 px-4 font-medium text-white">{m.teams}</td>
                  <td className="py-2 px-4 text-nlw-yellow text-xs">{m.group_name}</td>
                  <td className="py-2 px-4 text-center text-nlw-textMuted">{formatTime(m.match_time)}</td>
                  <td className="py-2 px-4 text-center font-bold text-white">
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
