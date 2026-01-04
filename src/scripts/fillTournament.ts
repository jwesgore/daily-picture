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
    gamesPlayed: number;
    gamesWon: number;
    tournamentsWon: number;
};

// Helper shuffle function
function shuffle<T>(array: T[]): T[] {
  return array.sort(() => Math.random() - 0.5);
}

// Helper pick random function
function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Main tournament function for a specific date
async function runTournamentForDate(dateStr: string, teams: any[], players: any[]) {
  // Check if tournament already ran for this date
  const { data: existing } = await supabase
    .from("matches")
    .select("id")
    .eq("date", dateStr)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`Tournament already ran for ${dateStr}`);
    return;
  }

  const typedTeams: Team[] = (teams || []) as unknown as Team[];
  const typedPlayers: Player[] = (players || []) as unknown as Player[];

  const reps: Player[] = typedTeams.map(team => {
    const teamPlayers = typedPlayers.filter(p => p.teamId === team.id);
    const pickedPlayer = pickRandom(teamPlayers);
    return pickedPlayer;
  });

  let shuffledPlayers = shuffle(reps);

  const matchesToInsert: any[] = [];
  const updatedPlayers: Player[] = [];

  function playRound(players: Player[], rank: TournamentRank): Player[] {
    const winners: Player[] = [];

    for (let i = 0; i < players.length; i += 2) {
      const playerA = players[i];
      const playerB = players[i + 1];

      playerA.gamesPlayed += 1;
      playerB.gamesPlayed += 1;

      if (!playerA.id || updatedPlayers.find(p => p.id === playerA.id) === undefined) {
        updatedPlayers.push(playerA);
      }
      if (playerB && (!playerB.id || updatedPlayers.find(p => p.id === playerB.id) === undefined)) {
        updatedPlayers.push(playerB);
      }

      if (!playerB) {
        // Odd number of teams, playerA gets a bye
        winners.push(playerA);
        continue;
      }

      const winner = Math.random() < 0.5 ? playerA : playerB;

      winner.gamesWon += 1;

      if (rank === TournamentRank.Finals) {
        winner.tournamentsWon += 1;
      }

      winners.push(winner);

      matchesToInsert.push({
        date: dateStr,
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
  console.log(`${dateStr} Champion: ${champion.name}`);

  // Insert matches into Supabase
  const { error: insertErr } = await supabase
    .from("matches")
    .insert(matchesToInsert);

  if (insertErr) throw insertErr;

  // Update player stats in Supabase
  for (const player of updatedPlayers) {
    const { error: updateErr } = await supabase
      .from("players")
      .update({
        gamesPlayed: player.gamesPlayed,
        gamesWon: player.gamesWon,
        tournamentsWon: player.tournamentsWon,
      })
      .eq("id", player.id);

    if (updateErr) {
      console.error(`Error updating player ${player.id}:`, updateErr);
      throw updateErr;
    }
  }

  console.log(`Tournament complete for ${dateStr}`);
}

// Generate dates for the last 10 days
function getLast10Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 9; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().slice(0, 10));
  }
  
  return dates;
}

// Main function to fill tournaments
async function fillTournaments() {
  // Fetch teams and players once
  const { data: teams, error: teamErr } = await supabase
    .from("teams")
    .select("*");

  if (teamErr || !teams) throw teamErr;

  const { data: players, error: playerErr } = await supabase
    .from("players")
    .select("*");

  if (playerErr || !players) throw playerErr;

  const dates = getLast10Days();
  console.log(`Running tournaments for dates: ${dates.join(', ')}`);

  for (const date of dates) {
    await runTournamentForDate(date, teams, players);
  }

  console.log("All tournaments complete!");
}

fillTournaments().catch(console.error);