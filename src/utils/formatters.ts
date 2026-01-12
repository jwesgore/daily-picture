/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format team name for display
 */
export function formatTeamName(name: string): string {
  return capitalizeFirst(name);
}

/**
 * Format player name for display
 */
export function formatPlayerName(name: string): string {
  return name;
}

/**
 * Get medal emoji for rank
 */
export function getMedalEmoji(rank: number): string {
  if (rank === 0) return '🥇';
  if (rank === 1) return '🥈';
  if (rank === 2) return '🥉';
  return String(rank + 1);
}

/**
 * Get rank display value (emoji or number)
 */
export function getRankDisplay(index: number): string | number {
  return getMedalEmoji(index) || index + 1;
}
