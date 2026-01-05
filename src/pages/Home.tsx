import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

type Match = {
  id: number;
  date: string;
  rank: "quarter" | "semi" | "final" | string;
  rank_index: number;
  player_a: number;
  player_b: number | null;
  winner: number;
};

type Player = { id: number; name: string; team_id: number };
type Team = { id: number; name: string };

const rankLabels: Record<string, string> = {
  quarter: "Quarterfinal",
  semi: "Semifinal",
  final: "Final",
};
const rankOrder: Record<string, number> = { quarter: 0, semi: 1, final: 2 };
const teamDataFiles: Record<number, string> = {
  1: "/aqua/teamdata.json",
  2: "/creature/teamdata.json",
  3: "/diva/teamdata.json",
  4: "/feathers/teamdata.json",
  5: "/primate/teamdata.json",
  6: "/scales/teamdata.json",
  7: "/silly/teamdata.json",
  8: "/smalls/teamdata.json",
};

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Record<number, Player>>({});
  const [teams, setTeams] = useState<Record<number, Team>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [championImageSrc, setChampionImageSrc] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: matchesData, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .eq("date", today)
        .order("rank_index", { ascending: true });

      if (matchesError) {
        setError(matchesError.message);
        setLoading(false);
        return;
      }

      const { data: playersData, error: playersError } = await supabase
        .from("players")
        .select("id,name,team_id");

      if (playersError) {
        setError(playersError.message);
        setLoading(false);
        return;
      }

      const { data: teamsData, error: teamsError } = await supabase
        .from("teams")
        .select("id,name");

      if (teamsError) {
        setError(teamsError.message);
        setLoading(false);
        return;
      }

      setMatches(matchesData || []);
      setPlayers(Object.fromEntries((playersData || []).map((p) => [p.id, p])));
      setTeams(Object.fromEntries((teamsData || []).map((t) => [t.id, t])));
      setLoading(false);
    };

    load();
  }, [today]);

  const sortedMatches = useMemo(() => {
    const byRank = (rank?: string) => rankOrder[rank ?? ""] ?? 99;
    return [...matches].sort((a, b) => {
      const rankDiff = byRank(a.rank) - byRank(b.rank);
      return rankDiff !== 0 ? rankDiff : (a.rank_index ?? 0) - (b.rank_index ?? 0);
    });
  }, [matches]);

  const playerLabel = (id?: number | null) => {
    if (!id) return "Bye";
    const player = players[id];
    if (!player) return `Player ${id}`;
    const team = teams[player.team_id];
    return team ? `${player.name} (${team.name})` : player.name;
  };

  const championId = sortedMatches.find((m) => m.rank === "final")?.winner;
  const champion = championId ? players[championId] : undefined;

  const bracket = useMemo(() => {
    const by: Record<string, Match[]> = {};
    for (const match of sortedMatches) {
      if (!by[match.rank]) by[match.rank] = [];
      by[match.rank].push(match);
    }
    const ranks = Object.keys(by).sort(
      (a, b) => (rankOrder[a] ?? 99) - (rankOrder[b] ?? 99)
    );
    return { by, ranks };
  }, [sortedMatches]);

  useEffect(() => {
    let cancelled = false;

    const loadChampionImage = async () => {
      if (!championId) {
        setChampionImageSrc(null);
        return;
      }

      const championPlayer = players[championId];
      if (!championPlayer) {
        setChampionImageSrc(null);
        return;
      }

      const dataPath = teamDataFiles[championPlayer.team_id];
      if (!dataPath) {
        setChampionImageSrc(null);
        return;
      }

      try {
        const response = await fetch(dataPath);
        if (!response.ok) throw new Error(`Failed to load ${dataPath}`);
        const data = await response.json();
        const photo = data?.teamMembers?.[String(championId)]?.photo ?? null;
        if (!cancelled) setChampionImageSrc(photo);
      } catch (e) {
        console.error(e);
        if (!cancelled) setChampionImageSrc(null);
      }
    };

    loadChampionImage();

    return () => {
      cancelled = true;
    };
  }, [championId, players]);

  return (
    <main className="home">

      {loading && <p className="home__status">Loading today&apos;s bracket…</p>}
      {error && <p className="home__status home__status--error">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="home__status">No matches recorded for today yet.</p>
      )}

      {!loading && !error && matches.length > 0 && (
        <>
          <header className="home__header">
            <h1>Today&apos;s Winner</h1>
            <p>{today}</p>
          </header>
          <p className="home__subnote">New Winner Picked Every Day 12 AM UTC</p>

          {champion && (
            <section className="home__champion">
              <h2 className="home__champion-name">{champion.name}</h2>
              {teams[champion.team_id]?.name && (
                <div className="home__champion-team">Team {teams[champion.team_id].name.charAt(0).toUpperCase() + teams[champion.team_id].name.slice(1)}</div>
              )}
              {championImageSrc && (
                <img
                  src={championImageSrc}
                  alt={`${champion.name} from ${teams[champion.team_id]?.name ?? "unknown team"}`}
                  className="home__champion-image"
                />
              )}
            </section>
          )}

          <div className="bracket">
            {bracket.ranks.map((rank) => (
              <div className="bracket__column" key={rank}>
                <div className="bracket__column-title">{rankLabels[rank] ?? rank}</div>
                {bracket.by[rank]?.map((match) => (
                  <article
                    className="match-card"
                    key={match.id ?? `${match.rank}-${match.rank_index}`}
                  >
                    <div className="match-card__meta">
                      <span>Match {match.rank_index}</span>
                    </div>

                    <div
                      className={`match-card__row ${
                        match.winner === match.player_a ? "winner" : ""
                      }`}
                    >
                      <span>{playerLabel(match.player_a)}</span>
                      {match.winner === match.player_a && <span className="pill">Win</span>}
                    </div>

                    <div
                      className={`match-card__row ${
                        !match.player_b
                          ? "bye"
                          : match.winner === match.player_b
                          ? "winner"
                          : ""
                      }`}
                    >
                      <span>{playerLabel(match.player_b)}</span>
                      {match.player_b && match.winner === match.player_b && (
                        <span className="pill">Win</span>
                      )}
                      {!match.player_b && <span className="pill pill--muted">Bye</span>}
                    </div>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}