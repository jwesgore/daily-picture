import { useEffect, useMemo, useState } from "react";
import { useMatchesByDate } from "../hooks/useSupabaseData";
import { loadTeamDataById, getPlayerPhoto } from "../utils/teamData";
import { RANK_LABELS, RANK_ORDER } from "../constants";
import type { Match } from "../types";

export default function Home() {
  const today = new Date().toISOString().slice(0, 10);
  const { data, isLoading, error } = useMatchesByDate(today);
  const [championImageSrc, setChampionImageSrc] = useState<string | null>(null);

  const players = data?.players ?? {};
  const teams = data?.teams ?? {};
  const matches = data?.matches ?? [];

  const sortedMatches = useMemo(() => {
    const byRank = (rank?: string) => RANK_ORDER[rank ?? ""] ?? 99;
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
      (a, b) => (RANK_ORDER[a] ?? 99) - (RANK_ORDER[b] ?? 99)
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

      const teamData = await loadTeamDataById(championPlayer.team_id);
      const photo = getPlayerPhoto(teamData, championId);
      
      if (!cancelled) {
        setChampionImageSrc(photo);
      }
    };

    loadChampionImage();

    return () => {
      cancelled = true;
    };
  }, [championId, players]);

  return (
    <main className="home">

      {isLoading && <p className="home__status">Loading today&apos;s bracket…</p>}
      {error && <p className="home__status home__status--error">{error.toString()}</p>}
      {!isLoading && !error && matches.length === 0 && (
        <p className="home__status">No matches recorded for today yet.</p>
      )}

      {!isLoading && !error && matches.length > 0 && (
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
                <div className="bracket__column-title">{RANK_LABELS[rank] ?? rank}</div>
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