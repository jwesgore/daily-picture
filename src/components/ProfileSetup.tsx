import { useState } from 'react';
import { useAuth } from '../context/UserContext';
import './ProfileSetup.css';

interface ProfileSetupProps {
  onComplete: () => void;
}

export default function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const { user, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (!displayName.trim()) {
        throw new Error('Display name is required');
      }

      await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim() || null,
      });

      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-setup-container">
      <div className="profile-setup-card">
        <h2>Complete Your Profile</h2>
        <p className="subtitle">Let other players know a bit about you</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="displayName">Display Name *</label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={saving}
              placeholder="Enter your display name"
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={saving}
              placeholder="Tell us about yourself (optional)"
              maxLength={500}
              rows={4}
            />
            <span className="char-count">{bio.length}/500</span>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={saving || !displayName.trim()}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}
