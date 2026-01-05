// Team data file paths
export const TEAM_DATA_FILES: Record<number, string> = {
  1: "/aqua/teamdata.json",
  2: "/creature/teamdata.json",
  3: "/diva/teamdata.json",
  4: "/feathers/teamdata.json",
  5: "/primate/teamdata.json",
  6: "/scales/teamdata.json",
  7: "/silly/teamdata.json",
  8: "/smalls/teamdata.json",
};

// Points awarded for winning at each rank
export const RANK_POINTS: Record<string, number> = {
  quarter: 1,
  semi: 4,
  final: 8,
};

// Display labels for ranks
export const RANK_LABELS: Record<string, string> = {
  quarter: "Quarterfinal",
  semi: "Semifinal",
  final: "Final",
};

// Order for sorting ranks
export const RANK_ORDER: Record<string, number> = {
  quarter: 0,
  semi: 1,
  final: 2,
};
