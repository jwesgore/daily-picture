import type { Player, Team, Match, PlayerStats, TeamStats } from '../types';
import { RANK_POINTS } from '../constants';

/**
 * Calculate player statistics from matches
 */
export function calculatePlayerStats(
  players: Record<number, Player>,
  teams: Record<number, Team>,
  matches: Match[]
): PlayerStats[] {
  const stats: Record<number, PlayerStats> = {};

  // Initialize stats for all players
  Object.values(players).forEach((player) => {
    stats[player.id] = {
      id: player.id,
      name: player.name,
      team: teams[player.team_id]?.name || 'Unknown',
      wins: 0,
      losses: 0,
      score: 0,
    };
  });

  // Calculate wins, losses, and scores from matches
  matches.forEach((match) => {
    const winnerId = match.winner;
    const loserId = match.player_a === winnerId ? match.player_b : match.player_a;

    if (winnerId && stats[winnerId]) {
      stats[winnerId].wins += 1;
      stats[winnerId].score += RANK_POINTS[match.rank] || 0;
    }

    if (loserId && stats[loserId]) {
      stats[loserId].losses += 1;
    }
  });

  return Object.values(stats).sort((a, b) => b.score - a.score || b.wins - a.wins);
}

/**
 * Calculate team statistics from matches
 */
export function calculateTeamStats(
  teams: Record<number, Team>,
  players: Record<number, Player>,
  matches: Match[]
): TeamStats[] {
  const stats: Record<number, TeamStats> = {};

  // Initialize stats for all teams
  Object.values(teams).forEach((team) => {
    stats[team.id] = {
      id: team.id,
      name: team.name,
      wins: 0,
      losses: 0,
      score: 0,
    };
  });

  // Calculate team wins, losses, and scores from matches
  matches.forEach((match) => {
    const winnerId = match.winner;
    const loserId = match.player_a === winnerId ? match.player_b : match.player_a;

    if (winnerId && players[winnerId]) {
      const winnerTeamId = players[winnerId].team_id;
      if (stats[winnerTeamId]) {
        stats[winnerTeamId].wins += 1;
        stats[winnerTeamId].score += RANK_POINTS[match.rank] || 0;
      }
    }

    if (loserId && players[loserId]) {
      const loserTeamId = players[loserId].team_id;
      if (stats[loserTeamId]) {
        stats[loserTeamId].losses += 1;
      }
    }
  });

  return Object.values(stats).sort((a, b) => b.score - a.score || b.wins - a.wins);
}

/**
 * Get top N players by score
 */
export function getTopPlayers(playerStats: PlayerStats[], limit: number = 3): PlayerStats[] {
  return playerStats.slice(0, limit);
}

/**
 * Get top N teams by score
 */
export function getTopTeams(teamStats: TeamStats[], limit: number = 3): TeamStats[] {
  return teamStats.slice(0, limit);
}

/**
 * Calculate win rate percentage for a player
 */
export function calculateWinRate(wins: number, losses: number): number {
  const total = wins + losses;
  return total === 0 ? 0 : Math.round((wins / total) * 100);
}
