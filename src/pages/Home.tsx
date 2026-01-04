import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";

type Match = { /* ...unchanged... */ };
type Player = { id: number; name: string; team_id: number };
type Team = { id: number; name: string };

const rankLabels = { quarter: "Quarterfinal", semi: "Semifinal", final: "Final" };
const rankOrder = { quarter: 0, semi: 1, final: 2 };
const teamSlugByName: Record<string, string> = {
  "Team Aqua": "aqua",
  "Team Creature": "creature",
  "Team Diva": "diva",
  "Team Feathers": "feathers",
  "Team Primate": "primate",
  "Team Scales": "scales",
  "Team Silly": "silly",
  "Team Smalls": "smalls",
};

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Record<number, Player>>({});
  const [teams, setTeams] = useState<Record<number, Team>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [championPhoto, setChampionPhoto] = useState<string | null>(null);
  const [championCredit, setChampionCredit] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

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
  const championName = championId ? playerLabel(championId) : null;

  useEffect(() => {
    let cancelled = false;

    const loadChampionPhoto = async () => {
      if (!championId) {
        setChampionPhoto(null);
        setChampionCredit(null);
        return;
      }

      const player = players[championId];
      const team = player ? teams[player.team_id] : null;
      const slug = team ? teamSlugByName[team.name] : undefined;

      if (!player || !slug) {
        setChampionPhoto(null);
        setChampionCredit(null);
        return;
      }

      setPhotoLoading(true);
      try {
        const teamDataResp = await fetch(`/${slug}/teamdata.json`);
        if (!teamDataResp.ok) throw new Error("team data fetch failed");
        const teamData: { teamMembers?: string[] } = await teamDataResp.json();

        for (const memberPath of teamData.teamMembers || []) {
          const memberResp = await fetch(memberPath);
          if (!memberResp.ok) continue;
          const member: { name?: string; photo?: string; photoCredit?: string } =
            await memberResp.json();
          if (member.name === player.name) {
            if (cancelled) return;
            setChampionPhoto(member.photo ?? null);
            setChampionCredit(member.photoCredit ?? null);
            setPhotoLoading(false);
            return;
          }
        }

        if (!cancelled) {
          setChampionPhoto(null);
          setChampionCredit(null);
          setPhotoLoading(false);
        }
      } catch (_err) {
        if (!cancelled) {
          setChampionPhoto(null);
          setChampionCredit(null);
          setPhotoLoading(false);
        }
      }
    };

    loadChampionPhoto();
    return () => {
      cancelled = true;
    };
  }, [championId, players, teams]);

  return (
    <main className="home">
      <header className="home__header">
        <h1>Today&apos;s Matches</h1>
        <p>{today}</p>
      </header>

      {loading && <p className="home__status">Loading today&apos;s bracket…</p>}
      {error && <p className="home__status home__status--error">{error}</p>}
      {!loading && !error && matches.length === 0 && (
        <p className="home__status">No matches recorded for today yet.</p>
      )}

      {!loading && !error && matches.length > 0 && (
        <>
          {championName && (
            <div className="home__champion">
              <div>
                <div className="home__champion-label">Champion</div>
                <div className="home__champion-name">{championName}</div>
                {photoLoading && <span className="pill pill--muted">Loading photo…</span>}
              </div>
              {championPhoto && (
                <figure className="champion-figure">
                  <img src={championPhoto} alt={`${championName} portrait`} loading="lazy" />
                  {championCredit && (
                    <figcaption>
                      Photo:{" "}
                      <a href={championCredit} target="_blank" rel="noreferrer">
                        source
                      </a>
                    </figcaption>
                  )}
                </figure>
              )}
            </div>
          )}

          <div className="matches-grid">
            {sortedMatches.map((match) => (
              <article
                className="match-card"
                key={match.id ?? `${match.rank}-${match.rank_index}`}
              >
                <div className="match-card__meta">
                  <span>{rankLabels[match.rank] ?? match.rank}</span>
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
        </>
      )}
    </main>
  );
}