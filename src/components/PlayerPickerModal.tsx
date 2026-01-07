import { useMemo } from 'react';
import type { Player, Team, TeamData } from '../types';
import { loadTeamDataById, getPlayerPhotoThumb } from '../utils/teamData';
import './PlayerPickerModal.css';

interface PlayerPickerModalProps {
  isOpen: boolean;
  players: Record<number, Player>;
  teams: Record<number, Team>;
  selectedPlayerId: number | null;
  onSelect: (playerId: number) => void;
  onClose: () => void;
}

export default function PlayerPickerModal({
  isOpen,
  players,
  teams,
  selectedPlayerId,
  onSelect,
  onClose,
}: PlayerPickerModalProps) {
  const teamDataMap = useMemo<Record<number, TeamData | null>>(() => {
    const uniqueTeamIds = Array.from(new Set(Object.values(players).map((p) => p.team_id)));
    return Object.fromEntries(uniqueTeamIds.map((teamId) => [teamId, loadTeamDataById(teamId)]));
  }, [players]);

  const filteredPlayers = Object.entries(players);

  if (!isOpen) return null;

  return (
    <>
      <div className="player-picker-backdrop" onClick={onClose} />
      <div className="player-picker-modal">
        <div className="player-picker-header">
          <h3>Select Your Favorite Player</h3>
          <button className="player-picker-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="player-picker-grid">
          {filteredPlayers.length === 0 ? (
            <div className="player-picker-empty">No players found</div>
          ) : (
            filteredPlayers.map(([id, player]) => {
              const playerId = parseInt(id, 10);
              const teamNameRaw = teams[player.team_id]?.name ?? '';
              const teamName = teamNameRaw
                ? teamNameRaw.charAt(0).toUpperCase() + teamNameRaw.slice(1)
                : 'Unknown';
              const isSelected = selectedPlayerId === playerId;
              const teamData = teamDataMap[player.team_id] ?? null;
              const photoThumb = getPlayerPhotoThumb(teamData, playerId);

              return (
                <button
                  key={id}
                  className={`player-picker-card ${isSelected ? 'player-picker-card-selected' : ''}`}
                  onClick={() => {
                    onSelect(playerId);
                    onClose();
                  }}
                >
                  {photoThumb ? (
                    <img src={photoThumb} alt={player.name} className="player-picker-avatar" />
                  ) : (
                    <div className="player-picker-avatar player-picker-avatar-fallback">
                      {player.name.charAt(0)}
                    </div>
                  )}
                  <div className="player-picker-card-body">
                    <div className="player-picker-item-name">{player.name}</div>
                    <div className="player-picker-item-team">{teamName}</div>
                  </div>
                  {isSelected && <div className="player-picker-item-checkmark">✓</div>}
                </button>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
