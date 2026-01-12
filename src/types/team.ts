/**
 * Team data types from JSON files
 */
export type TeamMemberData = {
  photo: string;
  photoThumb: string;
  photoCredit: string;
};

export type TeamData = {
  background: string;
  backgroundCredit: string;
  teamName: string;
  teamId: number;
  bio: string;
  teamMembers: Record<number, TeamMemberData>;
};
