import { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPlayerPhoto, getPlayerPhotoCredit } from '../../utils/teamData';
import { RANK_POINTS } from '../../constants';
import {
  usePlayerData,
  useTeamPlayers,
  useTeam,
  usePlayerMatches,
  useTeamData,
  usePrefetchPlayer
} from '../../hooks/queries/usePlayerQueries';
import './PlayerPage.css';

export default function PlayerPage() {
  const { playerId } = useParams();
  const playerIdNum = useMemo(() => Number(playerId), [playerId]);
  const prefetchPlayer = usePrefetchPlayer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [playerId]);

  const { data: player, isLoading: playerLoading, error: playerError } = usePlayerData(playerIdNum);
  const { data: players } = useTeamPlayers(player?.team_id);
  const { data: team } = useTeam(player?.team_id);
  const { data: matches } = usePlayerMatches(playerIdNum);
  const { data: teamData } = useTeamData(player?.team_id);

  const playerStats = useMemo(() => {
    if (!player || !matches) return null;

    const playerMatches = matches.filter(
      m => m.player_a === playerIdNum || m.player_b === playerIdNum
    );
    const wins = playerMatches.filter(m => m.winner === playerIdNum);
    const losses = playerMatches.filter(m => m.winner !== playerIdNum);
    const score = wins.reduce((sum, match) => sum + (RANK_POINTS[match.rank] || 0), 0);
    const winRate = playerMatches.length > 0
      ? ((wins.length / playerMatches.length) * 100).toFixed(1)
      : '0.0';

    return { wins: wins.length, losses: losses.length, score, winRate };
  }, [player, matches, playerIdNum]);

  const teammates = useMemo(() => {
    if (!player || !players) return [];
    return Object.values(players).filter(
      p => p.team_id === player.team_id && p.id !== player.id
    );
  }, [player, players]);

  if (playerLoading && !player) {
    return <div className="player-page-loading">Loading...</div>;
  }

  if (playerError || !player || !playerStats) {
    return <div className="player-page-error">Player not found</div>;
  }

  const { wins, losses, score, winRate } = playerStats;
  const playerPhoto = getPlayerPhoto(teamData || null, playerId!);
  const photoCredit = getPlayerPhotoCredit(teamData || null, playerId!);

  return (
    <div className="player-page">
      <header className="player-header">
        {team && (
          <Link to={`/teams/${team.name}`} className="player-team-link">
            ← Team {team.name.charAt(0).toUpperCase() + team.name.slice(1)}
          </Link>
        )}
        <h1>{player.name}</h1>
        <p className="player-species">{player.species}</p>
      </header>

      <div className="player-content">
        <section className="player-image-section">
          {playerPhoto && (
            <>
              <img src={playerPhoto} alt={player.name} className="player-image" />
              {photoCredit && (
                <a
                  href={photoCredit}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="player-photo-credit"
                >
                  Photo Credit
                </a>
              )}
            </>
          )}
        </section>

        <section className="player-stats-section">
          <h2>Player Statistics</h2>
          <div className="player-stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Score</div>
              <div className="stat-value">{score}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Wins</div>
              <div className="stat-value">{wins}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Losses</div>
              <div className="stat-value">{losses}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">{winRate}%</div>
            </div>
          </div>

          <div className="player-info">
            <h3>About</h3>
            <p>{player.bio}</p>
          </div>
        </section>
      </div>

      {teammates.length > 0 && (
        <section className="teammates-section">
          <h2>Meet the Rest of the Team</h2>
          <div className="teammates-grid">
            {teammates.map((teammate) => {
              const teammatePhoto = getPlayerPhoto(teamData || null, String(teammate.id));
              return (
                <Link
                  key={teammate.id}
                  to={`/player/${teammate.id}`}
                  className="teammate-card"
                  onMouseEnter={() => prefetchPlayer(teammate.id)}
                >
                  {teammatePhoto && (
                    <img src={teammatePhoto} alt={teammate.name} className="teammate-image" />
                  )}
                  <div className="teammate-name">{teammate.name}</div>
                  <div className="teammate-species">{teammate.species}</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
