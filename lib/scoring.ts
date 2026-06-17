export function calcPoints(
  guessHome: number,
  guessAway: number,
  resultHome: number,
  resultAway: number
): number {
  if (guessHome === resultHome && guessAway === resultAway) return 2

  const realWinner =
    resultHome > resultAway ? 1 : resultHome < resultAway ? -1 : 0

  const guessWinner =
    guessHome > guessAway ? 1 : guessHome < guessAway ? -1 : 0

  return guessWinner === realWinner ? 1 : 0
}
