export function creditScoreToApyBps(score: number): number {
  if (score >= 700) return 900; // Elite → 9.00%
  if (score >= 500) return 700; // Trusted → 7.00%
  if (score >= 300) return 500; // Average → 5.00%
  if (score >= 100) return 300; // Low     → 3.00%
  return 200; // New     → 2.00%
}
