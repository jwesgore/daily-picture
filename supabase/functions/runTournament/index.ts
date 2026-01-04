// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2";

// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define types and constants
const TournamentRank = {
  Quarterfinals: "quarter",
  Semifinals: "semi",
  Finals: "final",
} as const;

type TournamentRank = typeof TournamentRank[keyof typeof TournamentRank];
type Team = { id: number; name: string };
type Player = {
  id: number;
  team_id: number;
  name: string;
  species: string;
  games_played?: number;
  games_won?: number;
  tournaments_won?: number;
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

  // Prevent double-run
  const { data: existing } = await supabase
    .from("matches")
    .select("id")
    .eq("date", today)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log("Tournament already ran today");
    return { success: true, message: "Tournament already ran today" };
  }

  // Fetch teams and their players
  const { data: teams, error: teamErr } = await supabase
    .from("teams")
    .select("*");

  if (teamErr || !teams) throw teamErr;

  const { data: players, error: playerErr } = await supabase
    .from("players")
    .select("*");

  if (playerErr || !players) throw playerErr;

  const typedTeams: Team[] = (teams || []) as unknown as Team[];
  const typedPlayers: Player[] = (players || []) as unknown as Player[];

  const reps: Player[] = typedTeams.map((team) => {
    const teamPlayers = typedPlayers.filter((p) => p.team_id === team.id);
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
        updatedPlayers.set(playerA.id, {
          ...playerA,
          games_played: playerA.games_played || 0,
          games_won: playerA.games_won || 0,
          tournaments_won: playerA.tournaments_won || 0,
        });
      }

      const trackedPlayerA = updatedPlayers.get(playerA.id)!;
      trackedPlayerA.games_played = (trackedPlayerA.games_played || 0) + 1;

      if (!playerB) {
        // Odd number of teams, playerA gets a bye
        winners.push(playerA);
        continue;
      }

      if (!updatedPlayers.has(playerB.id)) {
        updatedPlayers.set(playerB.id, {
          ...playerB,
          games_played: playerB.games_played || 0,
          games_won: playerB.games_won || 0,
          tournaments_won: playerB.tournaments_won || 0,
        });
      }

      const trackedPlayerB = updatedPlayers.get(playerB.id)!;
      trackedPlayerB.games_played = (trackedPlayerB.games_played || 0) + 1;

      const winner = Math.random() < 0.5 ? playerA : playerB;
      const trackedWinner = updatedPlayers.get(winner.id)!;
      trackedWinner.games_won = (trackedWinner.games_won || 0) + 1;
      if (rank === TournamentRank.Finals) {
        trackedWinner.tournaments_won = (trackedWinner.tournaments_won || 0) + 1;
      }

      winners.push(winner);

      matchesToInsert.push({
        date: today,
        rank,
        rank_index: i / 2 + 1,
        player_a: playerA.id,
        player_b: playerB.id,
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
  console.log("Champion:", champion.name);

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
        games_played: player.games_played,
        games_won: player.games_won,
        tournaments_won: player.tournaments_won,
      })
      .eq("id", playerId);

    if (updateErr) {
      console.error(`Error updating player ${playerId}:`, updateErr);
      throw updateErr;
    }
  }

  return { success: true, message: "Tournament complete", champion: champion.name };
}

Deno.serve(async (req) => {
  try {
    const result = await runTournament();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Tournament error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/runTournament' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json'

*/