import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./TeamQuickView.css";

interface TeamQuickViewProps {
  teamData: string;
}

interface TeamMemberData {
  id: string;
  photo: string;
  photoThumb: string;
  photoCredit: string;
}

interface TeamData {
  background: string;
  backgroundCredit: string;
  teamName: string;
  teamId: number;
  bio: string;
  teamMembers: Record<string, Omit<TeamMemberData, "id">>;
}

export default function TeamQuickView({ teamData }: TeamQuickViewProps) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<TeamMemberData[]>([]);

  useEffect(() => {
    fetch(teamData)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${teamData}`);
        return res.json();
      })
      .then(setTeam)
      .catch(console.error);
  }, [teamData]);

  useEffect(() => {
    if (!team) return;
    const flattened = Object.entries(team.teamMembers || {}).map(([id, m]) => ({
      id,
      ...m,
    }));
    setMembers(flattened);
  }, [team]);

  if (!team) return null;

  return (
    <div
      className="teamQuickView"
      style={{
        backgroundImage: `url(${team.background})`,
      }}
    >
      <Link to={`/teams/${team.teamName}`} className="overlay-link">
        <div className="overlay">
          <div className="showcase-overlay">
            <h2 className="showcase-text">Team {team.teamName.charAt(0).toUpperCase() + team.teamName.slice(1)}</h2>
          </div>
          <div className="image-grid">
            {members.map((member, index) => (
              <img
                key={member.id ?? index}
                src={member.photoThumb}
                alt={`Showcase image ${index + 1}`}
                loading="lazy"
                style={{ cursor: "pointer" }}
              />
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}