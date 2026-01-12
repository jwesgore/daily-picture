/**
 * Statistics and aggregated data types
 */
export type PlayerStats = {
  id: number;
  name: string;
  team: string;
  wins: number;
  losses: number;
  score: number;
};

export type TeamStats = {
  id: number;
  name: string;
  wins: number;
  losses: number;
  score: number;
};

export type PlayerWithStats = {
  id: number;
  name: string;
  species: string;
  photo: string;
  wins: number;
  losses: number;
};
