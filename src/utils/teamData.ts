import { TEAM_DATA_FILES } from "../constants";
import type { TeamData } from "../types";

/**
 * Loads team data from the JSON file for a given team ID
 */
export async function loadTeamDataById(teamId: number): Promise<TeamData | null> {
  const dataPath = TEAM_DATA_FILES[teamId];
  if (!dataPath) {
    console.error(`No data file found for team ID ${teamId}`);
    return null;
  }

  try {
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`Failed to load team data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading team data for team ${teamId}:`, error);
    return null;
  }
}

/**
 * Loads team data from the JSON file for a given team name
 */
export async function loadTeamDataByName(teamName: string): Promise<TeamData | null> {
  const dataPath = `/${teamName}/teamdata.json`;

  try {
    const response = await fetch(dataPath);
    if (!response.ok) {
      throw new Error(`Failed to load team data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading team data for team ${teamName}:`, error);
    return null;
  }
}

/**
 * Gets the player photo from team data
 */
export function getPlayerPhoto(teamData: TeamData | null, playerId: number | string): string | null {
  if (!teamData) return null;
  const memberData = teamData.teamMembers[String(playerId)];
  return memberData?.photo || null;
}

/**
 * Gets the player photo thumbnail from team data
 */
export function getPlayerPhotoThumb(teamData: TeamData | null, playerId: number | string): string | null {
  if (!teamData) return null;
  const memberData = teamData.teamMembers[String(playerId)];
  return memberData?.photoThumb || null;
}

/**
 * Gets the player photo credit from team data
 */
export function getPlayerPhotoCredit(teamData: TeamData | null, playerId: number | string): string | null {
  if (!teamData) return null;
  const memberData = teamData.teamMembers[String(playerId)];
  return memberData?.photoCredit || null;
}
