import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import "./TeamPage.css";

type Player = { id: number; name: string; team_id: number };
type Match = {
  id: number;
  date: string;
  rank: "quarter" | "semi" | "final" | string;
  rank_index: number;
  player_a: number;
  player_b: number | null;
  winner: number;
};

type TeamMemberData = {
  photo: string;
  photoThumb: string;
  photoCredit: string;
};

type TeamData = {
  background: string;
  backgroundCredit: string;
  teamName: string;
  teamId: number;
  bio: string;
  teamMembers: Record<string, Omit<TeamMemberData, "id">>;
};

type PlayerStat = {
  id: number;
  name: string;
  photo: string;
  wins: number;
  losses: number;
};

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
        // Fetch team data JSON
        const response = await fetch(`/${teamName}/teamdata.json`);
        if (!response.ok) throw new Error("Team not found");
        const data = await response.json();
        setTeamData(data);

        // Fetch all players
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("id,name,team_id");

        if (playersError) throw playersError;
        setPlayers(Object.fromEntries((playersData || []).map((p) => [p.id, p])));

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

  const teamPlayers = useMemo(() => {
    if (!teamData) return [];

    const playerStats: Record<number, PlayerStat> = {};
    const teamMembersKeys = Object.keys(teamData.teamMembers || {});

    // Get all players that have data in this team's JSON (by player ID)
    teamMembersKeys.forEach((playerId) => {
      const id = parseInt(playerId);
      const player = players[id];
      if (player) {
        const memberData = teamData.teamMembers?.[playerId];
        playerStats[id] = {
          id,
          name: player.name,
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