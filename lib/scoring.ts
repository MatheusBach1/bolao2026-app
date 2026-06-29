// Scoring rules:
//
// Group stage (no penalty_winner):
//   - Exact score → 2pts
//   - Correct winner (non-draw) → 1pt
//   - Draw: only exact score counts (1pt rule doesn't apply)
//
// Knockout stage (may have penalty_winner):
//   - Exact score + correct penalty winner → 2pts
//   - Exact score + wrong/missing penalty winner → 1pt  (got the draw right but not penalties)
//   - Guessed draw, correct penalty winner → 1pt
//   - Guessed draw, wrong penalty winner → 0pts
//   - Guessed a winner (non-draw) and correct → 1pt (no penalties happened)
//   - Everything else → 0pts

export function calcPoints(
  guessHome: number,
  guessAway: number,
  resultHome: number,
  resultAway: number,
  penaltyWinner: 'home' | 'away' | null = null,
  guessPenaltyWinner: 'home' | 'away' | null = null,
): number {
  const exactScore = guessHome === resultHome && guessAway === resultAway
  const resultIsDraw = resultHome === resultAway
  const guessIsDraw = guessHome === guessAway

  // Knockout draw that went to penalties
  if (resultIsDraw && penaltyWinner !== null) {
    if (exactScore && guessPenaltyWinner === penaltyWinner) return 2
    if (exactScore || (guessIsDraw && guessPenaltyWinner === penaltyWinner)) return 1
    return 0
  }

  // Group stage draw (or knockout draw somehow without penalties recorded)
  if (resultIsDraw) {
    return exactScore ? 2 : 0
  }

  // Non-draw result
  if (exactScore) return 2
  const realWinner = resultHome > resultAway ? 'home' : 'away'
  const guessWinner = guessHome > guessAway ? 'home' : guessHome < guessAway ? 'away' : 'draw'
  return guessWinner === realWinner ? 1 : 0
}
