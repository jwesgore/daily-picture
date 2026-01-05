import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { loadTeamDataById, getPlayerPhoto, getPlayerPhotoCredit } from '../../utils/teamData';
import { RANK_POINTS } from '../../constants';
import type { Player, Team, Match, TeamData } from '../../types';
import './PlayerPage.css';

export default function PlayerPage() {
  const { playerId } = useParams();
  const [players, setPlayers] = useState<{ [key: number]: Player }>({});
  const [teams, setTeams] = useState<{ [key: number]: Team }>({});
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      const { data: playersData } = await supabase.from('players').select('*');
      const { data: teamsData } = await supabase.from('teams').select('*');
      const { data: matchesData } = await supabase.from('matches').select('*');

      const playersMap: { [key: number]: Player } = {};
      playersData?.forEach((p: Player) => {
        playersMap[p.id] = p as Player;
      });

      const teamsMap: { [key: number]: Team } = {};
      teamsData?.forEach((t: Team) => {
        teamsMap[t.id] = t as Team;
      });

      setPlayers(playersMap);
      setTeams(teamsMap);
      setMatches((matchesData as Match[]) || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const loadTeamData = async () => {
      if (!playerId || !players[Number(playerId)]) return;

      const player = players[Number(playerId)];
      const data = await loadTeamDataById(player.team_id);
      setTeamData(data);
    };

    loadTeamData();
  }, [playerId, players]);

  const playerStats = useMemo(() => {
    if (!playerId) return null;

    const id = Number(playerId);
    const player = players[id];
    if (!player) return null;

    const playerMatches = matches.filter(m => m.player_a === id || m.player_b === id);
    const wins = playerMatches.filter(m => m.winner === id);
    const losses = playerMatches.filter(m => m.winner !== id);

    const score = wins.reduce((sum, match) => {
      const points = RANK_POINTS[match.rank] || 0;
      return sum + points;
    }, 0);

    return {
      player,
      wins: wins.length,
      losses: losses.length,
      score,
      winRate: playerMatches.length > 0 ? ((wins.length / playerMatches.length) * 100).toFixed(1) : '0.0',
    };
  }, [playerId, players, matches]);

  if (loading) {
    return <div className="player-page-loading">Loading...</div>;
  }

  if (!playerId || !playerStats) {
    return <div className="player-page-error">Player not found</div>;
  }

  const { player, wins, losses, score, winRate } = playerStats;
  const team = teams[player.team_id];
  const playerPhoto = getPlayerPhoto(teamData, playerId!);
  const photoCredit = getPlayerPhotoCredit(teamData, playerId!);

  return (
    <div className="player-page">
      <div className="player-header">
        <h1>{player.name}</h1>
        {team && (
          <Link to={`/teams/${team.name}`} className="player-team-link">
            Team {team.name.charAt(0).toUpperCase() + team.name.slice(1)}
          </Link>
        )}
      </div>

      <div className="player-content">
        <div className="player-image-section">
          {playerPhoto && (
            <>
              <img 
                src={playerPhoto} 
                alt={player.name}
                className="player-image"
              />
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
        </div>

        <div className="player-stats-section">
          <h2>Tournament Statistics</h2>
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
            <p>
              {player.name} competes in the Daily Animal Tournament as a member of Team {team?.name.charAt(0).toUpperCase() + team?.name.slice(1)}.
              {wins > 0 && ` With ${wins} ${wins === 1 ? 'victory' : 'victories'} and a ${winRate}% win rate, `}
              {wins === 0 && ' As they continue their tournament journey, '}
              they {wins > losses ? 'have proven to be a formidable competitor' : 'are determined to climb the ranks'}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
