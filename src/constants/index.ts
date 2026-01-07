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
