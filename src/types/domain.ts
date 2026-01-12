/**
 * Database types for core domain models
 */
export type Player = {
  id: number;
  name: string;
  team_id: number;
  species: string;
  bio: string;
};

export type Team = {
  id: number;
  name: string;
};

export type Match = {
  id: number;
  date: string;
  rank: 'quarter' | 'semi' | 'final' | string;
  rank_index: number;
  player_a: number;
  player_b: number | null;
  winner: number;
};
