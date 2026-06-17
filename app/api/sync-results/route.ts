import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { calcPoints } from '@/lib/scoring'

const FIFA_WORLD_CUP_2026_ID = 1 // API-Football league ID for FIFA World Cup 2026

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${FIFA_WORLD_CUP_2026_ID}&season=2026&status=FT`,
      {
        headers: {
          'x-rapidapi-key': process.env.API_FOOTBALL_KEY!,
          'x-rapidapi-host': 'v3.football.api-sports.io',
        },
        cache: 'no-store',
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'API-Football error' }, { status: 502 })
    }

    const json = await res.json()
    const fixtures = json.response ?? []

    let updated = 0

    for (const fixture of fixtures) {
      const apiMatchId = String(fixture.fixture.id)
      const resultHome = fixture.goals.home
      const resultAway = fixture.goals.away

      if (resultHome === null || resultAway === null) continue

      // Find match by api_match_id (idempotent — skip if result already set)
      const { data: match } = await supabaseAdmin
        .from('matches')
        .select('id, result_home')
        .eq('api_match_id', apiMatchId)
        .single()

      if (!match) continue
      if (match.result_home !== null) continue // already saved

      await supabaseAdmin
        .from('matches')
        .update({ result_home: resultHome, result_away: resultAway })
        .eq('id', match.id)

      const { data: guesses } = await supabaseAdmin
        .from('guesses')
        .select('id, guess_home, guess_away')
        .eq('match_id', match.id)

      for (const g of guesses ?? []) {
        await supabaseAdmin
          .from('guesses')
          .update({ points: calcPoints(g.guess_home, g.guess_away, resultHome, resultAway) })
          .eq('id', g.id)
      }

      updated++
    }

    return NextResponse.json({ success: true, updated })
  } catch (err) {
    console.error('sync-results error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
