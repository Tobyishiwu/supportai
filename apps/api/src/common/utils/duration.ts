const UNIT_SECONDS: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };

/** Parses simple durations like "15m", "30d", "1h" into seconds. */
export function parseDurationToSeconds(input: string): number {
  const match = /^(\d+)([smhd])$/.exec(input.trim());
  if (!match) throw new Error(`Invalid duration format: ${input}`);
  const [, amount, unit] = match as unknown as [string, string, string];
  return Number(amount) * UNIT_SECONDS[unit]!;
}
