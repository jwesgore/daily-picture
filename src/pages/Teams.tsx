import { useMemo } from "react";
import TeamQuickView from "../components/Teams/TeamQuickView";
import { useSupabaseData } from "../hooks/queries/useSupabaseData";
import { calculateTeamStats } from "../services/statisticsService";
import styles from "./Teams.module.css";

const TEAM_CONFIGS = [
  { path: "/aqua/teamdata.json", id: 1 },
  { path: "/creature/teamdata.json", id: 2 },
  { path: "/diva/teamdata.json", id: 3 },
  { path: "/feathers/teamdata.json", id: 4 },
  { path: "/primate/teamdata.json", id: 5 },
  { path: "/scales/teamdata.json", id: 6 },
  { path: "/silly/teamdata.json", id: 7 },
  { path: "/smalls/teamdata.json", id: 8 },
];

export default function Teams() {
  const { data } = useSupabaseData();

  const allTeamStats = useMemo(() => {
    if (!data) return [];
    return calculateTeamStats(data.teams, data.players, data.matches);
  }, [data]);

  return (
    <main className={styles.teamsPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Teams</h1>
        <p className={styles.subtitle}>Explore all competing teams and their members</p>
      </header>
      <div className={styles.teamsGrid}>
        {TEAM_CONFIGS.map(({ path, id }) => {
          const stats = allTeamStats.find(t => t.id === id);
          return (
            <TeamQuickView 
              key={id}
              teamData={path} 
              teamId={id}
              preloadedStats={stats}
            />
          );
        })}
      </div>
    </main>
  );
}