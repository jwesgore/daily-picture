export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatTeamName(name: string): string {
  return capitalizeFirst(name);
}

export function formatPlayerName(name: string): string {
  return name;
}

export function getMedalEmoji(rank: number): string {
  if (rank === 0) return '🥇';
  if (rank === 1) return '🥈';
  if (rank === 2) return '🥉';
  return String(rank + 1);
}

export function getRankDisplay(index: number): string | number {
  return getMedalEmoji(index) || index + 1;
}
