import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSupabaseData } from "../hooks/queries/useSupabaseData";
import { RANK_POINTS } from "../constants";
import type { PlayerStats, TeamStats } from "../types";
import "./styles/Scoreboard.css";

export default function Scoreboard() {
  const { data, isLoading, error } = useSupabaseData();
  const [viewMode, setViewMode] = useState<"players" | "teams">("players");

  const players = data?.players ?? {};
  const teams = data?.teams ?? {};
  const matches = data?.matches ?? [];

  const playerStats = useMemo(() => {
    const stats: Record<number, PlayerStats> = {};

    // Initialize stats for all players
    Object.values(players).forEach((player) => {
      stats[player.id] = {
        id: player.id,
        name: player.name,
        team: teams[player.team_id]?.name || "Unknown",
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
  }, [matches, players, teams]);

  const teamStats = useMemo(() => {
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
  }, [matches, players, teams]);

  return (
    <main className="scoreboard">
      <header className="scoreboard__header">
        <h1>Scoreboard</h1>
        <p className="scoreboard__subtitle">All-time statistics</p>
        <div className="scoreboard__toggle">
          <button
            className={`scoreboard__toggle-btn ${viewMode === "players" ? "active" : ""}`}
            onClick={() => setViewMode("players")}
          >
            Players
          </button>
          <button
            className={`scoreboard__toggle-btn ${viewMode === "teams" ? "active" : ""}`}
            onClick={() => setViewMode("teams")}
          >
            Teams
          </button>
        </div>
      </header>

      {isLoading && <p className="scoreboard__status">Loading statistics…</p>}
      {error && <p className="scoreboard__status scoreboard__status--error">{error.toString()}</p>}

      {!isLoading && !error && viewMode === "players" && (
        <div className="scoreboard__table-wrapper">
          <table className="scoreboard__table">
            <thead>
              <tr>
                <th className="scoreboard__rank">Rank</th>
                <th className="scoreboard__name">Player</th>
                <th className="scoreboard__team">Team</th>
                <th className="scoreboard__score">Score</th>
                <th className="scoreboard__wins">Wins</th>
                <th className="scoreboard__losses">Losses</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.map((stat, index) => (
                <tr key={stat.id} className={index < 3 ? "scoreboard__row--podium" : ""}>
                  <td className="scoreboard__rank">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && index + 1}
                  </td>
                  <td className="scoreboard__name">
                    <Link to={`/player/${stat.id}`}>{stat.name}</Link>
                  </td>
                  <td className="scoreboard__team">
                    {stat.team.charAt(0).toUpperCase() + stat.team.slice(1)}
                  </td>
                  <td className="scoreboard__score">{stat.score}</td>
                  <td className="scoreboard__wins">{stat.wins}</td>
                  <td className="scoreboard__losses">{stat.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !error && viewMode === "teams" && (
        <div className="scoreboard__table-wrapper">
          <table className="scoreboard__table">
            <thead>
              <tr>
                <th className="scoreboard__rank">Rank</th>
                <th className="scoreboard__name">Team</th>
                <th className="scoreboard__score">Score</th>
                <th className="scoreboard__wins">Wins</th>
                <th className="scoreboard__losses">Losses</th>
              </tr>
            </thead>
            <tbody>
              {teamStats.map((stat, index) => (
                <tr key={stat.id} className={index < 3 ? "scoreboard__row--podium" : ""}>
                  <td className="scoreboard__rank">
                    {index === 0 && "🥇"}
                    {index === 1 && "🥈"}
                    {index === 2 && "🥉"}
                    {index > 2 && index + 1}
                  </td>
                  <td className="scoreboard__name">
                    {stat.name.charAt(0).toUpperCase() + stat.name.slice(1)}
                  </td>
                  <td className="scoreboard__score">{stat.score}</td>
                  <td className="scoreboard__wins">{stat.wins}</td>
                  <td className="scoreboard__losses">{stat.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}