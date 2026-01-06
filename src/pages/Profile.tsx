import { useEffect, useState } from 'react';
import { useAuth } from '../context/UserContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { loadTeamDataById, getPlayerPhotoThumb } from '../utils/teamData';
import Auth from '../components/Auth';
import PlayerPickerModal from '../components/PlayerPickerModal.tsx';
import TeamPickerModal from '../components/TeamPickerModal.tsx';
import './Profile.css';

const BORDER_COLORS = [
  { name: 'Blue', value: '#0066cc' },
  { name: 'Purple', value: '#764ba2' },
  { name: 'Pink', value: '#ff4757' },
  { name: 'Green', value: '#4caf50' },
  { name: 'Orange', value: '#ff9500' },
  { name: 'Red', value: '#d32f2f' },
  { name: 'Teal', value: '#00897b' },
  { name: 'Gold', value: '#ffc107' },
];

export default function Profile() {
  const { user, logout, updateFavorites, isLoading: authLoading } = useAuth();
  const { data } = useSupabaseData();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#0066cc');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [playerPhoto, setPlayerPhoto] = useState<string | null>(null);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);

  const teams = data?.teams ?? {};
  const players = data?.players ?? {};

  useEffect(() => {
    if (user) {
      setSelectedTeam(user.favorite_team_id || null);
      setSelectedPlayer(user.favorite_player_id || null);
      setSelectedColor(user.favorite_color || '#0066cc');
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;

    const loadPhoto = async () => {
      if (!selectedPlayer) {
        setPlayerPhoto(null);
        return;
      }
      const player = players[selectedPlayer];
      if (!player) {
        setPlayerPhoto(null);
        return;
      }
      const teamData = await loadTeamDataById(player.team_id);
      if (cancelled) return;
      const thumb = getPlayerPhotoThumb(teamData, selectedPlayer);
      setPlayerPhoto(thumb);
    };

    loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [players, selectedPlayer]);

  if (authLoading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!user) {
    return <Auth onSuccess={() => {}} />;
  }

  const handleUpdateTeam = async (teamId: number | null) => {
    setSelectedTeam(teamId);
    setIsSaving(true);
    try {
      await updateFavorites(teamId, undefined);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePlayer = async (playerId: number | null) => {
    setSelectedPlayer(playerId);
    setIsSaving(true);
    try {
      let thumbUrl: string | null = null;
      if (playerId) {
        const player = players[playerId];
        if (player) {
          const teamData = await loadTeamDataById(player.team_id);
          thumbUrl = getPlayerPhotoThumb(teamData, playerId);
        }
      }
      await updateFavorites(undefined, playerId, undefined, thumbUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateColor = async (color: string) => {
    setSelectedColor(color);
    setIsSaving(true);
    try {
      await updateFavorites(undefined, undefined, color);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="profile-page">
      {saved && <div className="saved-banner">✓ Saved</div>}
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar" aria-label="Profile picture">
            {playerPhoto ? (
              <img src={playerPhoto} alt="Favorite animal" />
            ) : (
              <span>{user.username?.[0]?.toUpperCase() ?? 'U'}</span>
            )}
          </div>
          <div>
            <h1>My Profile</h1>
            <p className="username">Username: <strong>{user.username}</strong></p>
          </div>
        </div>

        <div className="profile-section">
          <h2>Favorite Team</h2>
          <button
            onClick={() => setShowTeamPicker(true)}
            className="team-select-button"
            disabled={isSaving}
          >
            {selectedTeam && teams[selectedTeam]
              ? (() => {
                  const teamNameRaw = teams[selectedTeam]?.name ?? '';
                  const teamName = teamNameRaw
                    ? teamNameRaw.charAt(0).toUpperCase() + teamNameRaw.slice(1)
                    : 'Unknown';
                  return teamName;
                })()
              : 'Choose a team...'}
          </button>
        </div>

        <div className="profile-section">
          <h2>Favorite Player</h2>
          <button
            onClick={() => setShowPlayerPicker(true)}
            className="player-select-button"
            disabled={isSaving}
          >
            {selectedPlayer && players[selectedPlayer]
              ? (() => {
                  const teamNameRaw = teams[players[selectedPlayer].team_id]?.name ?? '';
                  const teamName = teamNameRaw
                    ? teamNameRaw.charAt(0).toUpperCase() + teamNameRaw.slice(1)
                    : 'Unknown';
                  return `${players[selectedPlayer].name} (${teamName})`;
                })()
              : 'Choose a player...'}
          </button>
        </div>

        <div className="profile-section">
          <h2>Profile Border Color</h2>
          <div className="color-picker">
            {BORDER_COLORS.map((color) => (
              <button
                key={color.value}
                className={`color-option ${selectedColor === color.value ? 'selected' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleUpdateColor(color.value)}
                disabled={isSaving}
                title={color.name}
              />
            ))}
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={logout} disabled={isSaving} className="btn-secondary">
            Log Out
          </button>
        </div>
      </div>

      <PlayerPickerModal
        isOpen={showPlayerPicker}
        players={players}
        teams={teams}
        selectedPlayerId={selectedPlayer}
        onSelect={handleUpdatePlayer}
        onClose={() => setShowPlayerPicker(false)}
      />

      <TeamPickerModal
        isOpen={showTeamPicker}
        teams={teams}
        selectedTeamId={selectedTeam}
        onSelect={handleUpdateTeam}
        onClose={() => setShowTeamPicker(false)}
      />
    </div>
  );
}
