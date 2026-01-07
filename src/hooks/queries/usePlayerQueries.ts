import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../supabaseClient';
import { loadTeamDataById } from '../../utils/teamData';
import type { Player, Team, Match } from '../../types';

export function usePlayerData(playerIdNum: number) {
  return useQuery({
    queryKey: ['player', playerIdNum],
    queryFn: async () => {
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerIdNum)
        .single();

      if (error) throw error;
      return player as Player;
    },
    enabled: !!playerIdNum,
    placeholderData: (previousData) => previousData,
  });
}

export function useTeamPlayers(teamId: number | undefined) {
  return useQuery({
    queryKey: ['teamPlayers', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;

      const playersMap: { [key: number]: Player } = {};
      data?.forEach((p: Player) => {
        playersMap[p.id] = p;
      });
      return playersMap;
    },
    enabled: !!teamId,
    placeholderData: (previousData) => previousData,
  });
}

export function useTeam(teamId: number | undefined) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data as Team;
    },
    enabled: !!teamId,
    placeholderData: (previousData) => previousData,
  });
}

export function usePlayerMatches(playerIdNum: number) {
  return useQuery({
    queryKey: ['playerMatches', playerIdNum],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .or(`player_a.eq.${playerIdNum},player_b.eq.${playerIdNum}`);

      if (error) throw error;
      return (data as Match[]) || [];
    },
    enabled: !!playerIdNum,
    placeholderData: (previousData) => previousData,
  });
}

export function useTeamData(teamId: number | undefined) {
  return useQuery({
    queryKey: ['teamData', teamId],
    queryFn: () => (teamId ? loadTeamDataById(teamId) : null),
    enabled: !!teamId,
    placeholderData: (previousData) => previousData,
  });
}

export function usePrefetchPlayer() {
  const queryClient = useQueryClient();

  return (playerIdNum: number) => {
    queryClient.prefetchQuery({
      queryKey: ['player', playerIdNum],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerIdNum)
          .single();

        if (error) throw error;
        return data as Player;
      },
    });
  };
}
