import { Link } from "react-router-dom";
import { useEffect, useState, useMemo, memo } from "react";
import { useSupabaseData } from "../../hooks/queries/useSupabaseData";
import { calculateTeamStats } from "../../services/statisticsService";
import type { TeamData, TeamStats } from "../../types";
import "./TeamQuickView.css";

interface TeamQuickViewProps {
  teamData: string;
  teamId: number;
  preloadedStats?: TeamStats;
}

function TeamQuickView({ teamData, teamId, preloadedStats }: TeamQuickViewProps) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const { data } = useSupabaseData();

  useEffect(() => {
    fetch(teamData)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${teamData}`);
        return res.json();
      })
      .then(setTeam)
      .catch(console.error);
  }, [teamData]);

  const members = useMemo(() => {
    if (!team) return [];
    return Object.entries(team.teamMembers || {}).map(([id, m]) => ({
      id,
      ...m,
    }));
  }, [team]);

  const currentStats = useMemo(() => {
    if (preloadedStats) return preloadedStats;
    if (!data) return null;
    const teamStats = calculateTeamStats(data.teams, data.players, data.matches);
    return teamStats.find(t => t.id === teamId);
  }, [data, teamId, preloadedStats]);

  if (!team) return null;

  return (
    <div
      className="teamQuickView"
      style={{
        backgroundImage: `url(${team.background})`,
      }}
    >
      <Link to={`/teams/${team.teamId}`} className="overlay-link">
        <div className="overlay">
          <div className="showcase-overlay">
            <h2 className="showcase-text">Team {team.teamName.charAt(0).toUpperCase() + team.teamName.slice(1)}</h2>
            {currentStats && (
              <div className="team-stats">
                <span className="stat-item">
                  <span className="stat-label">Record:</span> {currentStats.wins}-{currentStats.losses}
                </span>
                <span className="stat-item">
                  <span className="stat-label">Score:</span> {currentStats.score}
                </span>
              </div>
            )}
          </div>
          <div className="image-grid">
            {members.map((member, index) => (
              <Link
                key={member.id ?? index}
                to={`/player/${member.id}`}
                className="player-thumb-link"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={member.photoThumb}
                  alt={`Showcase image ${index + 1}`}
                  loading="lazy"
                />
              </Link>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default memo(TeamQuickView);