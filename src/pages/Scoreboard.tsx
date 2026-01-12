import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSupabaseData } from "../hooks/queries/useSupabaseData";
import { loadTeamDataById, getPlayerPhotoThumb } from "../utils/teamData";
import { calculatePlayerStats, calculateTeamStats, getTopPlayers, getTopTeams } from "../services/statisticsService";
import { formatTeamName, getRankDisplay } from "../utils/formatters";
import "./styles/Scoreboard.css";

export default function Scoreboard() {
  const { data, isLoading, error } = useSupabaseData();
  
  const [viewMode, setViewMode] = useState<"players" | "teams">("players");
  const [expandPlayers, setExpandPlayers] = useState(false);
  const [expandTeams, setExpandTeams] = useState(false);

  const players = data?.players ?? {};
  const teams = data?.teams ?? {};
  const matches = data?.matches ?? [];

  const playerStats = useMemo(() => {
    if (matches.length === 0) return [];
    return calculatePlayerStats(players, teams, matches);
  }, [matches, players, teams]);

  const teamStats = useMemo(() => {
    if (matches.length === 0) return [];
    return calculateTeamStats(teams, players, matches);
  }, [matches, players, teams]);

  // Get top 3 for highlights section
  const topPlayers = useMemo(() => {
    return getTopPlayers(playerStats, 3);
  }, [playerStats]);

  const topTeams = useMemo(() => {
    return getTopTeams(teamStats, 3);
  }, [teamStats]);

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

      {/* Highlights: Top 3 players and teams */}
      {!isLoading && !error && (
        <section className="scoreboard__highlights">
          <div className="scoreboard__highlights-group">
            <h2 className="scoreboard__highlights-title">Top Players</h2>
            <div className="scoreboard__highlights-grid">
              {topPlayers.map((p, idx) => {
                const teamObj = Object.values(teams).find(t => t.name === p.team);
                const teamData = teamObj ? loadTeamDataById(teamObj.id) : null;
                const thumb = teamData ? getPlayerPhotoThumb(teamData, p.id) : null;
                return (
                  <Link key={p.id} to={`/player/${p.id}`} className="highlight-card">
                    <div className="highlight-card__rank">#{idx + 1}</div>
                    {thumb && (
                      <img src={thumb} alt={p.name} className="highlight-card__thumb" />
                    )}
                    <div className="highlight-card__content">
                      <div className="highlight-card__toprow">
                        <div className="highlight-card__name">{p.name}</div>
                      </div>
                      <div className="highlight-card__stats">
                        <span>Score: {p.score}</span>
                        <span>Wins: {p.wins}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="scoreboard__highlights-group">
            <h2 className="scoreboard__highlights-title">Top Teams</h2>
            <div className="scoreboard__highlights-grid">
              {topTeams.map((t, idx) => {
                const teamData = loadTeamDataById(t.id);
                const memberIds = teamData ? Object.keys(teamData.teamMembers) : [];
                const firstId = memberIds.length ? Number(memberIds[0]) : null;
                const thumb = teamData && firstId != null ? getPlayerPhotoThumb(teamData, firstId) : null;
                return (
                  <a key={t.id} href={`/teams/${t.id}`} className="highlight-card">
                    <div className="highlight-card__rank">#{idx + 1}</div>
                    {thumb && (
                      <img src={thumb} alt={`${t.name} thumbnail`} className="highlight-card__thumb" />
                    )}
                    <div className="highlight-card__content">
                      <div className="highlight-card__toprow">
                        <div className="highlight-card__name">{formatTeamName(t.name)}</div>
                      </div>
                      <div className="highlight-card__stats">
                        <span>Score: {t.score}</span>
                        <span>Record: {t.wins}-{t.losses}</span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Players Leaderboard: Top 10 (expandable) */}
      {!isLoading && !error && viewMode === "players" && (
        <div className="scoreboard__table-wrapper">
          <div className="scoreboard__table-header">
            <h2 className="scoreboard__table-title">Players Leaderboard</h2>
            <button 
              className="scoreboard__expand-btn"
              onClick={() => setExpandPlayers(!expandPlayers)}
            >
              {expandPlayers ? "Collapse" : `Expand (Show all ${playerStats.length})`}
            </button>
          </div>
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
              {playerStats.slice(0, expandPlayers ? playerStats.length : 10).map((stat, index) => (
                <tr key={stat.id} className={index < 3 ? "scoreboard__row--podium" : ""}>
                  <td className="scoreboard__rank">
                    {getRankDisplay(index)}
                  </td>
                  <td className="scoreboard__name">
                    <Link to={`/player/${stat.id}`}>{stat.name}</Link>
                  </td>
                  <td className="scoreboard__team">
                    {formatTeamName(stat.team)}
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

      {/* Teams Leaderboard: Top 10 (expandable) */}
      {!isLoading && !error && viewMode === "teams" && (
        <div className="scoreboard__table-wrapper">
          <div className="scoreboard__table-header">
            <h2 className="scoreboard__table-title">Teams Leaderboard</h2>
            <button 
              className="scoreboard__expand-btn"
              onClick={() => setExpandTeams(!expandTeams)}
            >
              {expandTeams ? "Collapse" : `Expand (Show all ${teamStats.length})`}
            </button>
          </div>
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
              {teamStats.slice(0, expandTeams ? teamStats.length : 10).map((stat, index) => (
                <tr key={stat.id} className={index < 3 ? "scoreboard__row--podium" : ""}>
                  <td className="scoreboard__rank">
                    {getRankDisplay(index)}
                  </td>
                  <td className="scoreboard__name">
                    {formatTeamName(stat.name)}
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