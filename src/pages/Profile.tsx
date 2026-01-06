import { useEffect, useState } from 'react';
import { useAuth } from '../context/UserContext';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { loadTeamDataById, getPlayerPhotoThumb } from '../utils/teamData';
import Auth from '../components/Auth';
import PlayerPickerModal from '../components/PlayerPickerModal.tsx';
import TeamPickerModal from '../components/TeamPickerModal.tsx';
import './Profile.css';

export default function Profile() {
  const { user, logout, updateFavorites, isLoading: authLoading } = useAuth();
  const { data } = useSupabaseData();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);

  const teams = data?.teams ?? {};
  const players = data?.players ?? {};

  useEffect(() => {
    if (user) {
      setSelectedTeam(user.favorite_team_id || null);
      setSelectedPlayer(user.favorite_player_id || null);
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
    } catch (error) {
      console.error('Failed to update team:', error);
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
      await updateFavorites(undefined, playerId, thumbUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update player:', error);
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
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Favorite animal" />
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
