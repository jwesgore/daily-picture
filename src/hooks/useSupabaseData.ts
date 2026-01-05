import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import type { Player, Team, Match } from "../types";

export type SupabaseData = {
  players: Record<number, Player>;
  teams: Record<number, Team>;
  matches: Match[];
};

export type SupabaseDataState = {
  data: SupabaseData | null;
  loading: boolean;
  error: string | null;
};

/**
 * Custom hook to fetch all Supabase data (players, teams, matches)
 * Returns data in a normalized format with players and teams as lookup objects
 */
export function useSupabaseData(): SupabaseDataState {
  const [data, setData] = useState<SupabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
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

        // Normalize data into lookup objects
        const playersMap: Record<number, Player> = {};
        playersData?.forEach((p: Player) => {
          playersMap[p.id] = p;
        });

        const teamsMap: Record<number, Team> = {};
        teamsData?.forEach((t: Team) => {
          teamsMap[t.id] = t;
        });

        setData({
          players: playersMap,
          teams: teamsMap,
          matches: (matchesData as Match[]) || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return { data, loading, error };
}

/**
 * Custom hook to fetch matches for a specific date
 */
export function useMatchesByDate(date: string): SupabaseDataState {
  const [data, setData] = useState<SupabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
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

        setData({
          players: playersMap,
          teams: teamsMap,
          matches: (matchesData as Match[]) || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [date]);

  return { data, loading, error };
}
