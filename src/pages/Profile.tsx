import { useEffect, useState } from 'react';
import { useAuth } from '../context/UserContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import Auth from '../components/Auth';
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

  const teams = data?.teams ?? {};
  const players = data?.players ?? {};

  useEffect(() => {
    if (user) {
      setSelectedTeam(user.favorite_team_id || null);
      setSelectedPlayer(user.favorite_player_id || null);
      setSelectedColor(user.favorite_color || '#0066cc');
    }
  }, [user]);

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
      await updateFavorites(undefined, playerId);
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
      <div className="profile-container">
        <h1>My Profile</h1>

        <div className="profile-section">
          <p className="username">Username: <strong>{user.username}</strong></p>
        </div>

        <div className="profile-section">
          <h2>Favorite Team</h2>
          <select
            value={selectedTeam || ''}
            onChange={(e) => handleUpdateTeam(e.target.value ? parseInt(e.target.value) : null)}
            disabled={isSaving}
            className="select-input"
          >
            <option value="">Choose a team...</option>
            {Object.entries(teams).map(([id, team]) => (
              <option key={id} value={id}>
                {team.name.charAt(0).toUpperCase() + team.name.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="profile-section">
          <h2>Favorite Player</h2>
          <select
            value={selectedPlayer || ''}
            onChange={(e) => handleUpdatePlayer(e.target.value ? parseInt(e.target.value) : null)}
            disabled={isSaving}
            className="select-input"
          >
            <option value="">Choose a player...</option>
            {Object.entries(players).map(([id, player]) => (
              <option key={id} value={id}>
                {player.name} ({teams[player.team_id]?.name.charAt(0).toUpperCase() + teams[player.team_id]?.name.slice(1) || 'Unknown'})
              </option>
            ))}
          </select>
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

        {saved && <div className="saved-message">✓ Saved</div>}

        <div className="profile-actions">
          <button onClick={logout} disabled={isSaving} className="btn-secondary">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
