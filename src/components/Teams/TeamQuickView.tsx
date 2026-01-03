import { Link } from "react-router-dom";
import "./TeamQuickView.css";

interface TeamQuickViewProps {
  backgroundImage: string;
  teamMembers: [string, string, string, string];
  text: string;
  teamLink?: string;
  teamMemberLinks?: [string, string, string, string];
}

export default function TeamQuickView({
  backgroundImage,
  teamMembers,
  text,
  teamLink = "#",
  teamMemberLinks = ["#", "#", "#", "#"],
}: TeamQuickViewProps) {
  return (
    <div
      className="teamQuickView"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <Link to={teamLink} className="overlay-link">
        <div className="overlay">
          <div className="showcase-overlay">
            <h2 className="showcase-text">{text}</h2>
          </div>
          <div className="image-grid">
            {teamMembers.map((src, index) => (
              <Link
                to={teamMemberLinks[index]}
                key={index}
                onClick={e => e.stopPropagation()}
                tabIndex={-1}
              >
                <img
                  src={src}
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