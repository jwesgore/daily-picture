import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "./TeamQuickView.css";

// Interfaces
interface TeamQuickViewProps {
  teamData: string;
}

interface TeamData {
    background: string;
    backgroundCredit: string;
    teamName: string;
    teamId: string;
    bio: string;

    teamMembers: string[];
}

interface TeamMemberData {
    teamName: string;
    teamId: string;

    name: string;
    bio: string;

    photo: string;
    photoThumb: string;
    photoCredit: string;
}

// Component function
export default function TeamQuickView({teamData}: TeamQuickViewProps) {
  const [team, setTeam] = useState<TeamData | null>(null);
  const [members, setMembers] = useState<TeamMemberData[]>([]);

  // Load team data
  useEffect(() => {
    fetch(teamData)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${teamData}`);
        return res.json();
      })
      .then(setTeam)
      .catch(console.error);
  }, [teamData]);

  // Load team members once team data exists
  useEffect(() => {
    if (!team) return;

    Promise.all(
      team.teamMembers.map(path =>
        fetch(path)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to load ${path}`);
            return res.json();
          })
      )
    )
      .then(setMembers)
      .catch(console.error);
  }, [team]);

  if (!team) return null;

  return (
    <div
      className="teamQuickView"
      style={{
        backgroundImage: `url(${team.background})`,
      }}
    >
      <Link to={team.teamId} className="overlay-link">
        <div className="overlay">
          <div className="showcase-overlay">
            <h2 className="showcase-text">{team.teamName}</h2>
          </div>
          <div className="image-grid">
            {members.map((member, index) => (
              <Link
                to={`/teams/${member.teamId}/${member.name.toLowerCase().replace(/\s+/g, "-")}`}
                key={index}
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
              >
              <img
                src={member.photoThumb}
                alt={`Showcase image ${index + 1}`}
                loading="lazy"
                style={{ cursor: "pointer" }}
              />
              </Link>
            ))}
          </div>
        </div>
      </Link>
    </div>
  );
}