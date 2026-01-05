import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import "./Scoreboard.css";

type Match = {
  id: number;
  date: string;
  rank: "quarter" | "semi" | "final" | string;
  rank_index: number;
  player_a: number;
  player_b: number | null;
  winner: number;
};

type Player = { id: number; name: string; team_id: number };
type Team = { id: number; name: string };

type PlayerStats = {
  id: number;
  name: string;
  team: string;
  wins: number;
  losses: number;
  score: number;
};

type TeamStats = {
  id: number;
  name: string;
  wins: number;
  losses: number;
  score: number;
};

const rankPoints: Record<string, number> = {
  quarter: 1,
  semi: 4,
  final: 8,
};

export default function Scoreboard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Record<number, Player>>({});
  const [teams, setTeams] = useState<Record<number, Team>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"players" | "teams">("players");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*");

      if (matchesError) {
        setError(matchesError.message);
        setLoading(false);
        return;
      }

      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("id,name,team_id");

      if (playersError) {
        setError(playersError.message);
        setLoading(false);
        return;
      }

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id,name");

      if (teamsError) {
        setError(teamsError.message);
        setLoading(false);
        return;
      }

      setMatches(matchesData || []);
      setPlayers(Object.fromEntries((playersData || []).map((p) => [p.id, p])));
      setTeams(Object.fromEntries((teamsData || []).map((t) => [t.id, t])));
      setLoading(false);
    };

    load();
  }, []);

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
        stats[winnerId].score += rankPoints[match.rank] || 0;
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
          stats[winnerTeamId].score += rankPoints[match.rank] || 0;
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

      {loading && <p className="scoreboard__status">Loading statistics…</p>}
      {error && <p className="scoreboard__status scoreboard__status--error">{error}</p>}

      {!loading && !error && viewMode === "players" && (
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
                  <td className="scoreboard__name">{stat.name}</td>
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

      {!loading && !error && viewMode === "teams" && (
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