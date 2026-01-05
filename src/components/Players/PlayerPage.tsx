import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import './PlayerPage.css';

type Player = { id: number; name: string; team_id: number };
type Team = { id: number; name: string };
type Match = { id: number; date: string; rank: string; rank_index: number; player_a: number; player_b: number; winner: number };

interface TeamMemberData {
  photo: string;
  photoThumb: string;
  photoCredit: string;
}

interface TeamData {
  teamName: string;
  teamId: string;
  bio: string;
  teamMembers: { [key: string]: TeamMemberData };
}

const teamDataFiles: { [key: number]: string } = {
  1: '/aqua/teamdata.json',
  2: '/creature/teamdata.json',
  3: '/diva/teamdata.json',
  4: '/feathers/teamdata.json',
  5: '/primate/teamdata.json',
  6: '/scales/teamdata.json',
  7: '/silly/teamdata.json',
  8: '/smalls/teamdata.json',
};

const rankPoints = {
  quarter: 1,
  semi: 4,
  final: 8,
};

function PlayerPage() {
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
      const teamId = player.team_id;
      const teamDataFile = teamDataFiles[teamId];

      if (teamDataFile) {
        try {
          const response = await fetch(teamDataFile);
          const data: TeamData = await response.json();
          setTeamData(data);
        } catch (error) {
          console.error('Error loading team data:', error);
        }
      }
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
      const points = match.rank === 'quarter' ? rankPoints.quarter : 
                     match.rank === 'semi' ? rankPoints.semi : 
                     match.rank === 'final' ? rankPoints.final : 0;
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
  const memberData = teamData?.teamMembers[playerId];

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
          {memberData && (
            <>
              <img 
                src={memberData.photo} 
                alt={player.name}
                className="player-image"
              />
              <a 
                href={memberData.photoCredit} 
                target="_blank" 
                rel="noopener noreferrer"
                className="player-photo-credit"
              >
                Photo Credit
              </a>
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

export default PlayerPage;
