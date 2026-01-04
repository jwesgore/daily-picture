import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Define types and constants
const TournamentRank = {
  Quarterfinals: "quarter",
  Semifinals: "semi",
  Finals: "final",
} as const;

type TournamentRank = typeof TournamentRank[keyof typeof TournamentRank];
type Team = { id: number; name: string; };
type Player = { 
  id: number; 
  teamId: number; 
  name: string; 
  species: string; 
  gamesPlayed?: number;
  gamesWon?: number;
  tournamentsWon?: number;
};
// Helper shuffle function
function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

// Helper pick random function
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Main tournament function
async function runTournament() {
  const today = new Date().toISOString().slice(0, 10);

  //Prevent double-run
  const { data: existing } = await supabase
    .from("matches")
    .select("id")
    .eq("date", today)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log("Tournament already ran today");
    return;
  }

  // Fetch teams and their players
  const { data: teams, error: teamErr } = await supabase
    .from("teams")
    .select("*");

  if (!teams) throw teamErr;

  if (teamErr || !teams) throw teamErr;

  const { data: players, error: playerErr } = await supabase
    .from("players")
    .select("*");

  if (playerErr || !players) throw playerErr;

  const typedTeams: Team[] = (teams || []) as unknown as Team[];
  const typedPlayers: Player[] = (players || []) as unknown as Player[];

  const reps: Player[] = typedTeams.map(team => {
    const teamPlayers = typedPlayers.filter(p => p.teamId === team.id);
    const pickedPlayer = pickRandom(teamPlayers);
    return pickedPlayer;
  });

  let shuffledPlayers = shuffle(reps);

  const matchesToInsert: any[] = [];
  const updatedPlayers: Map<number, Player> = new Map();

  function playRound(players: Player[], rank: TournamentRank): Player[] {
    const winners: Player[] = [];

    for (let i = 0; i < players.length; i += 2) {
      const playerA = players[i];
      const playerB = players[i + 1];

      if (!updatedPlayers.has(playerA.id)) {
        updatedPlayers.set(playerA.id, { ...playerA, gamesPlayed: playerA.gamesPlayed || 0, gamesWon: playerA.gamesWon || 0, tournamentsWon: playerA.tournamentsWon || 0 });
      }


      if (!playerB) {
        // Odd number of teams, playerA gets a bye
        winners.push(playerA);
        continue;
      }

      if (!updatedPlayers.has(playerB.id)) {
        updatedPlayers.set(playerB.id, { ...playerB, gamesPlayed: playerB.gamesPlayed || 0, gamesWon: playerB.gamesWon || 0, tournamentsWon: playerB.tournamentsWon || 0 });
      }

      const trackedPlayerB = updatedPlayers.get(playerB.id)!;
      trackedPlayerB.gamesPlayed = (trackedPlayerB.gamesPlayed || 0) + 1;

      const winner = Math.random() < 0.5 ? playerA : playerB;
      const trackedWinner = updatedPlayers.get(winner.id)!;
      trackedWinner.gamesWon = (trackedWinner.gamesWon || 0) + 1;

      if (rank === TournamentRank.Finals) {
        trackedWinner.tournamentsWon = (trackedWinner.tournamentsWon || 0) + 1;
      }

      winners.push(winner);

      matchesToInsert.push({
        date: today,
        rank,
        rankIndex: i + 1,
        playerA: playerA.id,
        playerB: playerB.id,
        winner: winner.id,
      });
    }

    return winners;
  }

  // Round 1: quarterfinals
  const semiWinners = playRound(shuffledPlayers, TournamentRank.Quarterfinals);
  // Round 2: semifinals
  const finalWinners = playRound(semiWinners, TournamentRank.Semifinals);
  // Round 3: final
  const [champion] = playRound(finalWinners, TournamentRank.Finals);
  console.log("Champion:", champion.id);

  // Insert matches into Supabase
  const { error: insertErr } = await supabase
    .from("matches")
    .insert(matchesToInsert);

  if (insertErr) throw insertErr;

  // Update player stats in Supabase
  for (const [playerId, player] of updatedPlayers) {
    const { error: updateErr } = await supabase
      .from("players")
      .update({
        gamesPlayed: player.gamesPlayed,
        gamesWon: player.gamesWon,
        tournamentsWon: player.tournamentsWon,
      })
      .eq("id", playerId);

    if (updateErr) {
      console.error(`Error updating player ${playerId}:`, updateErr);
      throw updateErr;
    }
  }

  console.log("Tournament complete");
}

runTournament().catch(console.error);