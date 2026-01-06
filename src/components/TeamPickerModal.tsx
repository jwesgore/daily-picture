import { useEffect, useMemo, useState } from 'react';
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
  const [teamDataMap, setTeamDataMap] = useState<Record<number, TeamData | null>>({});
  const [loadingTeams, setLoadingTeams] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const uniqueTeamIds = Object.keys(teams).map((id) => parseInt(id, 10));
    let cancelled = false;

    const loadAll = async () => {
      setLoadingTeams(true);
      const entries = await Promise.all(
        uniqueTeamIds.map(async (teamId) => {
          try {
            const data = await loadTeamDataById(teamId);
            return [teamId, data ?? null] as const;
          } catch (err) {
            console.error('Failed to load team data', teamId, err);
            return [teamId, null] as const;
          }
        })
      );
      if (!cancelled) {
        setTeamDataMap(Object.fromEntries(entries));
        setLoadingTeams(false);
      }
    };

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [isOpen, teams]);

  const teamEntries = useMemo(() => Object.entries(teams), [teams]);

  if (!isOpen) return null;

  const gridClass = loadingTeams ? 'team-picker-grid loading' : 'team-picker-grid';

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

        <div className={gridClass}>
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
