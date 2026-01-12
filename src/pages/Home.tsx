import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMatchesByDate } from "../hooks/queries/useSupabaseData";
import { loadTeamDataById, getPlayerPhoto, getPlayerPhotoThumb } from "../utils/teamData";
import { formatTeamName } from "../utils/formatters";
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

  // UI: allow users to reduce bracket clutter by showing only semi + final
  const [compactBracket, setCompactBracket] = useState(true);

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
    if (!championId) {
      setChampionImageSrc(null);
      return;
    }

    const championPlayer = players[championId];
    if (!championPlayer) {
      setChampionImageSrc(null);
      return;
    }

    const teamData = loadTeamDataById(championPlayer.team_id);
    const photo = getPlayerPhoto(teamData, championId);
    setChampionImageSrc(photo);
  }, [championId, players]);

  return (
    <main className="home home--compact">

      {isLoading && <p className="home__status">Loading today&apos;s bracket…</p>}
      {error && <p className="home__status home__status--error">{error.toString()}</p>}
      {!isLoading && !error && matches.length === 0 && (
        <p className="home__status">No matches recorded for today yet.</p>
      )}

      {!isLoading && !error && matches.length > 0 && (
        <>
          <section className="home-hero">
            <div className="home-hero__content">
              <div className="home-hero__image">
                {championImageSrc && (
                  <img
                    src={championImageSrc}
                    alt={champion ? `${champion.name}` : "Champion"}
                  />
                )}
              </div>
              <div className="home-hero__info">
                <div className="home-hero__kicker">Today&apos;s Winner</div>
                <h1 className="home-hero__title">{champion?.name}</h1>
                {champion && teams[champion.team_id]?.name && (
                  <div className="home-hero__team">
                    Team {formatTeamName(teams[champion.team_id].name)}
                  </div>
                )}
                <div className="home-hero__date">{today}</div>
                <div className="home-hero__cta">
                  <Link to={champion ? `/player/${champion.id}` : "/"} className="home-hero__btn">View Player</Link>
                  <a href={`/teams/${champion?.team_id}`} className="home-hero__btn home-hero__btn--secondary">View Team</a>
                </div>
              </div>
            </div>
            <div className="home-hero__subnote">New winner picked daily at 12 AM UTC</div>
          </section>

          <div className="bracket-header">
            <h2>Today&apos;s Bracket</h2>
            <div className="bracket-toggle">
              <button
                className={`bracket-toggle__btn ${compactBracket ? "active" : ""}`}
                onClick={() => setCompactBracket(true)}
              >Compact</button>
              <button
                className={`bracket-toggle__btn ${!compactBracket ? "active" : ""}`}
                onClick={() => setCompactBracket(false)}
              >Full</button>
            </div>
          </div>

          <div className="bracket">
            {(compactBracket
              ? bracket.ranks.filter((r) => r === "semi" || r === "final")
              : bracket.ranks
            ).map((rank) => (
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
                      <div className="match-card__player">
                        {match.player_a && (
                          <img
                            src={getPlayerPhotoThumb(loadTeamDataById(players[match.player_a]?.team_id), match.player_a) || ""}
                            alt={playerLabel(match.player_a)}
                            className="match-card__thumbnail"
                          />
                        )}
                        <span>{playerLabel(match.player_a)}</span>
                      </div>
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
                      <div className="match-card__player">
                        {match.player_b && (
                          <img
                            src={getPlayerPhotoThumb(loadTeamDataById(players[match.player_b]?.team_id), match.player_b) || ""}
                            alt={playerLabel(match.player_b)}
                            className="match-card__thumbnail"
                          />
                        )}
                        <span>{playerLabel(match.player_b)}</span>
                      </div>
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