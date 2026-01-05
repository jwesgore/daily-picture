// Database types
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
  rank: "quarter" | "semi" | "final" | string;
  rank_index: number;
  player_a: number;
  player_b: number | null;
  winner: number;
};

// Team data JSON types
export type TeamMemberData = {
  photo: string;
  photoThumb: string;
  photoCredit: string;
};

export type TeamData = {
  background: string;
  backgroundCredit: string;
  teamName: string;
  teamId: string;
  bio: string;
  teamMembers: Record<string, TeamMemberData>;
};

// Statistics types
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
