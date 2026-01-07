import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../supabaseClient";
import type { Player, Team, Match } from "../../types";

export type SupabaseData = {
  players: Record<number, Player>;
  teams: Record<number, Team>;
  matches: Match[];
};

// Calculate milliseconds until next midnight UTC
function getMillisecondsUntilMidnightUTC(): number {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  return nextMidnight.getTime() - now.getTime();
}

/**
 * Fetch all Supabase data (players, teams, matches) and cache until midnight UTC.
 */
export function useSupabaseData() {
  return useQuery({
    queryKey: ['supabaseData'],
    queryFn: async () => {
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*");

      if (matchesError) throw matchesError;

      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("id,name,team_id,species,bio");

      if (playersError) throw playersError;

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id,name");

      if (teamsError) throw teamsError;

      const playersMap: Record<number, Player> = {};
      playersData?.forEach((p: Player) => {
        playersMap[p.id] = p;
      });

      const teamsMap: Record<number, Team> = {};
      teamsData?.forEach((t: Team) => {
        teamsMap[t.id] = t;
      });

      return {
        players: playersMap,
        teams: teamsMap,
        matches: (matchesData as Match[]) || [],
      };
    },
    staleTime: getMillisecondsUntilMidnightUTC(),
    gcTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Fetch matches for a specific date and related players/teams; cache until midnight UTC.
 */
export function useMatchesByDate(date: string) {
  return useQuery({
    queryKey: ['matchesByDate', date],
    queryFn: async () => {
      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("date", date);

      if (matchesError) throw matchesError;

      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("id,name,team_id,species,bio");

      if (playersError) throw playersError;

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id,name");

      if (teamsError) throw teamsError;

      const playersMap: Record<number, Player> = {};
      playersData?.forEach((p: Player) => {
        playersMap[p.id] = p;
      });

      const teamsMap: Record<number, Team> = {};
      teamsData?.forEach((t: Team) => {
        teamsMap[t.id] = t;
      });

      return {
        players: playersMap,
        teams: teamsMap,
        matches: (matchesData as Match[]) || [],
      };
    },
    staleTime: getMillisecondsUntilMidnightUTC(),
    gcTime: 1000 * 60 * 60 * 24,
  });
}
