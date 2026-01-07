import { TEAM_DATA, TEAM_DATA_BY_NAME } from "../data/teamData";
import type { TeamData } from "../types";

/**
 * Returns team data by numeric ID from the compiled models.
 */
export function loadTeamDataById(teamId: number): TeamData | null {
  return TEAM_DATA[teamId] ?? null;
}

/**
 * Returns team data by team slug/name from the compiled models.
 */
export function loadTeamDataByName(teamName: string): TeamData | null {
  const key = teamName.toLowerCase();
  return TEAM_DATA_BY_NAME[key] ?? null;
}

/**
 * Gets the player photo from team data
 */
export function getPlayerPhoto(teamData: TeamData | null, playerId: number | string): string | null {
  if (!teamData) return null;
  const memberData = teamData.teamMembers[Number(playerId)];
  return memberData?.photo || null;
}

/**
 * Gets the player photo thumbnail from team data
 */
export function getPlayerPhotoThumb(teamData: TeamData | null, playerId: number | string): string | null {
  if (!teamData) return null;
  const memberData = teamData.teamMembers[Number(playerId)];
  return memberData?.photoThumb || null;
}

/**
 * Gets the player photo credit from team data
 */
export function getPlayerPhotoCredit(teamData: TeamData | null, playerId: number | string): string | null {
  if (!teamData) return null;
  const memberData = teamData.teamMembers[Number(playerId)];
  return memberData?.photoCredit || null;
}
