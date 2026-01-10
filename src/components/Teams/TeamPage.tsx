import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import { loadTeamDataByName } from "../../utils/teamData";
import { RANK_POINTS } from "../../constants";
import type { Player, Match, TeamData, PlayerWithStats, TeamStats } from "../../types";
import "./TeamPage.css";

export default function TeamPage() {
  const { teamName } = useParams<{ teamName: string }>();
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [players, setPlayers] = useState<Record<number, Player>>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = loadTeamDataByName(teamName || "");
        if (!data) throw new Error("Team not found");
        setTeamData(data);

        // Fetch all players
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("id,name,team_id,species,bio");

        if (playersError) throw playersError;
        setPlayers(Object.fromEntries((playersData || []).map((p: Player) => [p.id, p])));

        // Fetch all matches
        const { data: matchesData, error: matchesError } = await supabase
          .from("matches")
          .select("*");

        if (matchesError) throw matchesError;
        setMatches(matchesData || []);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load team");
        setLoading(false);
      }
    };

    if (teamName) load();
  }, [teamName]);

  const teamPlayers = useMemo((): PlayerWithStats[] => {
    if (!teamData) return [];

    const playerStats: Record<number, PlayerWithStats> = {};
    const teamMembersKeys = Object.keys(teamData.teamMembers || {});

    // Get all players that have data in this team's JSON (by player ID)
    teamMembersKeys.forEach((playerId) => {
      const id = parseInt(playerId);
      const player = players[id];
      if (player) {
        const memberData = teamData.teamMembers?.[id];
        playerStats[id] = {
          id,
          name: player.name,
          species: player.species,
          photo: memberData?.photo || "",
          wins: 0,
          losses: 0,
        };
      }
    });

    // Calculate stats from matches
    matches.forEach((match) => {
      const winnerId = match.winner;
      const loserId = match.player_a === winnerId ? match.player_b : match.player_a;

      if (winnerId && playerStats[winnerId]) {
        playerStats[winnerId].wins += 1;
      }

      if (loserId && playerStats[loserId]) {
        playerStats[loserId].losses += 1;
      }
    });

    return Object.values(playerStats).sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name));
  }, [teamData, players, matches]);

  // Compute team-wide stats and current rank
  const teamStatsMap = useMemo((): Record<number, TeamStats> => {
    const stats: Record<number, TeamStats> = {};
    // Initialize stats for teams present in players map
    Object.values(players).forEach((p) => {
      if (!stats[p.team_id]) {
        stats[p.team_id] = { id: p.team_id, name: String(p.team_id), wins: 0, losses: 0, score: 0 };
      }
    });

    // Aggregate wins/losses/score by team
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

    return stats;
  }, [matches, players]);

  const teamStatsSorted = useMemo(() => {
    return Object.values(teamStatsMap).sort((a, b) => b.score - a.score || b.wins - a.wins);
  }, [teamStatsMap]);

  const currentTeamStats = useMemo(() => {
    if (!teamData) return null;
    return teamStatsMap[teamData.teamId] || null;
  }, [teamStatsMap, teamData]);

  const currentRank = useMemo(() => {
    if (!teamData) return null;
    const idx = teamStatsSorted.findIndex((t) => t.id === teamData.teamId);
    return idx >= 0 ? idx + 1 : null;
  }, [teamStatsSorted, teamData]);

  // Compute current MVP for this team by score (tie-breaker wins)
  const currentMVP = useMemo((): { id: number; name: string; score: number; wins: number } | null => {
    if (!teamData) return null;
    const memberIds = Object.keys(teamData.teamMembers || {}).map((k) => parseInt(k));
    const scores: Record<number, { score: number; wins: number }> = {};
    memberIds.forEach((id) => (scores[id] = { score: 0, wins: 0 }));

    matches.forEach((match) => {
      const winnerId = match.winner;
      const loserId = match.player_a === winnerId ? match.player_b : match.player_a;
      if (winnerId && memberIds.includes(winnerId)) {
        scores[winnerId].wins += 1;
        scores[winnerId].score += RANK_POINTS[match.rank] || 0;
      }
      // losses don't contribute to score, so no-op for loser
      void loserId;
    });

    let bestId: number | null = null;
    let bestScore = -1;
    let bestWins = -1;
    memberIds.forEach((id) => {
      const { score, wins } = scores[id] || { score: 0, wins: 0 };
      if (score > bestScore || (score === bestScore && wins > bestWins)) {
        bestId = id;
        bestScore = score;
        bestWins = wins;
      }
    });

    if (bestId == null || !players[bestId]) return null;
    return { id: bestId, name: players[bestId].name, score: bestScore, wins: bestWins };
  }, [matches, players, teamData]);

  if (loading) {
    return (
      <main className="team-detail">
        <p className="team-detail__status">Loading team data…</p>
      </main>
    );
  }

  if (error || !teamData) {
    return (
      <main className="team-detail">
        <p className="team-detail__status team-detail__status--error">
          {error || "Team not found"}
        </p>
      </main>
    );
  }

  return (
    <main className="team-detail">
      <header
        className="team-detail__header"
        style={{ backgroundImage: `url(${teamData.background})` }}
      >
        <div className="team-detail__header-overlay">
          <h1 className="team-detail__title">
            Team {teamData.teamName.charAt(0).toUpperCase() + teamData.teamName.slice(1)}
          </h1>
          <p className="team-detail__bio">{teamData.bio}</p>
        </div>
      </header>

      <section className="team-detail__stats">
        <h2 className="team-detail__section-title">Team Stats</h2>
        <div className="team-detail__stats-grid">
          <div className="team-detail__stat-card">
            <div className="team-detail__stat-label">Overall Record</div>
            <div className="team-detail__stat-value">
              {currentTeamStats ? (
                <>
                  {currentTeamStats.wins} - {currentTeamStats.losses}
                </>
              ) : (
                "—"
              )}
            </div>
          </div>
          <div className="team-detail__stat-card">
            <div className="team-detail__stat-label">Current Rank</div>
            <div className="team-detail__stat-value">{currentRank ?? "—"}</div>
          </div>
          <div className="team-detail__stat-card">
            <div className="team-detail__stat-label">Current MVP</div>
            <div className="team-detail__stat-value">
              {currentMVP ? (
                <span>{currentMVP.name}</span>
              ) : (
                "—"
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="team-detail__players">
        <h2 className="team-detail__section-title">Players</h2>
        <div className="team-detail__grid">
          {teamPlayers.map((player) => (
            <Link key={player.id} to={`/player/${player.id}`} className="player-card-link">
              <div className="player-card">
                {player.photo && (
                  <img
                    src={player.photo}
                    alt={player.name}
                    className="player-card__image"
                  />
                )}
                <div className="player-card__content">
                  <h3 className="player-card__name">{player.name}</h3>
                  <p className="player-card__species">{player.species}</p>
                  <div className="player-card__stats">
                    <div className="player-card__stat">
                      <span className="player-card__stat-label">Wins</span>
                      <span className="player-card__stat-value">{player.wins}</span>
                    </div>
                    <div className="player-card__stat">
                      <span className="player-card__stat-label">Losses</span>
                      <span className="player-card__stat-value">{player.losses}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}