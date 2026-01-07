import { useMemo } from 'react';
import type { Team, TeamData } from '../types';
import { loadTeamDataById } from '../utils/teamData';
import './TeamPickerModal.css';

interface TeamPickerModalProps {
  isOpen: boolean;
  teams: Record<number, Team>;
  selectedTeamId: number | null;
  onSelect: (teamId: number | null) => void;
  onClose: () => void;
}

export default function TeamPickerModal({
  isOpen,
  teams,
  selectedTeamId,
  onSelect,
  onClose,
}: TeamPickerModalProps) {
  const teamDataMap = useMemo<Record<number, TeamData | null>>(() => {
    const uniqueTeamIds = Object.keys(teams).map((id) => parseInt(id, 10));
    return Object.fromEntries(uniqueTeamIds.map((teamId) => [teamId, loadTeamDataById(teamId)]));
  }, [teams]);

  const teamEntries = useMemo(() => Object.entries(teams), [teams]);

  if (!isOpen) return null;

  return (
    <>
      <div className="team-picker-backdrop" onClick={onClose} />
      <div className="team-picker-modal">
        <div className="team-picker-header">
          <h3>Select Your Favorite Team</h3>
          <button className="team-picker-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="team-picker-grid">
          {teamEntries.length === 0 ? (
            <div className="team-picker-empty">No teams found</div>
          ) : (
            teamEntries.map(([id, team]) => {
              const teamId = parseInt(id, 10);
              const isSelected = selectedTeamId === teamId;
              const teamData = teamDataMap[teamId];
              const background = teamData?.background ?? '';

              return (
                <button
                  key={id}
                  className={`team-picker-card ${isSelected ? 'team-picker-card-selected' : ''}`}
                  onClick={() => {
                    onSelect(teamId);
                    onClose();
                  }}
                  style={background ? { ['--team-bg' as string]: `url(${background})` } : undefined}
                >
                  <div className="team-picker-card-overlay">
                    <div className="team-picker-name">
                      {team.name.charAt(0).toUpperCase() + team.name.slice(1)}
                    </div>
                    {isSelected && <div className="team-picker-checkmark">✓</div>}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
