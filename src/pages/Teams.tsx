import TeamQuickView from "../components/Teams/TeamQuickView";
import styles from "./Teams.module.css";

export default function Teams() {
  return (
    <main className={styles.teamsPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Teams</h1>
        <p className={styles.subtitle}>Explore all competing teams and their members</p>
      </header>
      <div className={styles.teamsGrid}>
        <TeamQuickView teamData="/aqua/teamdata.json" teamId={1} />
        <TeamQuickView teamData="/creature/teamdata.json" teamId={2} />
        <TeamQuickView teamData="/diva/teamdata.json" teamId={3} />
        <TeamQuickView teamData="/feathers/teamdata.json" teamId={4} />
        <TeamQuickView teamData="/primate/teamdata.json" teamId={5} />
        <TeamQuickView teamData="/scales/teamdata.json" teamId={6} />
        <TeamQuickView teamData="/silly/teamdata.json" teamId={7} />
        <TeamQuickView teamData="/smalls/teamdata.json" teamId={8} />
      </div>
    </main>
  );
}