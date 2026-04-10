export const LEADERBOARD_LIMIT = 10;

export function getIsoDateToday(): string {
  return new Date().toISOString().slice(0, 10);
}
