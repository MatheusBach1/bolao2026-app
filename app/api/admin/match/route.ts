import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

const VALID_ROUNDS = ['grupo', 'segunda-rodada', 'oitavas', 'quartas', 'semifinal', 'final']

export async function POST(req: NextRequest) {
  const { teams, match_time, group_name, round = 'grupo', slot = null } = await req.json()

  if (!teams || !match_time || !group_name) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
  }
  if (!VALID_ROUNDS.includes(round)) {
    return NextResponse.json({ error: 'Fase inválida.' }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from('matches').insert({
    teams,
    match_time: new Date(match_time).toISOString(),
    group_name,
    round,
    slot: slot ? Number(slot) : null,
  })

  if (error) {
    console.error('Supabase error inserting match:', error)
    return NextResponse.json({ error: 'Erro ao cadastrar jogo.', details: error.message }, { status: 500 })
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/eliminatorias')
  revalidatePath('/classificacao')

  return NextResponse.json({ success: true })
}
