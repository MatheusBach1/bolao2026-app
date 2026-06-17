import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { teams, match_time, group_name } = await req.json()

  if (!teams || !match_time || !group_name) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('matches').insert({
    teams,
    match_time: new Date(match_time).toISOString(),
    group_name,
  })

  if (error) {
    console.error('Supabase error inserting match:', error)
    return NextResponse.json({ error: 'Erro ao cadastrar jogo.', details: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
